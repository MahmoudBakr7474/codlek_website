/* eslint-disable @next/next/no-img-element -- avatars come from the API host */
import type { Schemas } from '@/lib/api';
import { alignFor, dirOf, type Locale, type Translate } from '@/lib/i18n';
import { cx } from '@/lib/cx';
import { ScrollRegion } from '../ui/ScrollRegion';
import { SectionHeader } from '../ui/SectionHeader';
import { snapItem, snapRow } from '../ui/snap-row';

/** Avatars without a photo: the initial on a tone, cycling blue, magenta, teal, amber. */
const tones = ['bg-primary-soft text-primary-ink', 'bg-accent-soft text-accent-ink', 'bg-secondary-soft text-secondary', 'bg-steel-soft text-steel'];

/*
 * Client testimonials. The grid follows the count: one centred, 2 or 4 in two
 * columns, otherwise three; an odd card out spans the row while there are two columns.
 * Phones: one row that scrolls sideways (snap-row.ts).
 */
export function Testimonials({ testimonials, locale, t, white }: { testimonials: Schemas['TestimonialDto'][]; locale: Locale; t: Translate; white: boolean }) {
    const count = testimonials.length;
    const swipe = count > 1;
    const grid = count === 1 ? 'mx-auto w-full max-w-[760px]' : count === 2 || count === 4 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';
    const align = alignFor(locale);

    return (
        <section id="testimonials" className={cx('py-16 sm:py-24', white && 'border-y border-line bg-surface')}>
            <div className="shell flex flex-col gap-10 sm:gap-12">
                <SectionHeader eyebrow={t('home.testimonials.eyebrow')} title={t('home.testimonials.title')} />

                <List swipe={swipe} label={t('home.testimonials.title')} className={swipe ? cx(snapRow, 'sm:gap-6', grid) : cx('grid gap-6', grid)}>
                    {testimonials.map((testimonial, i) => {
                        const [quoteDir, nameDir, roleDir] = [dirOf(testimonial.quote, locale), dirOf(testimonial.name, locale), dirOf(testimonial.role, locale)];
                        return (
                            <figure
                                key={i}
                                className={cx(
                                    'flex flex-col gap-[18px] rounded-card border border-line bg-surface-muted p-6 sm:p-7',
                                    i === count - 1 && count > 2 && count % 2 === 1 && 'md:max-lg:col-span-2',
                                    swipe && cx(snapItem, 'w-[86%]'),
                                )}
                                data-reveal
                            >
                                {/* Gold stars with an amber outline; an empty one is an outline at 3:1, so a rating below five still reads at a glance. */}
                                <div className="flex gap-0.5" role="img" aria-label={t('home.testimonials.rating', { n: testimonial.rating })}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                            className={cx('size-[18px] shrink-0', star <= testimonial.rating ? 'fill-star stroke-star-line' : 'fill-none stroke-line-input')}
                                        >
                                            <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
                                        </svg>
                                    ))}
                                </div>

                                <blockquote dir={quoteDir} className={cx('flex-1 text-[17px] leading-[1.9] text-ink-quote', quoteDir && align)}>
                                    {locale === 'ar' ? '«' : '“'}
                                    {testimonial.quote}
                                    {locale === 'ar' ? '»' : '”'}
                                </blockquote>

                                <figcaption className="flex items-center gap-3 border-t border-line pt-4">
                                    {testimonial.avatarUrl ? (
                                        <img src={testimonial.avatarUrl} alt="" className="size-[46px] shrink-0 rounded-full object-cover" width={46} height={46} loading="lazy" decoding="async" />
                                    ) : (
                                        <span className={cx('grid size-[46px] shrink-0 place-items-center rounded-full text-lg font-extrabold', tones[i % tones.length])} aria-hidden="true">
                                            {[...testimonial.name][0]}
                                        </span>
                                    )}
                                    <div className="min-w-0">
                                        <div dir={nameDir} className={cx('text-base leading-[1.4] font-extrabold text-ink', nameDir && align)}>
                                            {testimonial.name}
                                        </div>
                                        {testimonial.role !== '' && (
                                            <div dir={roleDir} className={cx('text-sm text-ink-muted', roleDir && align)}>
                                                {testimonial.role}
                                            </div>
                                        )}
                                    </div>
                                </figcaption>
                            </figure>
                        );
                    })}
                </List>
            </div>
        </section>
    );
}

/** Several quotes: a swipe row on phones (a focusable region there, the quotes have no links). */
function List({ swipe, label, className, children }: { swipe: boolean; label: string; className: string; children: React.ReactNode }) {
    return swipe ? (
        <ScrollRegion label={label} className={className}>
            {children}
        </ScrollRegion>
    ) : (
        <div className={className}>{children}</div>
    );
}
