import { NextRequest, NextResponse } from "next/server";
import { connectDB, Nomination } from "@bps/db";

export const runtime = "nodejs";

const HEADERS = [
  "Submitted At",
  "Email",
  "Voter Name",
  "Voter Membership ID",
  "Father's Name",
  "DOB",
  "Mobile",
  "University",
  "Position",
  "Proposer Name",
  "Proposer Membership ID",
  "Supporter Name",
  "Supporter Membership ID",
  "Receipt URL",
];

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  await connectDB();

  const filter = q
    ? {
        $or: [
          { email: { $regex: q, $options: "i" } },
          { voterName: { $regex: q, $options: "i" } },
          { voterMembershipId: { $regex: q, $options: "i" } },
          { position: { $regex: q, $options: "i" } },
          { proposerMembershipId: { $regex: q, $options: "i" } },
          { supporterMembershipId: { $regex: q, $options: "i" } },
          { mobile: { $regex: q, $options: "i" } },
        ],
      }
    : {};

  const docs = await Nomination.find(filter).sort({ createdAt: -1 }).lean();

  const lines = [HEADERS.join(",")];
  for (const d of docs) {
    lines.push(
      [
        d.createdAt ? new Date(d.createdAt).toISOString() : "",
        d.email,
        d.voterName,
        d.voterMembershipId,
        d.fatherName ?? "",
        d.dob,
        d.mobile,
        d.university,
        d.position,
        d.proposerName,
        d.proposerMembershipId,
        d.supporterName,
        d.supporterMembershipId,
        d.feeReceiptUrl,
      ]
        .map((v) => csvEscape(String(v)))
        .join(",")
    );
  }

  const csv = "﻿" + lines.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nominations-${Date.now()}.csv"`,
    },
  });
}
