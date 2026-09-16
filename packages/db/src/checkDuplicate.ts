import { normalizeMembershipId } from "@bps/shared";
import { Nomination } from "./models/Nomination";

export type DuplicateCheckResult =
  | { duplicate: false }
  | { duplicate: true; field: "position" | "proposer" | "supporter"; message: string };

/**
 * Checks the three global uniqueness rules, in this order:
 *   1. The nominated position may only be used once across all submissions.
 *   2. A membership ID may only appear once as a proposer.
 *   3. A membership ID may only appear once as a supporter.
 * Returns on the first rule that is violated, matching the required
 * PASS/DUPLICATE behavior.
 */
export async function checkDuplicate(input: {
  position: string;
  proposerMembershipId: string;
  supporterMembershipId: string;
}): Promise<DuplicateCheckResult> {
  const proposerNorm = normalizeMembershipId(input.proposerMembershipId);
  const supporterNorm = normalizeMembershipId(input.supporterMembershipId);

  const positionTaken = await Nomination.exists({ position: input.position });
  if (positionTaken) {
    return {
      duplicate: true,
      field: "position",
      message: "Nominated position already used",
    };
  }

  const proposerTaken = await Nomination.exists({
    proposerMembershipIdNormalized: proposerNorm,
  });
  if (proposerTaken) {
    return {
      duplicate: true,
      field: "proposer",
      message: "Proposer membership ID already used",
    };
  }

  const supporterTaken = await Nomination.exists({
    supporterMembershipIdNormalized: supporterNorm,
  });
  if (supporterTaken) {
    return {
      duplicate: true,
      field: "supporter",
      message: "Supporter membership ID already used",
    };
  }

  return { duplicate: false };
}
