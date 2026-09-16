import { connectDB, Nomination } from "@bps/db";
import { ResponsesTable, type Row } from "@/components/ResponsesTable";

export const dynamic = "force-dynamic";

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

      <div className="mt-4">
        <ResponsesTable rows={rows} />
      </div>
    </main>
  );
}
