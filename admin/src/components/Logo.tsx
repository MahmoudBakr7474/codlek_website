import { BLUE, MARK_BAR, MARK_C, MARK_SQUARES, WORD } from '../lib/logo';

/**
 * The Codlek logo: a C of two quarter circles with a blue bar and two squares, plus the outlined
 * "Codlek" wordmark unless collapsed. Ink follows currentColor. Geometry in lib/logo.
 */
const WIDTH = 254;

export function Logo({ collapsed = false, height = 30 }: { collapsed?: boolean; height?: number }) {
    return collapsed ? (
        <svg viewBox="0 0 61 61" height={height} width={height} aria-label="Codlek" role="img" style={{ display: 'block' }}>
            <path fill="currentColor" d={MARK_C} />
            <path fill={BLUE} d={MARK_BAR + MARK_SQUARES} />
        </svg>
    ) : (
        <svg viewBox={`0 0 ${WIDTH} 61`} height={height} width={(height * WIDTH) / 61} aria-label="Codlek" role="img" style={{ display: 'block' }}>
            <path fill="currentColor" d={MARK_C + WORD} />
            <path fill={BLUE} d={MARK_BAR + MARK_SQUARES} />
        </svg>
    );
}
