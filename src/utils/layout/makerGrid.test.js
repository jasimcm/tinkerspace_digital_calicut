import {
  getGridLayout,
  getMakerCardsPerPage,
  getMascotReservation,
  isMascotSlot,
} from './makerGrid';

describe('maker grid layout', () => {
  it('subtracts the complete mascot footprint from a page', () => {
    expect(getMakerCardsPerPage(4, 3, { cols: 1, rows: 1 })).toBe(11);
    expect(getMakerCardsPerPage(8, 4, { cols: 2, rows: 2 })).toBe(28);
  });

  it('expands the mascot reservation when cards are smaller than the mascot', () => {
    expect(getMascotReservation({ cardWidth: 240, cardHeight: 256, mascotSize: 192 })).toEqual({ cols: 1, rows: 1 });
    expect(getMascotReservation({ cardWidth: 150, cardHeight: 160, mascotSize: 192 })).toEqual({ cols: 2, rows: 2 });
  });

  it('selects the smallest layout that has capacity for all current makers', () => {
    const capacity = ({ cols, rows }) => cols * rows - 1;
    expect(getGridLayout(5, capacity)).toEqual({ cols: 5, rows: 2 });
    expect(getGridLayout(11, capacity)).toEqual({ cols: 6, rows: 2 });
    expect(getGridLayout(15, capacity)).toEqual({ cols: 8, rows: 2 });
    expect(getGridLayout(16, capacity)).toEqual({ cols: 8, rows: 3 });
    expect(getGridLayout(99, capacity)).toEqual({ cols: 8, rows: 4 });
  });

  it('reserves a bottom-right rectangle for the mascot', () => {
    const reservation = { cols: 2, rows: 2 };
    expect(isMascotSlot(22, 6, 4, reservation)).toBe(true);
    expect(isMascotSlot(21, 6, 4, reservation)).toBe(false);
    expect(isMascotSlot(15, 6, 4, reservation)).toBe(false);
  });
});
