export const GRID_LAYOUTS = [
  { cols: 3, rows: 1 },
  { cols: 3, rows: 2 },
  { cols: 5, rows: 2 },
  { cols: 6, rows: 2 },
  { cols: 7, rows: 2 },
  { cols: 8, rows: 2 },
];

export function getMascotReservation({ cardWidth, cardHeight, mascotSize }) {
  return {
    cols: Math.max(1, Math.ceil(mascotSize / cardWidth)),
    rows: Math.max(1, Math.ceil(mascotSize / cardHeight)),
  };
}

export function getMakerCardsPerPage(cols, rows, reservation = { cols: 1, rows: 1 }) {
  const reservedSlots = Math.min(cols, reservation.cols) * Math.min(rows, reservation.rows);
  return Math.max(1, cols * rows - reservedSlots);
}

export function getGridLayout(makerCount, getCapacity) {
  return GRID_LAYOUTS.find((layout) => getCapacity(layout) >= makerCount)
    || GRID_LAYOUTS[GRID_LAYOUTS.length - 1];
}

export function isMascotSlot(index, cols, rows, reservation) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  return row >= rows - reservation.rows && col >= cols - reservation.cols;
}
