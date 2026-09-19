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

  it('uses one bottom-right cell for the mascot at every grid density', () => {
    expect(getMascotReservation({ cardWidth: 240, cardHeight: 256, mascotSize: 176 })).toEqual({ cols: 1, rows: 1 });
    expect(getMascotReservation({ cardWidth: 180, cardHeight: 192, mascotSize: 176 })).toEqual({ cols: 1, rows: 1 });
  });

  it('selects the smallest layout that has capacity for all current makers', () => {
    const capacity = ({ cols, rows }) => cols * rows - 1;
    expect(getGridLayout(5, capacity)).toEqual({ cols: 5, rows: 2 });
    expect(getGridLayout(11, capacity)).toEqual({ cols: 6, rows: 2 });
    expect(getGridLayout(13, capacity)).toEqual({ cols: 7, rows: 2 });
    expect(getGridLayout(20, capacity)).toEqual({ cols: 7, rows: 3 });
    expect(getGridLayout(21, capacity)).toEqual({ cols: 8, rows: 4 });
    expect(getGridLayout(99, capacity)).toEqual({ cols: 8, rows: 4 });
  });

  it('reserves a bottom-right rectangle for the mascot', () => {
    const reservation = { cols: 2, rows: 2 };
    expect(isMascotSlot(22, 6, 4, reservation)).toBe(true);
    expect(isMascotSlot(21, 6, 4, reservation)).toBe(false);
    expect(isMascotSlot(15, 6, 4, reservation)).toBe(false);
  });
});
