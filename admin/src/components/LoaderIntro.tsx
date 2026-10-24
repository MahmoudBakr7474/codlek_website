import { BLUE, LETTERS } from '../lib/logo';

/*
 * The site's loader intro (web/src/components/layout/PageLoader.tsx), copied for the
 * appearance page's preview: the mark assembles, the half-disc of the C arcs over and
 * becomes the "d", the bar and the dots stand up into the "l", then C, o, e and k come
 * in. Keep the two in step.
 */

const css = `
.cl-logo { --cl-t: 1; direction: ltr; }
.cl-svg { display: block; height: 56px; width: auto; overflow: visible; animation: cl-center calc(.7s * var(--cl-t)) cubic-bezier(.77, 0, .175, 1) calc(.52s * var(--cl-t)) both; }
.cl-svg * { transform-box: fill-box; transform-origin: center; }
.cl-q, .cl-letter, .cl-arrive, .cl-ghost-d { fill: currentColor; }
.cl-bar, .cl-dot, .cl-ghost-l { fill: ${BLUE}; }
.cl-q { animation: cl-pop calc(.42s * var(--cl-t)) cubic-bezier(.23, 1, .32, 1) both; }
.cl-q + .cl-q { animation-delay: calc(.07s * var(--cl-t)); }
.cl-bar { transform-origin: left center; animation: cl-slide calc(.42s * var(--cl-t)) cubic-bezier(.23, 1, .32, 1) calc(.16s * var(--cl-t)) both; }
.cl-dot { animation: cl-drop calc(.38s * var(--cl-t)) cubic-bezier(.23, 1, .32, 1) calc(var(--d) * var(--cl-t)) both,
    cl-breathe 1.4s ease-in-out calc(1.8s * var(--cl-t)) infinite; }
.cl-letter { animation: cl-in calc(.38s * var(--cl-t)) cubic-bezier(.23, 1, .32, 1) calc(var(--d) * var(--cl-t)) both; }
.cl-arrive { animation: cl-arrive calc(.18s * var(--cl-t)) cubic-bezier(.23, 1, .32, 1) calc(var(--d) * var(--cl-t)) both; }
.cl-ghost-d, .cl-ghost-l { opacity: 0; animation: cl-travel calc(.52s * var(--cl-t)) linear calc(var(--d) * var(--cl-t)) forwards; }
@keyframes cl-pop { from { opacity: 0; transform: scale(.85); } }
@keyframes cl-slide { from { opacity: 0; transform: translateX(10px) scaleX(.6); } }
@keyframes cl-drop { from { opacity: 0; transform: translateY(-10px) scale(.9); } }
@keyframes cl-breathe { 50% { transform: scale(.85); } }
@keyframes cl-in { from { opacity: 0; transform: translateX(-10px) scale(.96); } }
@keyframes cl-arrive { from { opacity: 0; transform: scale(.94); } }
@keyframes cl-travel {
    0% { opacity: 1; transform: none; animation-timing-function: cubic-bezier(.23, 1, .32, 1); }
    50% { transform: translate(calc(var(--tx) * .5), calc(var(--ty) * .5 - var(--lift))) rotate(calc(var(--r, 0deg) * .5)) scale(calc((1 + var(--s)) / 2)); animation-timing-function: cubic-bezier(.77, 0, .175, 1); }
    72% { opacity: 1; }
    100% { opacity: 0; transform: translate(var(--tx), var(--ty)) rotate(var(--r, 0deg)) scale(var(--s)); }
}
@keyframes cl-center { from { transform: translateX(37.99%); } }
@keyframes cl-fade { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
    .cl-svg * { animation: none; }
    .cl-ghost-d, .cl-ghost-l { display: none; }
    .cl-svg { animation: cl-fade .3s ease both; }
}`;

const box = (char: string) => LETTERS.find((letter) => letter.char === char)!.box;
const xHeight = box('o')[1];
const D = box('d');
const L = box('l');
const TRAVEL = 520;
const GHOST_D = 560;
const GHOST_L = 620;

const dScale = (D[3] - xHeight) / 61;
const ghostD = { tx: D[0] + (28 * dScale) / 2 - 14, ty: xHeight + (61 * dScale) / 2 - 30.5, s: dScale };

const lScale = (L[2] - L[0]) / 12;
const stemX = (L[0] + L[2]) / 2;
const lGap = (L[3] - L[1] - 52 * lScale) / 2;
const barY = L[1] + 14 * lScale;
const dot1Y = L[1] + 28 * lScale + lGap + 6 * lScale;
const dot2Y = dot1Y + 12 * lScale + lGap;

const letterAt: Record<string, number> = {
    C: 1000,
    o: 1060,
    d: GHOST_D + TRAVEL * 0.65,
    l: GHOST_L + 80 + TRAVEL * 0.65,
    e: 1120,
    k: 1180,
};

type Vars = { d: number; tx?: number; ty?: number; s?: number; lift?: number; r?: number };
const vars = ({ d, tx, ty, s, lift, r }: Vars) =>
    ({
        '--d': `${Math.round(d)}ms`,
        ...(tx !== undefined && { '--tx': `${tx.toFixed(2)}px`, '--ty': `${ty!.toFixed(2)}px`, '--s': s!.toFixed(4), '--lift': `${lift}px` }),
        ...(r !== undefined && { '--r': `${r}deg` }),
    }) as React.CSSProperties;

/** The intro, played once each time it mounts. */
export function LoaderIntro() {
    return (
        <div className="cl-logo">
            <style>{css}</style>
            <svg className="cl-svg" viewBox="0 0 254 61">
                {LETTERS.map((letter) => (
                    <path
                        key={letter.char}
                        className={letter.char === 'd' || letter.char === 'l' ? 'cl-arrive' : 'cl-letter'}
                        style={vars({ d: letterAt[letter.char] })}
                        d={letter.d}
                    />
                ))}
                <path className="cl-q" d="M0 28A28 28 0 0 1 28 0V28Z" />
                <path className="cl-q" d="M0 33H28V61A28 28 0 0 1 0 33Z" />
                <path className="cl-bar" d="M33 0H58A3 3 0 0 1 61 3V9A3 3 0 0 1 58 12H33Z" />
                <rect className="cl-dot" style={vars({ d: 260 })} x="33" y="49" width="12" height="12" rx="3" />
                <rect className="cl-dot" style={vars({ d: 320 })} x="49" y="49" width="12" height="12" rx="3" />
                <path className="cl-ghost-d" style={vars({ d: GHOST_D, ...ghostD, lift: 16 })} d="M0 28A28 28 0 0 1 28 0V28ZM0 33H28V61A28 28 0 0 1 0 33Z" />
                <path
                    className="cl-ghost-l"
                    style={vars({ d: GHOST_L, tx: stemX - 47, ty: barY - 6, s: lScale, lift: 12, r: 90 })}
                    d="M33 0H58A3 3 0 0 1 61 3V9A3 3 0 0 1 58 12H33Z"
                />
                <rect className="cl-ghost-l" style={vars({ d: GHOST_L + 40, tx: stemX - 39, ty: dot1Y - 55, s: lScale, lift: 12 })} x="33" y="49" width="12" height="12" rx="3" />
                <rect className="cl-ghost-l" style={vars({ d: GHOST_L + 80, tx: stemX - 55, ty: dot2Y - 55, s: lScale, lift: 12 })} x="49" y="49" width="12" height="12" rx="3" />
            </svg>
        </div>
    );
}
