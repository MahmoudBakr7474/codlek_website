import { NextResponse, type NextRequest } from 'next/server';

const API = (process.env.API_URL ?? 'http://localhost:5080').replace(/\/$/, '');

/** PublicEndpoints.PostsPerPage in the API. */
const POSTS_PER_PAGE = 9;

/*
 * Arabic is the default language at "/", English lives under "/en". Inside the
 * app every page sits under [locale], so an Arabic URL is rewritten to /ar/...
 * (the visitor keeps the clean URL) and /ar/... itself redirects to the clean one.
 */
export async function proxy(request: NextRequest) {
    const { pathname, search, searchParams } = request.nextUrl;

    if (pathname === '/ar' || pathname.startsWith('/ar/')) {
        const url = request.nextUrl.clone();
        url.pathname = pathname.slice(3) || '/';
        return NextResponse.redirect(url, 308);
    }

    const english = pathname === '/en' || pathname.startsWith('/en/');
    const locale = english ? 'en' : 'ar';
    const page = english ? pathname.slice(3) || '/' : pathname;

    if (await isMissingPage(page, searchParams)) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}/not-found`;
        url.search = '';
        return NextResponse.rewrite(url);
    }

    if (english) {
        return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `/ar${pathname === '/' ? '' : pathname}`;
    url.search = search;
    return NextResponse.rewrite(url);
}

/*
 * The article, project and blog pages stream, so a notFound() in them can only
 * add "noindex" to a 200. An unknown article or project, or a blog page past the
 * last, is caught here instead and rewritten to the 404 page. The sitemap (the
 * published slugs and project pages) is kept for a few minutes; one the list
 * doesn't have refreshes it first, at most every 10 seconds, so a post published
 * a moment ago opens at once. When the API can't be reached the page decides, as before.
 */
async function isMissingPage(page: string, searchParams: URLSearchParams): Promise<boolean> {
    const project = /^\/projects\/([^/]+)\/?$/.exec(page);
    const blog = /^\/blog(?:\/([^/]+))?\/?$/.exec(page);

    let exists: (known: Published) => boolean;
    if (project) {
        // Only the plain id is the page (not "025" or "25.0").
        const id = /^[1-9]\d{0,8}$/.test(project[1]) ? Number(project[1]) : NaN;
        exists = (known) => known.projects.has(id);
    } else if (blog?.[1]) {
        const slug = safeDecode(blog[1]);
        exists = (known) => known.slugs.has(slug);
    } else if (blog) {
        const number = Number(searchParams.get('page') ?? '1');
        if (!Number.isInteger(number) || number <= 1) {
            return false;
        }

        exists = (known) => number <= Math.ceil(known.slugs.size / POSTS_PER_PAGE);
    } else {
        return false;
    }

    const known = await publishedPages(false);
    if (known && exists(known)) {
        return false;
    }

    const fresh = await publishedPages(true);
    return fresh !== null && !exists(fresh);
}

type Published = { slugs: Set<string>; projects: Set<number> };

let published: (Published & { at: number }) | null = null;

async function publishedPages(refresh: boolean): Promise<Published | null> {
    const age = published ? Date.now() - published.at : Infinity;
    if (published && age < (refresh ? 10_000 : 5 * 60_000)) {
        return published;
    }

    try {
        const response = await fetch(`${API}/api/public/sitemap`, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
        if (!response.ok) {
            return published;
        }

        const data = (await response.json()) as { posts: { slug: string }[]; projects?: { id: number }[] };
        published = {
            slugs: new Set(data.posts.map((post) => post.slug)),
            projects: new Set((data.projects ?? []).map((project) => project.id)),
            at: Date.now(),
        };
        return published;
    } catch {
        return published;
    }
}

function safeDecode(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

export const config = {
    // Pages only: not Next's own files, the revalidation hook, metadata routes or files in public/.
    matcher: ['/((?!_next|api|sitemap\\.xml|robots\\.txt|favicon\\.ico|site\\.webmanifest|images/).*)'],
};
