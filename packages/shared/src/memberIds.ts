function range(prefix: string, start: number, end: number, width: number): string[] {
  const ids: string[] = [];
  for (let n = start; n <= end; n++) {
    ids.push(prefix + String(n).padStart(width, "0"));
  }
  return ids;
}

// Grouped for the voter membership ID dropdown. "General Member (2021)" and
// "General Member (2024)" labels were inferred (the source list only
// explicitly labeled the 2022 and 2023 groups) — double check these two.
export const MEMBER_ID_GROUPS: { label: string; ids: string[] }[] = [
  { label: "General Member (2021)", ids: range("G21", 1, 103, 3) },
  { label: "General Member (2022)", ids: range("G22", 1, 106, 3) },
  { label: "General Member (2023)", ids: range("G23", 1, 23, 3) },
  { label: "General Member (2024)", ids: range("G24", 1, 22, 3) },
];

export const ALL_MEMBER_IDS: string[] = MEMBER_ID_GROUPS.flatMap((g) => g.ids);
