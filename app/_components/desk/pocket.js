// Shared by engine.js and the pre-paint script in markup.ts, so the two never drift.

// Phones and short screens get the pocket desk (M3). Same query as desk.css.
export const POCKET_QUERY = '(max-width: 767px), (max-height: 520px)';

// From the Brilliant frame "M3 · Pocket desk" (390 x 844): each object's centre, rotation (deg),
// scale, and caption row. Captions line up per row at y = 340, 524, and 736.
export const POCKET = [
  ['.travel', 102, 274, -3, .6, 340], ['.notebook', 240, 268, 4, .509, 340], ['#phone', 341, 267, 8, .347, 340],
  ['.folder', 93.5, 459, -4, .62, 524], ['#resume', 223, 458.5, -6, .511, 524], ['.books', 334, 454, 0, .47, 524],
  ['#coffee', 102, 652.5, -10, .646, 736], ['.food', 299, 647.5, 6, .567, 736],
];
export const POCKET_CUBES = [[196, 640.5, -8], [208, 660.5, 14], [194, 678.5, 3]];
export const CUBE_SCALE = .6;
