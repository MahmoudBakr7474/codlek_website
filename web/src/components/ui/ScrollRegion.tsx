'use client';

import { useEffect, useRef, useState } from 'react';
import { cx } from '@/lib/cx';

/**
 * A swipe row (see snap-row.ts) for content without links of its own: while it
 * overflows (phones) it is a named region that takes focus, so the keyboard can
 * scroll it; where it fits (desktop) it is a plain element, with no extra tab stop.
 */
export function ScrollRegion({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const [overflowing, setOverflowing] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
        check();
        const observer = new ResizeObserver(check);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={cx(className, 'focus-visible:outline-offset-[-2px]')}
            data-reveal-row
            {...(overflowing && { tabIndex: 0, role: 'region', 'aria-label': label })}
        >
            {children}
        </div>
    );
}
