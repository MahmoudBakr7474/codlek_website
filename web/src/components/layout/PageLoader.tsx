import { LETTERS } from '../ui/Logo';

/*
 * Brand loader: the logo assembles, then the name unfolds out of the mark. The
 * two quarter circles of the C (together a mirrored D) arc over and become the
 * bowl of the "d"; the bar and the two dots stand up into the stem of the "l";
 * then C, o, e and k come in, in reading order. Copies of the mark pieces do the
 * travelling, so the mark itself stays whole. CSS animation only (it keeps
 * running while the page loads), transform and opacity only; reduced motion gets
 * a plain fade. Inline CSS and script, so the cover is right from the first paint.
 *
 * Modes (admin, "المظهر وشاشة التحميل"):
 * - always:  covers the first page load only until its first screen is ready (the
 *            HTML is parsed, the font and the hero image are in; at most 0.8s more),
 *            so it never adds to the loading time and a page that opens at once just
 *            fades in. Moving between pages afterwards is instant (the site is a
 *            single-page app), so there is no "leaving" cover as on the Laravel site.
 * - session: the full intro (INTRO_MS) once, on the first page of a visit.
 * - off:     nothing.
 */

/** Long enough for the whole intro to play before the session cover fades. */
const INTRO_MS = 1750;

const css = `
.cl-loader { display: none; place-items: center; background: var(--bg, #F5F7FA); color: var(--logo-ink, #0B1B3F); }
#page-loader { position: fixed; inset: 0; z-index: 200; }
.is-loading #page-loader, .cl-loader--preview { display: grid; }
.is-loaded #page-loader { opacity: 0; visibility: hidden; pointer-events: none; transition: opacity .45s ease, visibility 0s linear .45s; }
.is-loaded #page-loader .cl-logo { opacity: 0; transform: scale(1.03); transition: opacity .2s ease, transform .45s cubic-bezier(.23, 1, .32, 1); }
.cl-quick #page-loader { transition-duration: .18s, 0s; transition-delay: 0s, .18s; }
.cl-quick #page-loader .cl-logo { transform: none; }
.is-loading:not(.is-loaded) #page-loader { animation: cl-failsafe .4s ease 8s forwards; }
@keyframes cl-failsafe { to { opacity: 0; visibility: hidden; } }
${introCss()}
.cl-loader--preview { height: 220px; border-radius: 16px; border: 1px solid rgb(148 163 184 / .3); overflow: hidden; }
@media (prefers-reduced-motion: reduce) {
    .is-loaded #page-loader .cl-logo { transform: none; }
}`;

