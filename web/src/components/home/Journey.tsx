import type { Schemas } from '@/lib/api';
import type { Translate } from '@/lib/i18n';
import { cx } from '@/lib/cx';
import { NamedIconTile } from '../ui/NamedIconTile';
import { SectionHeader } from '../ui/SectionHeader';

/** All steps in one row once they fit (up to seven), balanced rows below that. */
export function stepColumns(count: number): string {
    return (
        {
            1: 'grid-cols-1',
            2: 'grid-cols-2',
            3: 'grid-cols-2 md:grid-cols-3',
            4: 'grid-cols-2 md:grid-cols-4',
            5: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-5',
            6: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
            7: 'grid-cols-2 md:grid-cols-4 xl:grid-cols-7',
        }[count] ?? 'grid-cols-2 md:grid-cols-4'
    );
}

/*
 * The project journey: numbered steps on the navy band (navy whatever its turn). In
 * dark mode the navy is close to the page background, so the band always takes
 * hairlines there. Phones and small tablets: a vertical timeline, a numbered circle
 * per step on a rail at the start side (each rail segment lights up as its step
 * scrolls up, globals.css [data-journey]); from md the cards.
 */
export function Journey({ journey, t }: { journey: Schemas['IconCard'][]; t: Translate }) {
    return (
        <section className="bg-navy py-16 text-white sm:py-24 dark:border-y dark:border-navy-line" data-journey>
            <div className="shell flex flex-col gap-10 sm:gap-12">
                <SectionHeader tone="navy" eyebrow={t('home.journey.eyebrow')} title={t('home.journey.title')} lead={t('home.journey.lead')} />

                <ol className={cx('grid max-md:grid-cols-1 md:gap-4', stepColumns(journey.length))}>
                    {journey.map((step, i) => (
                        <li
                            key={i}
                            className="relative max-md:grid max-md:grid-cols-[44px_minmax(0,1fr)] max-md:gap-x-4 max-md:gap-y-1 max-md:pb-6 max-md:last:pb-0 max-md:not-last:after:absolute max-md:not-last:after:start-[21px] max-md:not-last:after:top-11 max-md:not-last:after:bottom-0 max-md:not-last:after:w-0.5 max-md:not-last:after:bg-navy-line md:flex md:flex-col md:gap-2.5 md:rounded-box md:border md:border-navy-line md:bg-navy-card md:px-[18px] md:py-[22px]"
                            data-reveal
                        >
                            <div className="flex items-center justify-between gap-2 max-md:contents">
                                <NamedIconTile icon={step.icon} tone="navy" className="max-md:hidden" />
                                <span
                                    className="text-[28px] font-extrabold text-navy-number max-md:relative max-md:z-10 max-md:col-start-1 max-md:row-span-2 max-md:row-start-1 max-md:grid max-md:size-11 max-md:place-items-center max-md:self-start max-md:rounded-full max-md:border max-md:border-navy-line max-md:bg-navy-card max-md:text-base max-md:text-navy-glow"
                                    dir="ltr"
                                    aria-hidden="true"
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                            </div>
                            <h3 className="text-lg leading-[1.7] font-extrabold max-md:col-start-2 max-md:pt-1.5">
                                <span className="sr-only">{t('home.journey.step', { n: i + 1 })}: </span>
                                {step.title}
                            </h3>
                            <p className="text-sm leading-[1.6] text-navy-muted max-md:col-start-2 max-md:text-[15px]">{step.text}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
