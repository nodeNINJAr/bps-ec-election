import Link from "next/link";
import { connectDB, Nomination } from "@bps/db";

export const dynamic = "force-dynamic";

type Row = {
  _id: string;
  email: string;
  voterName: string;
  voterMembershipId: string;
  fatherName: string;
  dob: string;
  mobile: string;
  university: string;
  position: string;
  proposerName: string;
  proposerMembershipId: string;
  supporterName: string;
  supporterMembershipId: string;
  feeReceiptUrl: string;
  createdAt: string;
};

async function getRows(q: string): Promise<Row[]> {
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

  return docs.map((d) => ({
    _id: String(d._id),
    email: d.email,
    voterName: d.voterName,
    voterMembershipId: d.voterMembershipId,
    fatherName: d.fatherName ?? "",
    dob: d.dob,
    mobile: d.mobile,
    university: d.university,
    position: d.position,
    proposerName: d.proposerName,
    proposerMembershipId: d.proposerMembershipId,
    supporterName: d.supporterName,
    supporterMembershipId: d.supporterMembershipId,
    feeReceiptUrl: d.feeReceiptUrl,
    createdAt: d.createdAt ? new Date(d.createdAt).toLocaleString() : "",
  }));
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const rows = await getRows(q);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            BPS EC Election-2026 — Nomination Responses
          </h1>
          <p className="text-sm text-gray-500">{rows.length} responses</p>
        </div>
        <form action="/api/logout" method="POST">
          <button className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <form className="flex-1 min-w-[240px]" method="GET">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by name, membership ID, position, mobile..."
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-600"
          />
        </form>
        <a
          href={`/api/export${q ? `?q=${encodeURIComponent(q)}` : ""}`}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <Th>Submitted</Th>
              <Th>Email</Th>
              <Th>Voter Name</Th>
              <Th>Voter Membership ID</Th>
              <Th>Father's Name</Th>
              <Th>DOB</Th>
              <Th>Mobile</Th>
              <Th>University</Th>
              <Th>Position</Th>
              <Th>Proposer</Th>
              <Th>Supporter</Th>
              <Th>Details</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t border-gray-100">
                <Td>{r.createdAt}</Td>
                <Td>{r.email}</Td>
                <Td>{r.voterName}</Td>
                <Td>{r.voterMembershipId}</Td>
                <Td>{r.fatherName}</Td>
                <Td>{r.dob}</Td>
                <Td>{r.mobile}</Td>
                <Td>{r.university}</Td>
                <Td>{r.position}</Td>
                <Td>
                  {r.proposerName}
                  <div className="text-xs text-gray-500">{r.proposerMembershipId}</div>
                </Td>
                <Td>
                  {r.supporterName}
                  <div className="text-xs text-gray-500">{r.supporterMembershipId}</div>
                </Td>
                <Td>
                  <Link href={`/responses/${r._id}`} className="text-indigo-600 hover:underline">
                    View
                  </Link>
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-gray-400">
                  No responses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-2 font-medium">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-3 py-2 align-top">{children}</td>;
}