/** The intro's own CSS (shared with the admin preview, which copies it). */
function introCss(): string {
    return `
.cl-logo { --cl-t: 1; direction: ltr; }
.cl-svg { display: block; height: 56px; width: auto; overflow: visible; animation: cl-center calc(.7s * var(--cl-t)) cubic-bezier(.77, 0, .175, 1) calc(.52s * var(--cl-t)) both; }
.cl-svg * { transform-box: fill-box; transform-origin: center; }
.cl-q, .cl-letter, .cl-arrive, .cl-ghost-d { fill: currentColor; }
.cl-bar, .cl-dot, .cl-ghost-l { fill: var(--logo-accent, #0B63CE); }
.cl-q { animation: cl-pop calc(.42s * var(--cl-t)) cubic-bezier(.23, 1, .32, 1) both; }
.cl-q + .cl-q { animation-delay: calc(.07s * var(--cl-t)); }
.cl-bar { transform-origin: left center; animation: cl-slide calc(.42s * var(--cl-t)) cubic-bezier(.23, 1, .32, 1) calc(.16s * var(--cl-t)) both; }
.cl-dot { animation: cl-drop calc(.38s * var(--cl-t)) cubic-bezier(.23, 1, .32, 1) calc(var(--d) * var(--cl-t)) both,
    cl-breathe 1.4s ease-in-out calc(1.8s * var(--cl-t)) infinite; }
.cl-letter { animation: cl-in calc(.38s * var(--cl-t)) cubic-bezier(.23, 1, .32, 1) calc(var(--d) * var(--cl-t)) both; }
.cl-arrive { animation: cl-arrive calc(.18s * var(--cl-t)) cubic-bezier(.23, 1, .32, 1) calc(var(--d) * var(--cl-t)) both; }
/* Copies of the mark pieces: hidden until they leave (no backwards fill), then they arc over to their letter. */
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
}

// The intro's choreography on the logo's 61-unit grid (ms and grid units).
const box = (char: string) => LETTERS.find((letter) => letter.char === char)!.box;
const xHeight = box('o')[1];
const D = box('d');
const L = box('l');
const TRAVEL = 520;
const GHOST_D = 560;
const GHOST_L = 620;

/** The half-disc (0..28 x 0..61) lands on the left half of the d's bowl. */
const dScale = (D[3] - xHeight) / 61;
const ghostD = { tx: D[0] + (28 * dScale) / 2 - 14, ty: xHeight + (61 * dScale) / 2 - 30.5, s: dScale };

/** The bar turns upright and the two dots stack under it: the l's stem. */
const lScale = (L[2] - L[0]) / 12;
const stemX = (L[0] + L[2]) / 2;
const lGap = (L[3] - L[1] - 52 * lScale) / 2;
const barY = L[1] + 14 * lScale;
const dot1Y = L[1] + 28 * lScale + lGap + 6 * lScale;
const dot2Y = dot1Y + 12 * lScale + lGap;

/** When each letter comes in; d and l appear as their pieces land. */
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

/** The animated logo (also used as a live preview, without the script). */
export function LoaderLogo({ preview = false }: { preview?: boolean }) {
    return (
        <div {...(preview ? { className: 'cl-loader cl-loader--preview' } : { id: 'page-loader', className: 'cl-loader' })} aria-hidden="true">
            <div className="cl-logo">
                {/* The logo's own 61-unit grid (see ui/Logo), so CSS offsets read close to pixels. */}
                <svg className="cl-svg" viewBox="0 0 254 61" focusable="false">
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
        </div>
    );
}

function script(mode: string): string {
    return `(function(){
var root=document.documentElement, mode=${JSON.stringify(mode)};
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function read(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function store(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
var show=mode==='always'||(mode==='session'&&!read('codlek-intro'));
if(show){
  var least=reduce||mode==='always'?0:${INTRO_MS}, start=Date.now(), done=false;
  root.classList.add('is-loading');
  var reveal=function(){
    if(done)return; done=true;
    var elapsed=Date.now()-start;
    if(mode==='always'&&elapsed<400)root.classList.add('cl-quick');
    setTimeout(function(){
      root.classList.add('is-loaded'); store('codlek-intro','1');
      setTimeout(function(){root.classList.remove('is-loading','is-loaded','cl-quick')},500);
    },Math.max(0,least-elapsed));
  };
  var ready=function(){
    var settled=function(){}, waits=[];
    if(document.fonts&&document.fonts.ready)waits.push(document.fonts.ready.then(settled,settled));
    var hero=document.querySelector('main img[fetchpriority="high"]');
    if(hero&&hero.decode)waits.push(hero.decode().then(settled,settled));
    Promise.all(waits).then(reveal,reveal);
    setTimeout(reveal,800);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true}); else ready();
  setTimeout(reveal,6000);
}
window.addEventListener('pageshow',function(e){if(e.persisted)root.classList.remove('is-loading','is-loaded','cl-quick')});
})();`;
}

export function PageLoader({ mode }: { mode: string }) {
    if (mode === 'off') {
        return null;
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <script dangerouslySetInnerHTML={{ __html: script(mode) }} />
            <LoaderLogo />
        </>
    );
}
