import { createElement } from 'react';
import { icons, type LucideIcon } from 'lucide-react';

/*
 * Lucide icons by the names saved in the admin ("shopping-cart"). Server-only by
 * design: it reaches into the full icon set, which must not end up in a client
 * bundle. Client components import their few icons directly from lucide-react.
 */

/** Names saved before Lucide 1.x renamed the icon (the data from the Laravel site uses them). */
const RENAMED: Record<string, string> = { 'building-2': 'building' };

export function lucide(name: string | null | undefined, fallback = 'circle'): LucideIcon {
    const pascal = (value: string) => value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    const current = name ? (RENAMED[name] ?? name) : name;
    const found = current && /^[a-z0-9-]+$/.test(current) ? icons[pascal(current) as keyof typeof icons] : undefined;
    return found ?? icons[pascal(fallback) as keyof typeof icons] ?? icons.Circle;
}

type IconProps = {
    name: string | null | undefined;
    fallback?: string;
    className?: string;
    strokeWidth?: number;
};

/** An unknown name draws the fallback instead of failing the page. */
export function Icon({ name, fallback, className, strokeWidth }: IconProps) {
    return createElement(lucide(name, fallback), { className, strokeWidth, 'aria-hidden': true });
}
