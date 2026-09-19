import React, { useEffect, useRef, useState } from 'react';
import { getCardMetrics } from '../../utils/layout/cardMetrics';

export default function CardContent({ card, cardHeight, textRef, containerRef, isOverflowing }) {
  const {
    infoHeight, infoPaddingX, infoPaddingY, nameFontSize, detailFontSize,
  } = getCardMetrics(cardHeight);
  const details = [...new Set([card.workingOn, card.projectName].filter(Boolean))].join(' · ');
  const detailTextRef = useRef(null);
  const detailContainerRef = useRef(null);
  const [detailOverflow, setDetailOverflow] = useState(0);

  useEffect(() => {
    const text = detailTextRef.current;
    const container = detailContainerRef.current;
    if (!text || !container) return undefined;

    const measureOverflow = () => {
      setDetailOverflow(Math.max(0, text.scrollWidth - container.clientWidth));
    };

    measureOverflow();
    const observer = new ResizeObserver(measureOverflow);
    observer.observe(container);
    return () => observer.disconnect();
  }, [details, cardHeight]);

  return (
    <div
      className="flex flex-col w-full bg-transparent"
      style={{ height: `${infoHeight}px`, padding: `${infoPaddingY}px ${infoPaddingX}px`, gap: '0' }}
    >
      <div className="leading-none font-semibold text-gray-800 dark:text-gray-100 tracking-tight whitespace-nowrap transition-colors duration-500" style={{ fontSize: `${nameFontSize}px` }}>
        <div ref={containerRef} className="overflow-hidden relative">
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
      <div ref={detailContainerRef} className="overflow-hidden" title={details || undefined}>
        <div
          ref={detailTextRef}
          className="detail-scroll font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap inline-block transition-colors duration-500"
          style={{
            fontSize: `${detailFontSize}px`,
            lineHeight: 1,
            marginTop: 0,
            animation: detailOverflow ? 'detailScroll 9s ease-in-out infinite alternate' : 'none',
            '--detail-scroll-distance': `-${detailOverflow}px`,
          }}
        >
          {details || '\u00A0'}
        </div>
      </div>
    </div>
  );
}
