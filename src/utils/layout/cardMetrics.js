const clamp = (min, value, max) => Math.min(max, Math.max(min, value));

export function getCardMetrics(cardHeight) {
  const infoHeight = clamp(40, cardHeight * 0.2, 56);
  return {
    infoHeight,
    imageHeight: Math.max(1, cardHeight - infoHeight),
    badgeSize: clamp(34, cardHeight * 0.24, 56),
    purposeFontSize: clamp(7, cardHeight * 0.043, 10),
    nameFontSize: clamp(11, cardHeight * 0.072, 17),
    detailFontSize: clamp(7, cardHeight * 0.044, 11),
    infoPaddingX: clamp(6, cardHeight * 0.045, 12),
    infoPaddingY: clamp(3, cardHeight * 0.025, 6),
  };
}
