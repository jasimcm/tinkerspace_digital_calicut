import React, { useState } from 'react';
import { getCardMetrics } from '../../utils/layout/cardMetrics';

export default function CardImage({ src, alt, purpose, purposeColor, cardHeight }) {
  const [imageError, setImageError] = useState(false);
  const firstLetter = alt ? alt.charAt(0).toUpperCase() : '?';
  const { imageHeight, purposeFontSize } = getCardMetrics(cardHeight);

  return (
    <div
      className="w-full overflow-hidden relative border-b border-gray-100 bg-gray-50 rounded-t-lg"
      style={{ height: `${imageHeight}px` }}
    >
      {(!src || imageError) ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
          <span className="font-bold" style={{ fontSize: `${Math.min(imageHeight * 0.45, 56)}px` }}>{firstLetter}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-all"
        />
      )}
      {purpose && (
        <div className="absolute z-10" style={{ bottom: `${Math.max(5, cardHeight * 0.04)}px`, left: `${Math.max(5, cardHeight * 0.04)}px` }}>
          <span 
            className="inline-block rounded-full font-bold uppercase tracking-wider shadow-sm backdrop-blur-md"
            style={{
              backgroundColor: `${purposeColor}dd`,
              color: '#222',
              fontSize: `${purposeFontSize}px`,
              padding: `${Math.max(2, purposeFontSize * 0.35)}px ${Math.max(5, purposeFontSize * 0.9)}px`,
            }}
          >
            {purpose}
          </span>
        </div>
      )}
    </div>
  );
}
