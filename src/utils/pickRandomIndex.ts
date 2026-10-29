type PickRandomIndexParams = {
  count: number;
  excludeIndex: number;
};

export function pickRandomIndex({ count, excludeIndex }: PickRandomIndexParams) {
  const index = Math.floor(Math.random() * (count - 1));
  return index >= excludeIndex ? index + 1 : index;
}
