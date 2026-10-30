'use client';

/* eslint-disable @next/next/no-img-element -- screenshots come from the API host, at their own sizes */
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '@/lib/cx';

type Labels = { prev: string; next: string };

/*
 * A project's screenshots on its page: one at a time in a row that swipes (native
 * scroll snapping, the page's direction), with arrows, a counter, thumbnails and
 * the arrow keys. Each picture is shown whole (tall phone shots included); the
 * first loads with the page, the rest as they come near.
 */
export function ProjectShots({ title, images, labels }: { title: string; images: string[]; labels: Labels }) {
    const track = useRef<HTMLDivElement>(null);
    const [index, setIndex] = useState(0);
    const many = images.length > 1;

    function go(to: number) {
        const target = Math.max(0, Math.min(images.length - 1, to));
        const slide = track.current?.children[target] as HTMLElement | undefined;
        const row = track.current;
        if (!slide || !row) return;
        // Scroll the row only (scrollIntoView would also move the page).
        const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const rtl = getComputedStyle(row).direction === 'rtl';
        row.scrollTo({ left: rtl ? -target * row.clientWidth : target * row.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
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
        <div onKeyDown={onKeyDown} className="-mx-4 overflow-hidden border-y border-line bg-surface shadow-card sm:mx-0 sm:rounded-card sm:border-x">
            <div className="relative bg-surface-sunken">
                <div
                    ref={track}
                    onScroll={onScroll}
                    tabIndex={0}
                    aria-label={title}
                    className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain outline-none [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-ink [&::-webkit-scrollbar]:hidden"
                >
                    {images.map((src, i) => (
                        <div key={src} className="grid h-[min(56dvh,300px)] w-full shrink-0 snap-start snap-always place-items-center p-3 sm:h-[min(72dvh,660px)] sm:p-8">
                            <img
                                src={src}
                                alt={many ? `${title} (${i + 1}/${images.length})` : title}
                                {...(i === 0 ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })}
                                decoding="async"
                                className="max-h-full max-w-full rounded-lg object-contain shadow-card"
                            />
                        </div>
                    ))}
                </div>

                {many && (
                    <>
                        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className={cx(control, 'start-3 sm:start-5')} aria-label={labels.prev}>
                            <ChevronLeft className="size-5 rtl:-scale-x-100" aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => go(index + 1)} disabled={index === images.length - 1} className={cx(control, 'end-3 sm:end-5')} aria-label={labels.next}>
                            <ChevronRight className="size-5 rtl:-scale-x-100" aria-hidden="true" />
                        </button>
                        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-0.5 text-[13px] font-bold text-white" dir="ltr" aria-live="polite">
                            {index + 1} / {images.length}
                        </span>
                    </>
                )}
            </div>

            {many && (
                <div className="flex gap-2.5 overflow-x-auto border-t border-line p-3 [scrollbar-width:none] sm:p-4 [&::-webkit-scrollbar]:hidden">
                    {images.map((src, i) => (
                        <button
                            key={src}
                            type="button"
                            onClick={() => go(i)}
                            aria-label={`${title} (${i + 1}/${images.length})`}
                            aria-current={i === index ? 'true' : undefined}
                            className={cx(
                                'h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 bg-surface-sunken transition-[border-color,opacity] duration-150 sm:h-[72px] sm:w-28',
                                i === index ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100',
                            )}
                        >
                            <img src={src} alt="" loading="lazy" decoding="async" className="size-full object-cover object-top" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
