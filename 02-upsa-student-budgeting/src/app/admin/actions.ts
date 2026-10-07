"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import config from "@/survey.config";
import { ADMIN_COOKIE, adminPassword, isAdmin, passwordMatches, tokenFor } from "@/lib/auth";
import { deleteDemoResponses, insertMany } from "@/lib/db";
import { generateDemoResponses } from "@/lib/demo";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) return { error: "Incorrect password." };
  (await cookies()).set(ADMIN_COOKIE, tokenFor(adminPassword()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function addDemoData(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const n = Math.min(500, Math.max(10, Number(formData.get("count")) || 120));
  insertMany(generateDemoResponses(config, n));
  redirect("/admin?demo=1");
}

export async function clearDemoData() {
  if (!(await isAdmin())) redirect("/admin");
  deleteDemoResponses();
  redirect("/admin");
}
