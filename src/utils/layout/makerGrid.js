export const GRID_LAYOUTS = [
  { cols: 5, rows: 2 },
  { cols: 6, rows: 2 },
  { cols: 7, rows: 2 },
  { cols: 7, rows: 3 },
];

export function getMascotReservation() {
  // The mascot is constrained to one card-sized area, so no extra grid cells are wasted.
  return { cols: 1, rows: 1 };
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
