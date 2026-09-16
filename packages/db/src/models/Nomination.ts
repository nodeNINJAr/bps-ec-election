import mongoose, { Schema, type InferSchemaType } from "mongoose";

const NominationSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    voterName: { type: String, required: true, trim: true },
    voterMembershipId: { type: String, required: true, trim: true },

    fatherName: { type: String, trim: true, default: "" },
    dob: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    university: { type: String, required: true, trim: true },

    position: { type: String, required: true, trim: true },

    proposerName: { type: String, required: true, trim: true },
    proposerMembershipId: { type: String, required: true, trim: true },
    // Uppercased/whitespace-stripped form of proposerMembershipId, used for
    // duplicate detection so "p001" and "P001" collide.
    proposerMembershipIdNormalized: { type: String, required: true },

    supporterName: { type: String, required: true, trim: true },
    supporterMembershipId: { type: String, required: true, trim: true },
    supporterMembershipIdNormalized: { type: String, required: true },

    feeReceiptUrl: { type: String, required: true },
    feeReceiptPublicId: { type: String, required: true },
  },
  { timestamps: true }
);

// Backstop uniqueness at the database level (application code also checks
// this up front so it can return a friendly, field-specific error message).
// Same voter (email + voter membership ID) can't reuse a position, but
// different voters can both nominate for the same position.
NominationSchema.index({ email: 1, voterMembershipId: 1, position: 1 }, { unique: true });

// Proposer/supporter usage is capped (see MAX_PROPOSALS_PER_MEMBER /
// MAX_SUPPORTS_PER_MEMBER in checkDuplicate.ts) rather than single-use, so
// these are plain indexes for the count queries, not unique constraints.
NominationSchema.index({ proposerMembershipIdNormalized: 1 });
NominationSchema.index({ supporterMembershipIdNormalized: 1 });

export type NominationDoc = InferSchemaType<typeof NominationSchema>;

export const Nomination =
  (mongoose.models.Nomination as mongoose.Model<NominationDoc>) ||
  mongoose.model<NominationDoc>("Nomination", NominationSchema);
