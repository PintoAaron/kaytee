import config from "@/survey.config";
import { isAdmin } from "@/lib/auth";
import { listResponses } from "@/lib/db";
import { codebookCsv, responsesCsv, spssSyntax } from "@/lib/export";

export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const params = new URL(request.url).searchParams;
  const format = params.get("format") ?? "csv";
  const includeDemo = params.get("demo") === "1";
  const stamp = new Date().toISOString().slice(0, 10);
  const base = `${config.slug}_${stamp}`;

  const file = (body: string, name: string, type: string) =>
    new Response("﻿" + body, {
      headers: {
        "Content-Type": `${type}; charset=utf-8`,
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "no-store",
      },
    });

  switch (format) {
    case "csv":
      return file(responsesCsv(config, listResponses({ includeDemo }), false), `${base}_responses_coded.csv`, "text/csv");
    case "labels":
      return file(responsesCsv(config, listResponses({ includeDemo }), true), `${base}_responses_labelled.csv`, "text/csv");
    case "codebook":
      return file(codebookCsv(config), `${config.slug}_codebook.csv`, "text/csv");
    case "sps":
      return new Response(spssSyntax(config), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${config.slug}_labels.sps"`,
        },
      });
    default:
      return new Response("Unknown format", { status: 400 });
  }
}
