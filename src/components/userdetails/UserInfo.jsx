import React from 'react';
import { getCardMetrics } from '../../utils/layout/cardMetrics';

export default function CardContent({ card, cardHeight, textRef, containerRef, isOverflowing }) {
  const {
    infoHeight, infoPaddingX, infoPaddingY, nameFontSize, detailFontSize,
  } = getCardMetrics(cardHeight);
  return (
    <div
      className="flex flex-col w-full bg-transparent"
      style={{ height: `${infoHeight}px`, padding: `${infoPaddingY}px ${infoPaddingX}px`, gap: `${Math.max(1, infoPaddingY * 0.25)}px` }}
    >
      <div className="leading-tight font-semibold text-gray-800 dark:text-gray-100 tracking-tight whitespace-nowrap transition-colors duration-500" style={{ fontSize: `${nameFontSize}px` }}>
        <div ref={containerRef} className="overflow-hidden relative pb-1">
          <div
            ref={textRef}
            className="whitespace-nowrap inline-block"
            style={{
              animation: isOverflowing ? 'nameScroll 10s ease-in-out infinite alternate' : 'none',
              paddingRight: isOverflowing ? '20px' : '0',
            }}
          >
            {card.name}
          </div>
        </div>
      </div>
      <div className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis leading-none transition-colors duration-500" style={{ fontSize: `${detailFontSize}px`, marginTop: `${Math.max(1, infoPaddingY * 0.2)}px` }}>
        {card.workingOn || card.projectName || '\u00A0'}
      </div>
    </div>
  );
}
