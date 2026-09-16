// Membership IDs are compared case/whitespace-insensitively so "p001" and
// "P001 " are treated as the same ID for duplicate detection.
export function normalizeMembershipId(id: string): string {
  return id.trim().toUpperCase().replace(/\s+/g, "");
}
