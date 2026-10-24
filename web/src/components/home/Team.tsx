import type { Schemas } from '@/lib/api';
import type { Translate } from '@/lib/i18n';
import { cx } from '@/lib/cx';
import { NamedIconTile } from '../ui/NamedIconTile';
import { SectionHeader } from '../ui/SectionHeader';
import { stepColumns } from './Journey';

/*
 * The roles in the team. Phones: one roster card, a row per role under hairlines.
 * From sm the tiles, where an odd last role takes the whole row below md.
 */
export function Team({ team, t, white }: { team: Schemas['IconCard'][]; t: Translate; white: boolean }) {
    return (
        <section className={cx('py-16 sm:py-24', white && 'border-y border-line bg-surface')}>
            <div className="shell flex flex-col gap-10 sm:gap-12">
                <SectionHeader eyebrow={t('home.team.eyebrow')} title={t('home.team.title')} lead={t('home.team.lead')} />

                <ul
                    className={cx(
                        'max-sm:flex max-sm:flex-col max-sm:divide-y max-sm:divide-line max-sm:overflow-hidden max-sm:rounded-card max-sm:border max-sm:border-line max-sm:bg-surface sm:grid sm:gap-4',
                        stepColumns(team.length),
                    )}
                >
                    {team.map((role, i) => (
                        <li
                            key={i}
                            className="max-sm:flex max-sm:items-center max-sm:gap-4 max-sm:px-4 max-sm:py-3.5 max-sm:text-start sm:flex sm:flex-col sm:items-center sm:gap-2 sm:rounded-box sm:border sm:border-line sm:bg-surface sm:px-4 sm:py-6 sm:text-center max-md:odd:last:col-span-full"
                            data-reveal
                        >
                            <NamedIconTile icon={role.icon} size="lg" />
                            {/* One block beside the icon on phones; dissolves into the tile from sm. */}
                            <div className="min-w-0 sm:contents">
                                <h3 className="text-[17px] leading-[1.4] font-extrabold">{role.title}</h3>
                                <p className="text-sm leading-[1.5] text-ink-muted">{role.text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
