"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MEMBER_ID_GROUPS } from "@bps/shared";

export function MembershipIdSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toUpperCase();
    return MEMBER_ID_GROUPS.map((g) => ({
      label: g.label,
      ids: q ? g.ids.filter((id) => id.includes(q)) : g.ids,
    })).filter((g) => g.ids.length > 0);
  }, [query]);

  function selectId(id: string) {
    onChange(id);
    setQuery(id);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setQuery(value);
          }
        }}
        placeholder="আইডি লিখে খুঁজুন (যেমন G21001)"
        className="w-full border-b border-gray-300 bg-transparent pb-1 text-sm outline-none placeholder:text-gray-400 focus:border-indigo-600"
      />
      {open && (
        <div className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {filteredGroups.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-400">কোনো ফলাফল পাওয়া যায়নি</p>
          )}
          {filteredGroups.map((g) => (
            <div key={g.label}>
              <p className="sticky top-0 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
                {g.label}
              </p>
              {g.ids.map((id) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => selectId(id)}
                  className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-indigo-50 ${
                    id === value ? "bg-indigo-50 font-medium text-indigo-700" : ""
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
