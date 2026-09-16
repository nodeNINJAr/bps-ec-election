"use client";

import { useEffect, useState, type FormEvent } from "react";
import { POSITIONS } from "@bps/shared";
import { MembershipIdSelect } from "@/components/MembershipIdSelect";

const REMEMBERED_EMAIL_KEY = "bps-nomination-email";

function submitWithProgress(
  formData: FormData,
  onProgress: (percent: number) => void
): Promise<{ status: number; data: { ok: boolean; error?: string; field?: string } }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/nominations");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        resolve({ status: xhr.status, data: JSON.parse(xhr.responseText) });
      } catch {
        reject(new Error("Invalid server response"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));

    xhr.send(formData);
  });
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "duplicate"; message: string; field?: string }
  | { status: "error"; message: string };

const initialValues = {
  email: "",
  voterName: "",
  voterMembershipId: "",
  fatherName: "",
  dob: "",
  mobile: "",
  university: "",
  position: "",
  proposerName: "",
  proposerMembershipId: "",
  supporterName: "",
  supporterMembershipId: "",
};

export default function NominationPage() {
  const [values, setValues] = useState(initialValues);
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    try {
      const remembered = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (remembered) {
        setValues((v) => ({ ...v, email: remembered }));
      }
    } catch {
      // localStorage unavailable (private browsing etc.) — leave email blank
    }
  }, []);

  function update<K extends keyof typeof initialValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function updateEmail(value: string) {
    update("email", value);
    try {
      window.localStorage.setItem(REMEMBERED_EMAIL_KEY, value);
    } catch {
      // localStorage unavailable (private browsing etc.)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!values.voterMembershipId) {
      setState({ status: "error", message: "তালিকা থেকে ভোটার মেম্বারশিপ আইডি নির্বাচন করুন" });
      return;
    }
    if (!file) {
      setState({ status: "error", message: "ফি পরিশোধের রশিদ আপলোড করুন" });
      return;
    }

    setUploadProgress(0);
    setState({ status: "submitting" });

    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => formData.append(k, v));
    formData.append("feeReceipt", file);

    try {
      const { status, data } = await submitWithProgress(formData, setUploadProgress);

      if (status >= 200 && status < 300 && data.ok) {
        setState({ status: "success" });
        return;
      }

      if (status === 409) {
        setState({ status: "duplicate", message: data.error ?? "", field: data.field });
        return;
      }

      setState({ status: "error", message: data.error ?? "সার্ভার ত্রুটি" });
    } catch {
      setState({ status: "error", message: "নেটওয়ার্ক ত্রুটি, পরে আবার চেষ্টা করুন" });
    }
  }

  function resetForm() {
    let email = "";
    try {
      email = window.localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "";
    } catch {
      // ignore
    }
    setValues({ ...initialValues, email });
    setFile(null);
    setState({ status: "idle" });
  }

  if (state.status === "success") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
          <h1 className="text-xl font-semibold text-green-800">আপনার মনোনয়ন সফলভাবে জমা হয়েছে</h1>
          <p className="mt-2 text-sm text-green-700">ধন্যবাদ, আপনার সাড়া রেকর্ড করা হয়েছে।</p>
          <button
            onClick={resetForm}
            className="mt-6 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            আরেকটি প্রতিক্রিয়া জমা দিন
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="h-2 bg-indigo-700" />
        <div className="p-6">
          <h1 className="text-2xl font-normal text-gray-900">
            BPS EC Election-2026 (Nomination Form Submission)
          </h1>
          <p className="mt-3 text-sm text-red-600">* আবশ্যক প্রশ্ন নির্দেশ করে</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Field label="ইমেইলঃ" required>
          <input
            type="email"
            required
            autoComplete="email"
            value={values.email}
            onChange={(e) => updateEmail(e.target.value)}
            className="w-full border-b border-gray-300 bg-transparent pb-1 text-sm outline-none focus:border-indigo-600"
          />
        </Field>

        <Field label="ভোটার নামঃ" required>
          <TextInput value={values.voterName} onChange={(v) => update("voterName", v)} required />
        </Field>

        <Field label="ভোটার (মেম্বারশিপ আইডি) নংঃ" required>
          <MembershipIdSelect
            value={values.voterMembershipId}
            onChange={(v) => update("voterMembershipId", v)}
          />
        </Field>

        <Field label="পিতার নামঃ">
          <TextInput value={values.fatherName} onChange={(v) => update("fatherName", v)} />
        </Field>

        <Field label="জন্ম তারিখঃ" required>
          <input
            type="date"
            required
            value={values.dob}
            onChange={(e) => update("dob", e.target.value)}
            className="w-full border-b border-gray-300 bg-transparent pb-1 text-sm outline-none focus:border-indigo-600"
          />
        </Field>

        <Field label="মোবাইল নংঃ" required>
          <input
            type="tel"
            required
            value={values.mobile}
            onChange={(e) => update("mobile", e.target.value)}
            className="w-full border-b border-gray-300 bg-transparent pb-1 text-sm outline-none focus:border-indigo-600"
          />
        </Field>

        <Field label="বিশ্ববিদ্যালয়ের নামঃ" required>
          <TextInput value={values.university} onChange={(v) => update("university", v)} required />
        </Field>

        <Field
          label="মনোনয়নকৃত পদের নামঃ"
          required
          highlight={state.status === "duplicate" && state.field === "position"}
        >
          <select
            required
            value={values.position}
            onChange={(e) => update("position", e.target.value)}
            className="w-full border-b border-gray-300 bg-transparent py-1 text-sm outline-none focus:border-indigo-600"
          >
            <option value="" disabled>
              Choose
            </option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {state.status === "duplicate" && state.field === "position" && (
            <DuplicateNotice message={state.message} />
          )}
        </Field>

        <Field
          label="প্রস্তাবকারীর নাম ও ভোটার (মেম্বারশিপ আইডি) নংঃ"
          required
          highlight={state.status === "duplicate" && state.field === "proposer"}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextInput
              placeholder="নাম"
              value={values.proposerName}
              onChange={(v) => update("proposerName", v)}
              required
            />
            <TextInput
              placeholder="মেম্বারশিপ আইডি"
              value={values.proposerMembershipId}
              onChange={(v) => update("proposerMembershipId", v)}
              required
            />
          </div>
          {state.status === "duplicate" && state.field === "proposer" && (
            <DuplicateNotice message={state.message} />
          )}
        </Field>

        <Field
          label="সমর্থনকারীর নাম ও ভোটার (মেম্বারশিপ আইডি) নংঃ"
          required
          highlight={state.status === "duplicate" && state.field === "supporter"}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextInput
              placeholder="নাম"
              value={values.supporterName}
              onChange={(v) => update("supporterName", v)}
              required
            />
            <TextInput
              placeholder="মেম্বারশিপ আইডি"
              value={values.supporterMembershipId}
              onChange={(v) => update("supporterMembershipId", v)}
              required
            />
          </div>
          {state.status === "duplicate" && state.field === "supporter" && (
            <DuplicateNotice message={state.message} />
          )}
        </Field>

        <Field label="ফি পরিশোধের রশিদ আপলোডঃ" required>
          <p className="mb-2 text-xs text-gray-500">সর্বোচ্চ ১টি ফাইল, ১০ এমবি পর্যন্ত।</p>
          <input
            type="file"
            required
            accept="image/*,application/pdf"
            disabled={state.status === "submitting"}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm disabled:opacity-60"
          />
          {file && (
            <p className="mt-2 text-xs text-gray-500">
              নির্বাচিত ফাইল: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} এমবি)
            </p>
          )}
          {state.status === "submitting" && (
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-[width] duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">আপলোড হচ্ছে... {uploadProgress}%</p>
            </div>
          )}
        </Field>

        {state.status === "error" && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {state.message}
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <button
            type="submit"
            disabled={state.status === "submitting"}
            className="rounded bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {state.status === "submitting" ? "জমা হচ্ছে..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Clear form
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  required,
  highlight,
  children,
}: {
  label: string;
  required?: boolean;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-5 shadow-sm ${
        highlight ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"
      }`}
    >
      <label className="mb-3 block text-sm text-gray-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  required,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-b border-gray-300 bg-transparent pb-1 text-sm outline-none placeholder:text-gray-400 focus:border-indigo-600"
    />
  );
}

function DuplicateNotice({ message }: { message: string }) {
  return (
    <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <span className="font-semibold">DUPLICATE</span> — {message}
    </div>
  );
}
