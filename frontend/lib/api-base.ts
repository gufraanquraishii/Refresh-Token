/** Base URL for browser → Express (must be absolute so requests don’t hit Next.js :3000). */
export function getPublicApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.trim().replace(/\/+$/, "");
  }
  return "http://localhost:4000";
}
