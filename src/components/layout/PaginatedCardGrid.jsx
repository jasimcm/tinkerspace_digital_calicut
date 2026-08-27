import React, { useEffect, useState, useRef } from 'react';
import CardItem from '../cards/UserCard';
import useGridLayout from '../../hooks/useGridLayout';
import { getMakerCardsPerPage } from '../../utils/layout/makerGrid';

const PAGE_INTERVAL = 20000;

export default function PaginatedCardGrid({ data, isActive = true, headerHeight }) {
  const { cols, rows, cardWidth, cardHeight, gap, paddingX } = useGridLayout(headerHeight);
  const totalSlots = cols * rows;
  // Keep the bottom-right grid cell clear for the fixed mascot overlay.
  const cardsPerPage = getMakerCardsPerPage(cols, rows);
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
  const emptySlots = totalSlots - pageCards.length;

  return (
    <div className="flex flex-col w-full h-full relative font-mono">
      <div
        className="flex-1 w-full flex justify-between content-start py-[clamp(1rem,2vh,1.5rem)] mt-[clamp(1rem,2vh,1.5rem)]"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cardWidth}px)`,
          gridTemplateRows: `repeat(${rows}, ${cardHeight}px)`,
          justifyContent: 'space-between',
          alignContent: 'start',
          rowGap: `${gap}px`,
          paddingLeft: `${paddingX}px`,
          paddingRight: `${paddingX}px`,
        }}
      >
        {pageCards.map((card, index) => {
          return (
            <div
              key={card.membershipId || card.name || index}
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
        {Array.from({ length: emptySlots }).map((_, i) => {
          return (
            <div
              key={`empty-${i}`}
              style={{ background: 'transparent', width: cardWidth, height: cardHeight }}
            />
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
