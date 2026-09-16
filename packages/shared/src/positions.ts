// Edit this list to add/remove/rename EC positions. Order here is the order
// shown in the nomination form's dropdown.
export const POSITIONS = [
  "সভাপতি",
  "সহ-সভাপতি-১",
  "সহ-সভাপতি-২",
  "নির্বাহী পরিচালক",
  "পরিচালক (প্রশাসন)",
  "পরিচালক (অর্থ)",
  "পরিচালক (শিক্ষা ও পেশাগত উন্নয়ন)",
  "পরিচালক (আন্তর্জাতিক বিষয়ক)",
  "পরিচালক (প্রচার ও যোগাযোগ)",
  "পরিচালক (পরিবেশ সচেতনতা বিষয়ক)",
  "পরিচালক (বিষয়ক পরিবেশ আইন ও নীতি)",
  "কার্যনির্বাহী সদস্য",
] as const;

export type Position = (typeof POSITIONS)[number];
