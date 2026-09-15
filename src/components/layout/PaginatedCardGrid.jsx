import React, { useEffect, useState, useRef } from 'react';
import CardItem from '../cards/UserCard';
import useGridLayout from '../../hooks/useGridLayout';
import { isMascotSlot } from '../../utils/layout/makerGrid';

const PAGE_INTERVAL = 20000;

export default function PaginatedCardGrid({ data, isActive = true, headerHeight, footerHeight = 160 }) {
  const {
    cols, rows, cardWidth, cardHeight, gap, paddingX, topInset, mascotReservation, cardsPerPage,
  } = useGridLayout(headerHeight, data.length, footerHeight);
  const totalSlots = cols * rows;
  const totalPages = Math.ceil(data.length / cardsPerPage) || 1;
  const [page, setPage] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    if (isActive) {
      setPage(0);
    }
  }, [isActive, cols, rows]);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setPage((p) => (p + 1) % totalPages);
    }, PAGE_INTERVAL);
    
    return () => clearInterval(intervalRef.current);
  }, [totalPages, isActive]);

  // `page` can momentarily point past the current page count when data.length
  // shrinks across a page-count boundary without cols/rows changing (e.g.
  // attendees checking out). Clamp on render so we never slice into an empty
  // range and show a blank grid until the rotation timer wraps it back.
  const safePage = totalPages > 0 ? page % totalPages : 0;
  const start = safePage * cardsPerPage;
  const end = start + cardsPerPage;
  const pageCards = data.slice(start, end);
  let cardIndex = 0;

  return (
    <div className="flex flex-col w-full h-full relative font-mono">
      <div
        className="flex-1 w-full"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cardWidth}px)`,
          gridTemplateRows: `repeat(${rows}, ${cardHeight}px)`,
          justifyContent: 'center',
          alignContent: 'center',
          gap: `${gap}px`,
          boxSizing: 'border-box',
          paddingTop: `${topInset}px`,
          paddingBottom: `${footerHeight}px`,
          paddingLeft: `${paddingX}px`,
          paddingRight: `${paddingX}px`,
        }}
      >
        {Array.from({ length: totalSlots }).map((_, slotIndex) => {
          const reservedForMascot = isMascotSlot(slotIndex, cols, rows, mascotReservation);
          const card = reservedForMascot ? null : pageCards[cardIndex++];

          if (!card) {
            return (
              <div
                key={`empty-${slotIndex}`}
                aria-hidden="true"
                style={{ background: 'transparent', width: cardWidth, height: cardHeight }}
              />
            );
          }

          return (
            <div
              key={card.membershipId || card.name || slotIndex}
              className="transition-opacity duration-500"
              style={{
                width: cardWidth,
                height: cardHeight
              }}
            >
              <CardItem card={card} CARD_HEIGHT={cardHeight} />
            </div>
          );
        })}
      </div>

      {/* Page Number Indicator */}
      {totalPages > 1 && (
        <div
          className="absolute bottom-4 sm:bottom-6 md:bottom-8 flex items-center gap-2 sm:gap-3 z-50 pointer-events-none drop-shadow-sm transition-colors duration-500"
          style={{ left: `${paddingX}px` }}
        >
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-500 ${
                i === safePage
                  ? 'bg-gray-800 dark:bg-white scale-125 shadow-md'
                  : 'bg-gray-400/50 dark:bg-white/20 hover:bg-gray-500/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
