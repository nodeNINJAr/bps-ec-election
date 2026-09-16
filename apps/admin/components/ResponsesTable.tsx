"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DeleteButton } from "./DeleteButton";

export type Row = {
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

export function ResponsesTable({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r._id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-sm text-amber-800">{selected.size}টি নির্বাচিত</p>
          <DeleteButton
            ids={selectedIds}
            label={`নির্বাচিত ${selected.size}টি মুছুন`}
            confirmMessage={`আপনি কি নিশ্চিতভাবে ${selected.size}টি প্রতিক্রিয়া মুছে ফেলতে চান? এই কাজটি ফিরিয়ে নেওয়া যাবে না।`}
            className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            onDeleted={() => setSelected(new Set())}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="সব নির্বাচন করুন"
                />
              </th>
              <Th>Submitted</Th>
              <Th>Email</Th>
              <Th>Voter Name</Th>
              <Th>Voter Membership ID</Th>
              <Th>Father&apos;s Name</Th>
              <Th>DOB</Th>
              <Th>Mobile</Th>
              <Th>University</Th>
              <Th>Position</Th>
              <Th>Proposer</Th>
              <Th>Supporter</Th>
              <Th>Details</Th>
              <Th>Delete</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r._id}
                className={`border-t border-gray-100 ${selected.has(r._id) ? "bg-amber-50/60" : ""}`}
              >
                <td className="px-3 py-2 align-top">
                  <input
                    type="checkbox"
                    checked={selected.has(r._id)}
                    onChange={() => toggleOne(r._id)}
                    aria-label={`${r.voterName} নির্বাচন করুন`}
                  />
                </td>
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
                <Td>
                  <DeleteButton
                    ids={[r._id]}
                    label="Delete"
                    confirmMessage={`"${r.voterName}"-এর প্রতিক্রিয়া মুছে ফেলবেন? এই কাজটি ফিরিয়ে নেওয়া যাবে না।`}
                    className="text-red-600 hover:underline disabled:opacity-60"
                  />
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={14} className="px-4 py-8 text-center text-gray-400">
                  No responses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-2 font-medium">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-3 py-2 align-top">{children}</td>;
}
