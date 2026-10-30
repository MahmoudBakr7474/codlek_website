/* eslint-disable @next/next/no-img-element -- screenshots come from the API host, at their own sizes */
import { ArrowUpRight, Images } from 'lucide-react';
import type { ProjectData } from '@/lib/api';
import { alignFor, dirOf, type Locale, type Translate } from '@/lib/i18n';
import { cx } from '@/lib/cx';
import { BrowserDots } from '../ui/BrowserDots';
import { NamedIconTile } from '../ui/NamedIconTile';
import { ProjectGallery } from './ProjectGallery';

/*
 * A project as a browser window: the real screenshot under a bar with the site's
 * address, then category, title, description and the address. A project with a
 * gallery opens it (the title, stretched, is the button; its link moves into the
 * dialog); otherwise a live site with a link makes the whole card one link.
 * "Coming soon" and projects without either are plain cards. Flat, as in the
 * design (a hairline, no shadow); a card that opens something lifts on hover.
 */
export function ProjectCard({
    project,
    locale,
    t,
    heading: Heading = 'h3',
    eager = false,
    className,
}: {
    project: ProjectData;
    locale: Locale;
    t: Translate;
    heading?: 'h2' | 'h3';
    eager?: boolean;
    /** Placement from the caller (a swipe row's item width); must not clash with the card's own classes. */
    className?: string;
}) {
    const linkable = project.isLinkable;
    const gallery = project.isComingSoon ? [] : (project.gallery ?? []);
    const interactive = linkable || gallery.length > 0;
    const titleDir = dirOf(project.title, locale);
    const descriptionDir = dirOf(project.description, locale);
    const align = alignFor(locale);

    return (
        <article
            className={cx(
                'group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface',
                interactive &&
                    'transition duration-300 hover:-translate-y-1 hover:border-primary-line hover:shadow-float active:border-primary-line active:duration-150 motion-safe:active:scale-[0.985] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[3px] has-[:focus-visible]:outline-primary-ink',
                className,
            )}
            data-reveal
        >
            <div className="bg-surface-sunken px-3.5 pt-3.5">
                <div className="overflow-hidden rounded-t-xl border border-b-0 border-line bg-surface">
                    <div className="flex h-[37px] items-center gap-1.5 border-b border-line px-2.5" dir="ltr" aria-hidden="true">
                        <BrowserDots />
                        {project.host && <span className="ms-2 min-w-0 truncate text-xs text-ink-muted">{project.host}</span>}
                    </div>

                    <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                        {project.imageUrl ? (
                            <img
                                src={project.imageUrl}
                                alt=""
                                {...(eager ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })}
                                decoding="async"
                                width={1200}
                                height={750}
                                className={cx(
                                    'shot size-full object-cover object-top transition duration-700 ease-out',
                                    interactive && 'group-hover:scale-[1.03]',
                                    project.isComingSoon && 'opacity-60 grayscale',
                                )}
                            />
                        ) : (
                            <div className="grid size-full place-items-center">
                                <NamedIconTile icon={project.category?.icon ?? 'layout-grid'} size="lg" />
                            </div>
                        )}

                        {project.isComingSoon && (
                            <span className="absolute inset-0 grid place-items-center">
                                <span className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-bold text-ink shadow-card">{t('projects.coming_soon')}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-2 p-5">
                {project.category && (
                    <span className="w-fit rounded-full bg-surface-chip px-3 py-0.5 text-[13px] font-bold text-ink-soft">{project.category.name}</span>
                )}

                <Heading dir={titleDir} className={cx('text-[19px] leading-[1.7] font-extrabold', titleDir && align)}>
                    {gallery.length > 0 ? (
                        <ProjectGallery
                            title={project.title}
                            category={project.category?.name}
                            description={project.description}
                            images={gallery}
                            url={linkable ? project.url : null}
                            host={project.host}
                            titleDir={titleDir}
                            descriptionDir={descriptionDir}
                            labels={{ close: t('close'), prev: t('projects.gallery_prev'), next: t('projects.gallery_next'), visit: t('projects.visit') }}
                        >
                            {project.title}
                        </ProjectGallery>
                    ) : linkable ? (
                        <a
                            href={project.url!}
                            target="_blank"
                            rel="noopener"
                            className="outline-none transition-colors group-hover:text-primary-ink after:absolute after:inset-0 after:rounded-card"
                        >
                            {project.title}
                        </a>
                    ) : (
                        project.title
                    )}
                </Heading>

                <p dir={descriptionDir} className={cx('line-clamp-3 flex-1 text-[15px] text-ink-muted', descriptionDir && align)}>
                    {project.description}
                </p>

                {gallery.length > 0 ? (
                    // What the card opens; the title above is the actual button.
                    <span className="inline-flex items-center gap-1.5 self-end text-[15px] font-bold text-primary-ink" aria-hidden="true">
                        <Images className="size-4 shrink-0" />
                        {t('projects.details')}
                    </span>
                ) : linkable && project.host && (
                    // The address, as in the design; the title above is the actual link.
                    <span className="inline-flex max-w-full items-center gap-1 self-end text-[15px] font-bold text-primary-ink" dir="ltr" aria-hidden="true">
                        <span className="truncate">{project.host}</span>
                        <ArrowUpRight className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                )}
            </div>
        </article>
    );
}
