import { NextRequest, NextResponse } from "next/server";
import { connectDB, Nomination, checkDuplicate } from "@bps/db";
import { nominationFieldsSchema, normalizeMembershipId } from "@bps/shared";
import { uploadReceipt } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const raw = {
      email: formData.get("email")?.toString() ?? "",
      voterName: formData.get("voterName")?.toString() ?? "",
      voterMembershipId: formData.get("voterMembershipId")?.toString() ?? "",
      fatherName: formData.get("fatherName")?.toString() ?? "",
      dob: formData.get("dob")?.toString() ?? "",
      mobile: formData.get("mobile")?.toString() ?? "",
      university: formData.get("university")?.toString() ?? "",
      position: formData.get("position")?.toString() ?? "",
      proposerName: formData.get("proposerName")?.toString() ?? "",
      proposerMembershipId: formData.get("proposerMembershipId")?.toString() ?? "",
      supporterName: formData.get("supporterName")?.toString() ?? "",
      supporterMembershipId: formData.get("supporterMembershipId")?.toString() ?? "",
    };

    const parsed = nominationFieldsSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "অবৈধ ইনপুট" },
        { status: 400 }
      );
    }
    const fields = parsed.data;

    const file = formData.get("feeReceipt");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { ok: false, error: "ফি পরিশোধের রশিদ আপলোড করুন" },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { ok: false, error: "ফাইলের সর্বোচ্চ আকার ১০ এমবি" },
        { status: 400 }
      );
    }

    await connectDB();

    const dup = await checkDuplicate({
      email: fields.email,
      voterMembershipId: fields.voterMembershipId,
      position: fields.position,
      proposerMembershipId: fields.proposerMembershipId,
      supporterMembershipId: fields.supporterMembershipId,
    });
    if (dup.duplicate) {
      return NextResponse.json(
        { ok: false, error: dup.message, field: dup.field },
        { status: 409 }
      );
    }

    const uploaded = await uploadReceipt(file);

    try {
      await Nomination.create({
        ...fields,
        proposerMembershipIdNormalized: normalizeMembershipId(fields.proposerMembershipId),
        supporterMembershipIdNormalized: normalizeMembershipId(fields.supporterMembershipId),
        feeReceiptUrl: uploaded.url,
        feeReceiptPublicId: uploaded.publicId,
      });
    } catch (err: unknown) {
      // Backstop for a race between two near-simultaneous submissions that
      // both passed the checkDuplicate() read above.
      if (isDuplicateKeyError(err)) {
        return NextResponse.json(
          { ok: false, error: "এই তথ্য দিয়ে ইতিমধ্যে একটি মনোনয়ন জমা হয়েছে" },
          { status: 409 }
        );
      }
      throw err;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Nomination submission failed:", err);
    return NextResponse.json(
      { ok: false, error: "সার্ভার ত্রুটি, পরে আবার চেষ্টা করুন" },
      { status: 500 }
    );
  }
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000;
}
