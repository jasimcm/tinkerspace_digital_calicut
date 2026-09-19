import { GRID_LAYOUTS } from '../utils/layout/makerGrid';
import { getFittingCardWidth } from './useGridLayout';

const CARD_ASPECT_RATIO = 225 / 211;

describe('getFittingCardWidth', () => {
  it.each(GRID_LAYOUTS)('fits the %ix%i layout within the usable 1080p TV space', ({ cols, rows }) => {
    const gap = 24;
    const availableWidth = 1760;
    const availableHeight = 660;
    const cardWidth = getFittingCardWidth({
      cols, rows, availableWidth, availableHeight, gap,
    });
    const cardHeight = cardWidth * CARD_ASPECT_RATIO;

    expect(cols * cardWidth + gap * (cols - 1)).toBeLessThanOrEqual(availableWidth);
    expect(rows * cardHeight + gap * (rows - 1)).toBeLessThanOrEqual(availableHeight);
  });
});
