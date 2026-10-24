/*
 * Phones: a list that scrolls sideways one card at a time, the next card peeking in,
 * instead of a column several screens long. Native scroll snapping (no JS slider):
 * every item stays in the page and in reading order, and the row follows the page's
 * direction (it starts on the right in Arabic). From `sm` it is the caller's grid
 * again. The caller sets the item width (about 82-86%) and its grid columns.
 * py-2 keeps focus outlines and shadows inside the row's clip.
 */
export const snapRow =
    '-mx-4 -my-2 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:m-0 sm:grid sm:snap-none sm:overflow-visible sm:p-0';

export const snapItem = 'shrink-0 snap-start sm:w-auto';
