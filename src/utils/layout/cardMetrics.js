const clamp = (min, value, max) => Math.min(max, Math.max(min, value));

export function getCardMetrics(cardHeight) {
  const infoHeight = clamp(38, cardHeight * 0.22, 64);
  return {
    infoHeight,
    imageHeight: Math.max(1, cardHeight - infoHeight),
    badgeSize: clamp(34, cardHeight * 0.24, 56),
    purposeFontSize: clamp(7, cardHeight * 0.043, 10),
    nameFontSize: clamp(12, cardHeight * 0.085, 18),
    detailFontSize: clamp(8, cardHeight * 0.052, 12),
    infoPaddingX: clamp(8, cardHeight * 0.06, 16),
    infoPaddingY: clamp(5, cardHeight * 0.045, 12),
  };
}
