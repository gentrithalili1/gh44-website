type GetEarthDateParams = {
  // Milliseconds since the epoch, on board.
  now: number;
  // The years that passed on Earth while the ship was in the black hole.
  yearsPassed: number;
};

// The date on Earth: the ship's own, plus the years its trips cost.
export function getEarthDate({ now, yearsPassed }: GetEarthDateParams) {
  const date = new Date(now);
  date.setFullYear(date.getFullYear() + yearsPassed);

  return date;
}
