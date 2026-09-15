import { useState, useEffect } from 'react';
import {
  getGridLayout,
  getMakerCardsPerPage,
  getMascotReservation,
} from '../utils/layout/makerGrid';

// Height/width ratio of the original card design — preserved as cards scale.
const CARD_ASPECT_RATIO = 225 / 211;
const MIN_CARD_WIDTH = 190;
const MAX_CARD_WIDTH = 640;

const clamp = (min, value, max) => Math.min(max, Math.max(min, value));

function getMascotSize(vw) {
  // Must mirror .tinkerhub-mascot's clamp(8rem, 13vw, 12rem) footprint.
  return clamp(128, vw * 0.13, 192);
}

function getColumnFillRatio(cols) {
  if (cols <= 3) return 0.9;
  if (cols === 4) return 0.8;
  if (cols === 5) return 0.85;
  if (cols <= 6) return 0.9;
  if (cols === 7) return 0.95;
  return 1;
}

function computeLayout(headerHeight, makerCount, footerHeight) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const gap = clamp(24, vw * 0.012, 48);
  const paddingX = clamp(48, vw * 0.04, 160);

  const topInset = clamp(24, vh * 0.02, 56);

  const availableWidth = vw - paddingX * 2;
  const availableHeight = vh - headerHeight - topInset - footerHeight;

  const mascotSize = getMascotSize(vw);
  const dimensionsFor = ({ cols, rows }) => {
    const widthLimit = (availableWidth - gap * (cols - 1)) / cols;
    const heightLimit = ((availableHeight - gap * (rows - 1)) / rows) / CARD_ASPECT_RATIO;
    const preferredWidth = Math.min(widthLimit * getColumnFillRatio(cols), MAX_CARD_WIDTH);
    const cardWidth = Math.max(MIN_CARD_WIDTH, Math.min(preferredWidth, widthLimit, heightLimit));
    const cardHeight = cardWidth * CARD_ASPECT_RATIO;
    const mascotReservation = getMascotReservation({ cardWidth, cardHeight, mascotSize });
    return {
      cols,
      rows,
      cardWidth,
      cardHeight,
      mascotReservation,
      cardsPerPage: getMakerCardsPerPage(cols, rows, mascotReservation),
    };
  };

  const selected = getGridLayout(makerCount, (layout) => dimensionsFor(layout).cardsPerPage);
  return { ...dimensionsFor(selected), gap, paddingX, topInset, footerHeight };
}

export default function useGridLayout(headerHeight = 180, makerCount = 0, footerHeight = 160) {
  const [layout, setLayout] = useState(() =>
    typeof window === 'undefined'
      ? { cols: 3, rows: 2, cardWidth: 211, cardHeight: 225, gap: 32, paddingX: 48, topInset: 32, footerHeight, mascotReservation: { cols: 1, rows: 1 }, cardsPerPage: 5 }
      : computeLayout(headerHeight, makerCount, footerHeight)
  );

  useEffect(() => {
    function updateLayout() {
      setLayout(computeLayout(headerHeight, makerCount, footerHeight));
    }
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [headerHeight, makerCount, footerHeight]);

  return layout;
}
