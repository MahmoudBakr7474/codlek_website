'use client';

import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { cx } from '@/lib/cx';
import { ButtonLink } from '../ui/Button';
import { WhatsAppIcon } from '../ui/BrandIcons';

/** Shown once the visitor has scrolled past the hero's own buttons. */
const SHOW_AFTER = 240;

const TYPING = 'input:not([type=checkbox],[type=radio],[type=file]),textarea,select';

/*
 * Phones (below `sm`): a bar in the thumb zone with the next step on every screen:
 * start a project, WhatsApp, call. It slides up after the hero, and steps aside
 * wherever the page already offers those ([data-bar-hide]: the hero's buttons, the
 * blue band, the footer, the contact page, the careers form), while a field is being
 * typed in (the keyboard is up) and while the menu is open (globals.css). Visibility
 * is in the transition list, so the exit plays before the bar leaves the tab order.
 */
export function MobileActionBar({
    label,
    contactHref,
    startLabel,
    whatsappHref,
    whatsappLabel,
    phoneHref,
    phoneLabel,
}: {
    label: string;
    contactHref: string;
    startLabel: string;
    whatsappHref: string;
    whatsappLabel: string;
    phoneHref: string;
    phoneLabel: string;
}) {
    const [past, setPast] = useState(false);
    const [covered, setCovered] = useState(false);
    const [typing, setTyping] = useState(false);

    useEffect(() => {
        const update = () => {
            const room = document.documentElement.scrollHeight - window.innerHeight;
            setPast(window.scrollY > SHOW_AFTER || room <= SHOW_AFTER);
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update, { passive: true });
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);

    // Any [data-bar-hide] on screen covers the bar; client navigations bring new ones.
    useEffect(() => {
        const onScreen = new Set<Element>();
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) onScreen.add(entry.target);
                else onScreen.delete(entry.target);
            }
            setCovered(onScreen.size > 0);
        });
        const watch = () => {
            for (const el of [...onScreen]) if (!el.isConnected) onScreen.delete(el);
            document.querySelectorAll('[data-bar-hide]').forEach((el) => observer.observe(el));
            setCovered(onScreen.size > 0);
        };
        watch();
        const mutations = new MutationObserver(watch);
        mutations.observe(document.body, { childList: true, subtree: true });
        return () => {
            observer.disconnect();
            mutations.disconnect();
        };
    }, []);

    useEffect(() => {
        const onIn = (e: FocusEvent) => setTyping(e.target instanceof Element && e.target.matches(TYPING));
        const onOut = () => setTyping(false);
        document.addEventListener('focusin', onIn);
        document.addEventListener('focusout', onOut);
        return () => {
            document.removeEventListener('focusin', onIn);
            document.removeEventListener('focusout', onOut);
        };
    }, []);

    const shown = past && !covered && !typing;

    return (
        <div
            id="action-bar"
            role="region"
            aria-label={label}
            className={cx(
                'fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 transition-[opacity,translate,visibility] ease-out sm:hidden',
                shown ? 'visible translate-y-0 opacity-100 duration-[240ms]' : 'pointer-events-none invisible translate-y-[calc(100%+1rem)] opacity-0 duration-150',
            )}
        >
            <div className="flex items-center gap-2 rounded-[18px] border border-line bg-surface p-2 shadow-float dark:border-line-strong dark:bg-surface-muted">
                <ButtonLink href={contactHref} size="md" className="min-w-0 flex-1">
                    {startLabel}
                </ButtonLink>
                <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener"
                    aria-label={whatsappLabel}
                    className="grid size-12 shrink-0 place-items-center rounded-btn bg-whatsapp text-white transition-[background-color,scale] duration-150 ease-out hover:bg-whatsapp-hover motion-safe:active:scale-[0.96]"
                >
                    <WhatsAppIcon className="size-[22px]" />
                </a>
                <a
                    href={phoneHref}
                    aria-label={phoneLabel}
                    className="grid size-12 shrink-0 place-items-center rounded-btn border-[1.5px] border-line-strong bg-surface text-ink-soft transition-[background-color,scale] duration-150 ease-out active:bg-surface-chip motion-safe:active:scale-[0.96]"
                >
                    <Phone className="size-5" aria-hidden="true" />
                </a>
            </div>
        </div>
    );
}
