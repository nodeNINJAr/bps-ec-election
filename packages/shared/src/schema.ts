import { z } from "zod";
import { POSITIONS } from "./positions";
import { ALL_MEMBER_IDS } from "./memberIds";

const MEMBER_ID_SET = new Set(ALL_MEMBER_IDS);

// Fields collected server-side for a nomination submission (before the file
// upload, which is handled separately as multipart form data).
export const nominationFieldsSchema = z.object({
  email: z.string().trim().email("সঠিক ইমেইল দিন"),
  voterName: z.string().trim().min(1, "ভোটার নাম আবশ্যক"),
  voterMembershipId: z
    .string()
    .trim()
    .min(1, "ভোটার মেম্বারশিপ আইডি আবশ্যক")
    .refine((id) => MEMBER_ID_SET.has(id), "তালিকা থেকে একটি সঠিক মেম্বারশিপ আইডি নির্বাচন করুন"),
  fatherName: z.string().trim().optional().default(""),
  dob: z.string().trim().min(1, "জন্ম তারিখ আবশ্যক"),
  mobile: z.string().trim().min(6, "সঠিক মোবাইল নম্বর দিন"),
  university: z.string().trim().min(1, "বিশ্ববিদ্যালয়ের নাম আবশ্যক"),
  position: z.enum(POSITIONS as unknown as [string, ...string[]], {
    errorMap: () => ({ message: "সঠিক পদ নির্বাচন করুন" }),
  }),
  proposerName: z.string().trim().min(1, "প্রস্তাবকারীর নাম আবশ্যক"),
  proposerMembershipId: z
    .string()
    .trim()
    .min(1, "প্রস্তাবকারীর মেম্বারশিপ আইডি আবশ্যক")
    .refine((id) => MEMBER_ID_SET.has(id), "তালিকা থেকে একটি সঠিক মেম্বারশিপ আইডি নির্বাচন করুন"),
  supporterName: z.string().trim().min(1, "সমর্থনকারীর নাম আবশ্যক"),
  supporterMembershipId: z
    .string()
    .trim()
    .min(1, "সমর্থনকারীর মেম্বারশিপ আইডি আবশ্যক")
    .refine((id) => MEMBER_ID_SET.has(id), "তালিকা থেকে একটি সঠিক মেম্বারশিপ আইডি নির্বাচন করুন"),
}).refine((data) => data.proposerMembershipId !== data.supporterMembershipId, {
  message: "প্রস্তাবকারী ও সমর্থনকারীর মেম্বারশিপ আইডি একই হতে পারবে না",
  path: ["supporterMembershipId"],
});

export type NominationFields = z.infer<typeof nominationFieldsSchema>;
