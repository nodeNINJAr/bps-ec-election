"use server";

import { revalidatePath } from "next/cache";
import { connectDB, Nomination } from "@bps/db";

export async function deleteNominations(ids: string[]): Promise<{ deleted: number }> {
  if (ids.length === 0) return { deleted: 0 };

  await connectDB();
  const result = await Nomination.deleteMany({ _id: { $in: ids } });

  revalidatePath("/");
  return { deleted: result.deletedCount ?? 0 };
}
