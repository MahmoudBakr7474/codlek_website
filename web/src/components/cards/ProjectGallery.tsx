'use client';

/* eslint-disable @next/next/no-img-element -- screenshots come from the API host, at their own sizes */
import { useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cx } from '@/lib/cx';
import { ButtonLink } from '../ui/Button';

type Labels = { close: string; prev: string; next: string; visit: string };

// False while rendering on the server and hydrating, true in the browser: the portal needs document.body.
const subscribeNothing = () => () => {};

/*
 * A project with more screenshots: the card's title is a button that opens the
 * project in a dialog, its pictures in a row that swipes one at a time (native
 * scroll snapping, the page's direction), with arrows, thumbnails and the arrow
 * keys. The dialog lives at the end of <body> (a portal), not inside the card's
 * heading, and the pictures load the first time it opens.
 */
export function ProjectGallery({
    title,
    category,
    description,
    images,
    url,
    host,
    titleDir,
    descriptionDir,
    labels,
    children,
}: {
    title: string;
    category?: string | null;
    description: string;
    images: string[];
    url?: string | null;
    host?: string | null;
    titleDir?: 'rtl' | 'ltr';
    descriptionDir?: 'rtl' | 'ltr';
    labels: Labels;
    children: ReactNode;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    const track = useRef<HTMLDivElement>(null);
    const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false);
    const [opened, setOpened] = useState(false);
    const [index, setIndex] = useState(0);
    const headingId = useId();
    const many = images.length > 1;

    // Every opening starts from the first picture.
    function open() {
        setOpened(true);
        setIndex(0);
        dialog.current?.showModal();
        track.current?.scrollTo({ left: 0 });
    }

    function go(to: number) {
        const target = Math.max(0, Math.min(images.length - 1, to));
        const slide = track.current?.children[target] as HTMLElement | undefined;
        const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        slide?.scrollIntoView({ inline: 'start', block: 'nearest', behavior: smooth ? 'smooth' : 'auto' });
    }

    // The slide in view, from the scroll position (negative in a right-to-left row).
    function onScroll() {
        const row = track.current;
        if (row) setIndex(Math.round(Math.abs(row.scrollLeft) / row.clientWidth));
    }

    function onKeyDown(event: React.KeyboardEvent) {
        if (!many || !(event.key === 'ArrowLeft' || event.key === 'ArrowRight')) return;
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const forward = event.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
        event.preventDefault();
        go(index + (forward ? 1 : -1));
    }

    const control =
        'absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 text-ink shadow-card backdrop-blur transition-[opacity,background-color] duration-150 hover:bg-surface disabled:pointer-events-none disabled:opacity-0';

    return (
        <>
            <button
                type="button"
                onClick={open}
                className="text-start outline-none transition-colors group-hover:text-primary-ink after:absolute after:inset-0 after:rounded-card"
            >
                {children}
            </button>

            {mounted &&
                createPortal(
                    <dialog
                        ref={dialog}
                        aria-labelledby={headingId}
                        onKeyDown={onKeyDown}
                        // A click on the backdrop (outside the panel) closes it.
                        onClick={(event) => event.target === event.currentTarget && dialog.current?.close()}
                        className="project-gallery m-auto w-[min(1100px,calc(100%-2rem))] max-w-none overflow-hidden rounded-2xl border border-line bg-surface p-0 text-ink shadow-float backdrop:bg-black/60 backdrop:backdrop-blur-sm max-sm:max-h-[calc(100dvh-1rem)] max-sm:w-[calc(100%-1rem)] sm:max-h-[calc(100dvh-3rem)]"
                    >
                        <div className="flex max-h-[inherit] flex-col">
                            <header className="flex items-start gap-3 border-b border-line px-4 py-3.5 sm:px-6 sm:py-4">
                                <div className="min-w-0 flex-1">
                                    {category && (
                                        <span className="mb-1 inline-block rounded-full bg-surface-chip px-3 py-0.5 text-[13px] font-bold text-ink-soft">{category}</span>
                                    )}
                                    <h2 id={headingId} dir={titleDir} className="text-lg leading-[1.6] font-extrabold sm:text-xl">
                                        {title}
                                    </h2>
                                </div>
                                <button type="button" onClick={() => dialog.current?.close()} className="icon-btn -m-1 size-11 min-w-11 shrink-0" aria-label={labels.close}>
                                    <X className="size-5" aria-hidden="true" />
                                </button>
                            </header>

                            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                                <div className="relative bg-surface-sunken">
                                    <div
                                        ref={track}
                                        onScroll={onScroll}
                                        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                    >
                                        {images.map((src, i) => (
                                            <div key={src} className="grid h-[min(46dvh,420px)] w-full shrink-0 snap-start snap-always place-items-center p-3 sm:h-[min(54dvh,560px)] sm:p-6">
                                                {opened && (
                                                    <img
                                                        src={src}
                                                        alt={many ? `${title} (${i + 1}/${images.length})` : title}
                                                        loading={i < 2 ? 'eager' : 'lazy'}
                                                        decoding="async"
                                                        className="max-h-full max-w-full rounded-lg object-contain shadow-card"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {many && (
                                        <>
                                            <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className={cx(control, 'start-3')} aria-label={labels.prev}>
                                                <ChevronLeft className="size-5 rtl:-scale-x-100" aria-hidden="true" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => go(index + 1)}
                                                disabled={index === images.length - 1}
                                                className={cx(control, 'end-3')}
                                                aria-label={labels.next}
                                            >
                                                <ChevronRight className="size-5 rtl:-scale-x-100" aria-hidden="true" />
                                            </button>
                                            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-0.5 text-[13px] font-bold text-white" dir="ltr" aria-live="polite">
                                                {index + 1} / {images.length}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {many && (
                                    <div className="flex gap-2 overflow-x-auto px-4 pt-3 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
                                        {images.map((src, i) => (
                                            <button
                                                key={src}
                                                type="button"
                                                onClick={() => go(i)}
                                                aria-label={`${title} (${i + 1}/${images.length})`}
                                                aria-current={i === index ? 'true' : undefined}
                                                className={cx(
                                                    'h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-surface-sunken transition-[border-color,opacity] duration-150',
                                                    i === index ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100',
                                                )}
                                            >
                                                {opened && <img src={src} alt="" loading="lazy" decoding="async" className="size-full object-cover object-top" />}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-end sm:px-6 sm:py-5">
                                    <p dir={descriptionDir} className="flex-1 text-[15px] leading-[1.9] text-ink-muted">
                                        {description}
                                    </p>
                                    {url && (
                                        <ButtonLink href={url} external iconEnd={ArrowUpRight} className="shrink-0 self-start sm:self-auto" title={host ?? undefined}>
                                            {labels.visit}
                                        </ButtonLink>
                                    )}
                                </div>
                            </div>
                        </div>
                    </dialog>,
                    document.body,
                )}
        </>
    );
}
