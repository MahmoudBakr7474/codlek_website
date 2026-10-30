import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { ProjectShots } from '@/components/projects/ProjectShots';
import { ButtonLink } from '@/components/ui/Button';
import { CtaBand } from '@/components/ui/CtaBand';
import { PageHero } from '@/components/ui/PageHero';
import { getProject, getSitemap } from '@/lib/api';
import { href, type Locale } from '@/lib/i18n';
import { pageContext } from '@/lib/page';
import { pageMetadata } from '@/lib/seo';

/** The projects with a page (those with a gallery) are prerendered; a new one is rendered on its first visit. */
export async function generateStaticParams() {
    const { projects } = await getSitemap();
    return projects.length > 0 ? projects.map((project) => ({ id: String(project.id) })) : [{ id: '0' }];
}

/** Only the plain id is the page: "025" or "abc" find nothing. */
async function projectFor(locale: Locale, params: Promise<{ id: string }>) {
    const { id } = await params;
    return /^[1-9]\d{0,8}$/.test(id) ? getProject(locale, Number(id)) : null;
}

export async function generateMetadata({ params }: PageProps<'/[locale]/projects/[id]'>): Promise<Metadata> {
    const { locale, site } = await pageContext(params);
    const project = await projectFor(locale, params);
    if (!project) {
        return {};
    }

    return pageMetadata({ locale, site, path: `/projects/${project.id}`, title: project.title, description: project.description, image: project.imageUrl });
}

/*
 * A project's own page: the header (where it belongs, its name, what it does and
 * its link, if live), its screenshots, then a call to get something like it built.
 */
export default async function ProjectPage({ params }: PageProps<'/[locale]/projects/[id]'>) {
    const { locale, t } = await pageContext(params);
    const project = await projectFor(locale, params);
    if (!project) {
        notFound();
    }

    const projects = href(locale, 'projects');
    const crumbs = [{ label: t('nav.projects'), href: projects }];
    if (project.category) {
        crumbs.push({ label: project.category.name, href: href(locale, 'projects', { category: project.category.slug }) });
    }

    return (
        <>
            <PageHero locale={locale} t={t} title={project.title} lead={project.description} crumbs={crumbs}>
                {project.isLinkable && project.url && (
                    <ButtonLink href={project.url} external iconEnd={ArrowUpRight} className="mt-7" title={project.host ?? undefined}>
                        {t('projects.visit')}
                    </ButtonLink>
                )}
            </PageHero>

            <section className="pt-16 sm:pt-24" aria-label={t('projects.details')}>
                <div className="shell">
                    <ProjectShots title={project.title} images={project.gallery} labels={{ prev: t('projects.gallery_prev'), next: t('projects.gallery_next') }} />

                    <Link href={projects} className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-btn font-bold text-primary-ink underline-offset-4 hover:underline">
                        <ArrowLeft className="size-[18px] shrink-0 rtl:-scale-x-100" aria-hidden="true" />
                        {t('cta.all_projects')}
                    </Link>
                </div>
            </section>

            <CtaBand locale={locale} t={t} title={t('projects.similar_title')} action={t('projects.similar_cta')} />
        </>
    );
}
