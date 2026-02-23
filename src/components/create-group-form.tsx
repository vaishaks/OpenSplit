"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";

const commonCurrencies = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"];

export function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");

  const mutation = useMutation({
    mutationFn: () =>
      fetchJson<{ group: { id: string } }>("/api/groups", {
        method: "POST",
        body: JSON.stringify({ name, currencyCode })
      }),
    onSuccess: (data) => {
      router.push(`/groups/${data.group.id}`);
    }
  });

  return (
    <form
      className="space-y-4 rounded-2xl bg-white p-5 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink">Group Name</span>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Apartment 4B"
          className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink">Currency</span>
        <select
          value={currencyCode}
          onChange={(event) => setCurrencyCode(event.target.value)}
          className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
        >
          {commonCurrencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </label>

      {mutation.error ? <p className="text-sm text-danger">{(mutation.error as Error).message}</p> : null}

      <button
        disabled={mutation.isPending}
        className="w-full rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {mutation.isPending ? "Creating..." : "Create Group"}
      </button>
    </form>
  );
}
