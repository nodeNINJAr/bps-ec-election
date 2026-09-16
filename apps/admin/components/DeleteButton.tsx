"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteNominations } from "@/app/actions";

export function DeleteButton({
  ids,
  label,
  confirmMessage,
  className,
  redirectTo,
  onDeleted,
}: {
  ids: string[];
  label: string;
  confirmMessage: string;
  className?: string;
  redirectTo?: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (ids.length === 0) return;
    if (!window.confirm(confirmMessage)) return;

    setError(null);
    startTransition(async () => {
      try {
        await deleteNominations(ids);
        onDeleted?.();
        if (redirectTo) {
          router.push(redirectTo);
        }
        router.refresh();
      } catch {
        setError("মুছে ফেলা যায়নি, আবার চেষ্টা করুন");
      }
    });
  }

  return (
    <span>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || ids.length === 0}
        className={className}
      >
        {isPending ? "মুছে ফেলা হচ্ছে..." : label}
      </button>
      {error && <span className="ml-2 text-xs text-red-600">{error}</span>}
    </span>
  );
}
