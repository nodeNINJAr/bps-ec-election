import { normalizeMembershipId } from "@bps/shared";
import { Nomination } from "./models/Nomination";

export const MAX_NOMINATIONS_PER_VOTER = 2;
export const MAX_PROPOSALS_PER_MEMBER = 2;
export const MAX_SUPPORTS_PER_MEMBER = 2;

export type DuplicateCheckResult =
  | { duplicate: false }
  | { duplicate: true; field: "limit" | "position" | "proposer" | "supporter"; message: string };

/**
 * Checks these rules, in order:
 *   0. The same voter (email + voter membership ID) may submit at most
 *      MAX_NOMINATIONS_PER_VOTER nominations in total.
 *   1. The same voter may not submit a nomination for the same position
 *      twice — but CAN nominate for multiple different positions (up to the
 *      cap above), and different voters CAN nominate for the same position
 *      (an election needs multiple candidates per seat).
 *   2. A membership ID may be a proposer on at most MAX_PROPOSALS_PER_MEMBER
 *      nominations, across everyone.
 *   3. A membership ID may be a supporter on at most MAX_SUPPORTS_PER_MEMBER
 *      nominations, across everyone.
 * Returns on the first rule that is violated.
 */
export async function checkDuplicate(input: {
  email: string;
  voterMembershipId: string;
  position: string;
  proposerMembershipId: string;
  supporterMembershipId: string;
}): Promise<DuplicateCheckResult> {
  const emailNorm = input.email.trim().toLowerCase();
  const proposerNorm = normalizeMembershipId(input.proposerMembershipId);
  const supporterNorm = normalizeMembershipId(input.supporterMembershipId);

  const voterSubmissionCount = await Nomination.countDocuments({
    email: emailNorm,
    voterMembershipId: input.voterMembershipId,
  });
  if (voterSubmissionCount >= MAX_NOMINATIONS_PER_VOTER) {
    return {
      duplicate: true,
      field: "limit",
      message: `A voter may submit at most ${MAX_NOMINATIONS_PER_VOTER} nominations`,
    };
  }

  const positionTakenBySameVoter = await Nomination.exists({
    email: emailNorm,
    voterMembershipId: input.voterMembershipId,
    position: input.position,
  });
  if (positionTakenBySameVoter) {
    return {
      duplicate: true,
      field: "position",
      message: "Nominated position already used",
    };
  }

  const proposerCount = await Nomination.countDocuments({
    proposerMembershipIdNormalized: proposerNorm,
  });
  if (proposerCount >= MAX_PROPOSALS_PER_MEMBER) {
    return {
      duplicate: true,
      field: "proposer",
      message: `A member may be a proposer on at most ${MAX_PROPOSALS_PER_MEMBER} nominations`,
    };
  }

  const supporterCount = await Nomination.countDocuments({
    supporterMembershipIdNormalized: supporterNorm,
  });
  if (supporterCount >= MAX_SUPPORTS_PER_MEMBER) {
    return {
      duplicate: true,
      field: "supporter",
      message: `A member may be a supporter on at most ${MAX_SUPPORTS_PER_MEMBER} nominations`,
    };
  }

  return { duplicate: false };
}
