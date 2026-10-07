"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";

export default function LoginForm({ defaultHint }: { defaultHint: string | null }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mx-auto max-w-sm rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold">Researcher sign-in</h2>
      <p className="mt-1 text-sm text-muted">The dashboard and data exports are for the research team only.</p>
      <label className="mt-4 block text-sm font-medium" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
      />
      {state.error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Checking…" : "Sign in"}
      </button>
      {defaultHint && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {defaultHint}
        </p>
      )}
    </form>
  );
}
