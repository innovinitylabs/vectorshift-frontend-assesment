/** Vertical band (percent of node height) reserved for body/content handles. */
export const CONTENT_REGION_START = 34;
export const CONTENT_REGION_END = 90;

/**
 * Map a 0–1 fraction within the content band to a CSS top percentage.
 */
export const contentRegionTop = (fraction) => {
  const clamped = Math.min(1, Math.max(0, fraction));
  const top =
    CONTENT_REGION_START +
    clamped * (CONTENT_REGION_END - CONTENT_REGION_START);
  return `${top}%`;
};

/**
 * Evenly space N handles within the content region (excludes header).
 */
export const distributedContentTops = (count) => {
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, index) =>
    contentRegionTop((index + 1) / (count + 1))
  );
};

/**
 * Default style for a single side handle centered in the content band.
 */
export const centeredContentHandleStyle = () => ({
  top: contentRegionTop(0.5),
});

/**
 * Space N left-side variable handles with a minimum vertical gap in the content band.
 */
export const distributedVariableTops = (count, minFractionGap = 0.13) => {
  if (count <= 0) return [];
  if (count === 1) return [contentRegionTop(0.5)];

  const start = 0.1;
  const end = 0.9;
  const span = end - start;
  const gap = Math.max(span / (count - 1), minFractionGap);
  const totalSpan = gap * (count - 1);
  const bandStart = totalSpan > span ? 0.08 : start + (span - totalSpan) / 2;

  return Array.from({ length: count }, (_, index) => {
    const fraction = Math.min(0.92, bandStart + index * gap);
    return contentRegionTop(fraction);
  });
};
