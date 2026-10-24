'use client';

import { useEffect, useRef } from 'react';

const NUMBER = /^(\d+(?:[.,]\d+)?)([+%]?)$/;

/**
 * A proof number ("500+", "98%", "7+") that counts up once when it comes into view.
 * The server renders the final value (no JS, crawlers, screen readers: the sr-only
 * copy), and an invisible copy holds the width so nothing shifts while it counts.
 * Values that aren't a plain number ("24/7", "4.9/5"), reduced motion, and a number
 * already on screen when the page opens stay as they are.
 */
export function CountUp({ value }: { value: string }) {
    const out = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = out.current;
        const match = NUMBER.exec(value.trim());
        if (!el || !match || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) return;

        const [, digits, suffix] = match;
        const separator = digits.includes(',') ? ',' : '.';
        const decimals = digits.split(/[.,]/)[1]?.length ?? 0;
        const target = Number(digits.replace(',', '.'));
        const format = (n: number) => n.toFixed(decimals).replace('.', separator) + suffix;

        let timer = 0;
        let frame = 0;
        el.textContent = format(0);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                observer.disconnect();
                timer = window.setTimeout(() => {
                    const start = performance.now();
                    const step = (now: number) => {
                        const t = Math.min(1, (now - start) / 800);
                        // The strong ease-out, as the CSS motion uses.
                        el.textContent = format(target * (1 - (1 - t) ** 4));
                        if (t < 1) frame = requestAnimationFrame(step);
                    };
                    frame = requestAnimationFrame(step);
                }, 150);
            },
            { threshold: 0.6 },
        );
        observer.observe(el);

        return () => {
            observer.disconnect();
            clearTimeout(timer);
            cancelAnimationFrame(frame);
            el.textContent = value;
        };
    }, [value]);

    return (
        <span className="inline-grid tabular-nums *:col-start-1 *:row-start-1">
            <span className="invisible" aria-hidden="true">
                {value}
            </span>
            <span ref={out} aria-hidden="true">
                {value}
            </span>
            <span className="sr-only">{value}</span>
        </span>
    );
}
