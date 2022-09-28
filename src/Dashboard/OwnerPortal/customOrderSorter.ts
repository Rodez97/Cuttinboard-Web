export const customOrderSorter =
  (order: "desc" | "asc") =>
  (a: { rankedValue: string }, b: { rankedValue: string }) =>
    order === "asc"
      ? String(a.rankedValue).localeCompare(b.rankedValue)
      : -1 * String(a.rankedValue).localeCompare(b.rankedValue);
