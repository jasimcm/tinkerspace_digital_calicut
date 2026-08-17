import { useState, useEffect } from 'react';

// Height/width ratio of the original card design — preserved as cards scale.
const CARD_ASPECT_RATIO = 225 / 211;
const MIN_CARD_WIDTH = 130;
const MAX_CARD_WIDTH = 240;

function computeLayout(headerHeight) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const cardWidth = Math.min(MAX_CARD_WIDTH, Math.max(MIN_CARD_WIDTH, vw * 0.13));
  const cardHeight = cardWidth * CARD_ASPECT_RATIO;
  const gap = Math.min(32, Math.max(12, vw * 0.02));
  const paddingX = Math.min(48, Math.max(16, vw * 0.03));

  // Leave room below the grid for the page-dot indicator, bottom quote, and mascot.
  const bottomReserve = Math.min(140, Math.max(60, vh * 0.14));

  const availableWidth = vw - paddingX * 2;
  const availableHeight = vh - headerHeight - bottomReserve;

  let cols = Math.floor((availableWidth + gap) / (cardWidth + gap));
  let rows = Math.floor((availableHeight + gap) / (cardHeight + gap));

  if (cols < 1) cols = 1;
  if (rows < 1) rows = 1;

  return { cols, rows, cardWidth, cardHeight, gap, paddingX };
}

export default function useGridLayout(headerHeight = 180) {
  const [layout, setLayout] = useState(() =>
    typeof window === 'undefined' ? { cols: 7, rows: 3, cardWidth: 211, cardHeight: 225, gap: 32, paddingX: 48 } : computeLayout(headerHeight)
  );

  useEffect(() => {
    function updateLayout() {
      setLayout(computeLayout(headerHeight));
    }
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [headerHeight]);

  return layout;
}
