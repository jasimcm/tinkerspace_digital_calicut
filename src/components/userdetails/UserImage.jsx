import React, { useState } from 'react';

// Height reserved below the image for the name/subtitle text (UserInfo).
const INFO_HEIGHT = 47;

export default function CardImage({ src, alt, purpose, purposeColor, cardHeight }) {
  const [imageError, setImageError] = useState(false);
  const firstLetter = alt ? alt.charAt(0).toUpperCase() : '?';
  const imageHeight = cardHeight - INFO_HEIGHT;

  return (
    <div
      className="w-full overflow-hidden relative border-b border-gray-100 bg-gray-50 rounded-t-lg"
      style={{ height: `${imageHeight}px` }}
    >
      {(!src || imageError) ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-6xl font-bold">{firstLetter}</span>
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
        <div className="absolute bottom-2 left-2 z-10">
          <span 
            className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md"
            style={{ backgroundColor: `${purposeColor}dd`, color: '#222' }}
          >
            {purpose}
          </span>
        </div>
      )}
    </div>
  );
}