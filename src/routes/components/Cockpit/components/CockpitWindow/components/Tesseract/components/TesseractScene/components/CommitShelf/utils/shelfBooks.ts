// The shelf holds one book for every commit, in rows, oldest at the top left. Scene units.
export const SHELF_ROWS = 4;
export const BOOK = { width: 0.13, height: 0.34, depth: 0.1, gap: 0.035 } as const;

type GetBookPositionsParams = { count: number };

// Where each book stands on the shelf, centered on its middle: [x, y] per book, row by row.
export function getBookPositions({ count }: GetBookPositionsParams): [number, number][] {
  const columns = Math.ceil(count / SHELF_ROWS);
  const stepX = BOOK.width + BOOK.gap;
  const stepY = BOOK.height + BOOK.gap;

  return Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return [(column - (columns - 1) / 2) * stepX, ((SHELF_ROWS - 1) / 2 - row) * stepY];
  });
}

// The shelf's size, for the board behind the books.
export function getShelfSize({ count }: GetBookPositionsParams) {
  const columns = Math.ceil(count / SHELF_ROWS);

  return {
    width: columns * (BOOK.width + BOOK.gap) + BOOK.gap,
    height: SHELF_ROWS * (BOOK.height + BOOK.gap) + BOOK.gap,
  };
}
