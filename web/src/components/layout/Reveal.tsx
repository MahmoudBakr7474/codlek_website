'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/*
 * Scroll reveal for [data-reveal] blocks, and smooth in-page jumps once the page
 * and its font are in. "reveal-ready" tells the CSS this script runs, which
 * cancels its show-anyway fallback. Runs again on every client navigation, and
 * watches for blocks that stream in later.
 */
export function Reveal() {
    const pathname = usePathname();

    useEffect(() => {
        const root = document.documentElement;
        root.classList.add('reveal-ready');

        // The block a page was opened at (/services#web): shown at once, so the jump lands on its final position.
        try {
            const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
            for (let el = target?.closest<HTMLElement>('[data-reveal]'); el; el = el.parentElement?.closest<HTMLElement>('[data-reveal]')) {
                el.classList.add('is-visible');
                el.style.animation = 'none';
            }
        } catch {
            /* a malformed #fragment */
        }

        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
            return;
        }

        // Reading order of the blocks that enter together: top to bottom, then along the line
        // (right to left in Arabic). Uses the rects the observer has already measured.
        const order = (a: IntersectionObserverEntry, b: IntersectionObserverEntry) => {
            const dy = a.boundingClientRect.top - b.boundingClientRect.top;
            if (Math.abs(dy) > 8) return dy;
            const rtl = a.target.closest('[dir]')?.getAttribute('dir') === 'rtl';
            return rtl ? b.boundingClientRect.right - a.boundingClientRect.right : a.boundingClientRect.left - b.boundingClientRect.left;
        };

        const observer = new IntersectionObserver(
            (entries) => {
                // Blocks arriving together cascade 50ms apart (at most 300ms); one arriving
                // alone shows at once. A delay set in the markup (fixed pairings) is kept.
                let k = 0;
                const show = (el: HTMLElement) => {
                    if (el.classList.contains('is-visible')) return;
                    if (!el.style.getPropertyValue('--reveal-delay')) el.style.setProperty('--reveal-delay', `${Math.min(k, 6) * 50}ms`);
                    k++;
                    el.classList.add('is-visible');
                    observer.unobserve(el);
                };

                for (const entry of entries.filter((e) => e.isIntersecting).sort(order)) {
                    show(entry.target as HTMLElement);
                    // A swipe row clips its cards, so the observer never sees the ones past the
                    // edge: show the whole row with its first card, or they would be blank when swiped in.
                    const row = entry.target.closest<HTMLElement>('[data-reveal-row]');
                    if (row && row.scrollWidth > row.clientWidth) row.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach(show);
                }
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
        );

        const watch = () => document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => observer.observe(el));
        watch();
        const mutations = new MutationObserver(watch);
        mutations.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            mutations.disconnect();
        };
    }, [pathname]);

    useEffect(() => {
        // iOS Safari applies :active (the press feedback) only once the page listens to touches.
        const noop = () => {};
        document.addEventListener('touchstart', noop, { passive: true });

        const on = () => document.documentElement.classList.add('smooth-scroll');
        const afterFonts = () => document.fonts.ready.then(on, on);
        if (document.readyState === 'complete') afterFonts();
        else window.addEventListener('load', afterFonts, { once: true });
        return () => document.removeEventListener('touchstart', noop);
    }, []);

    return null;
}
