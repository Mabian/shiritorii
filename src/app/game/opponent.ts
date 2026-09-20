export type Random = () => number;

export function chooseWord(
  candidates: readonly string[],
  used: ReadonlySet<string>,
  random: Random,
): string | undefined {
  const available = candidates.filter((reading) => !used.has(reading));
  return available.length === 0 ? undefined : available[Math.floor(random() * available.length)];
}
