import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB, Nomination } from "@bps/db";

export const dynamic = "force-dynamic";

export default async function ResponseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await connectDB();
  const doc = await Nomination.findById(id).lean().catch(() => null);
  if (!doc) {
    notFound();
  }

  const submittedAt = doc.createdAt ? new Date(doc.createdAt).toLocaleString() : "";
  const isImage = /\.(png|jpe?g|gif|webp)(\?|$)/i.test(doc.feeReceiptUrl);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/" className="text-sm text-indigo-600 hover:underline">
        ← সব প্রতিক্রিয়া
      </Link>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{doc.voterName}</h1>
            <p className="text-sm text-gray-500">জমা দেওয়া হয়েছে: {submittedAt}</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
            {doc.position}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Detail label="ইমেইল" value={doc.email} />
          <Detail label="ভোটার (মেম্বারশিপ আইডি) নংঃ" value={doc.voterMembershipId} />
          <Detail label="পিতার নামঃ" value={doc.fatherName || "—"} />
          <Detail label="জন্ম তারিখঃ" value={doc.dob} />
          <Detail label="মোবাইল নংঃ" value={doc.mobile} />
          <Detail label="বিশ্ববিদ্যালয়ের নামঃ" value={doc.university} />
          <Detail label="মনোনয়নকৃত পদের নামঃ" value={doc.position} />
          <Detail
            label="প্রস্তাবকারীর নাম ও আইডি"
            value={`${doc.proposerName} (${doc.proposerMembershipId})`}
          />
          <Detail
            label="সমর্থনকারীর নাম ও আইডি"
            value={`${doc.supporterName} (${doc.supporterMembershipId})`}
          />
        </dl>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <p className="mb-2 text-sm text-gray-500">ফি পরিশোধের রশিদ</p>
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doc.feeReceiptUrl}
              alt="Fee receipt"
              className="max-h-96 rounded-md border border-gray-200"
            />
          ) : (
            <a
              href={doc.feeReceiptUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-indigo-600 hover:underline"
            >
              রশিদ ফাইল খুলুন
            </a>
          )}
          <div className="mt-2">
            <a
              href={doc.feeReceiptUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-500 hover:underline"
            >
              নতুন ট্যাবে খুলুন ↗
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
    </div>
  );
}
