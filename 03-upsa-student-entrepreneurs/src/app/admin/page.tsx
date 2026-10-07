import type { Metadata } from "next";
import { Suspense } from "react";
import config from "@/survey.config";
import { DEFAULT_PASSWORD, isAdmin, usingDefaultPassword } from "@/lib/auth";
import { countResponses, listResponses } from "@/lib/db";
import { analyse } from "@/lib/analysis";
import LoginForm from "@/components/LoginForm";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = { title: `Dashboard · ${config.shortTitle}` };

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <AdminContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AdminContent({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  if (!(await isAdmin())) {
    return (
      <LoginForm
        defaultHint={
          usingDefaultPassword()
            ? `ADMIN_PASSWORD is not set, so the default password "${DEFAULT_PASSWORD}" is active. Set ADMIN_PASSWORD in .env.local before collecting real data.`
            : null
        }
      />
    );
  }
  const includeDemo = (await searchParams).demo === "1";
  const [responses, counts] = await Promise.all([listResponses({ includeDemo }), countResponses()]);
  return <Dashboard config={config} analysis={analyse(config, responses)} includeDemo={includeDemo} counts={counts} />;
}
