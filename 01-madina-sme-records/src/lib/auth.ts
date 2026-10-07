import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_token";
export const DEFAULT_PASSWORD = "upsa-research";

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

export function usingDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

export function tokenFor(password: string): string {
  return createHash("sha256").update(`survey-admin:${password}`).digest("hex");
}

export function passwordMatches(input: string): boolean {
  const a = Buffer.from(tokenFor(input));
  const b = Buffer.from(tokenFor(adminPassword()));
  return timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const expected = tokenFor(adminPassword());
  return token.length === expected.length && timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
