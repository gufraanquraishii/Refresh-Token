/**
 * Read JWT `exp` (and claims) without verifying — matches backend token lifetime for refresh timing.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const parts = token.split(".");
    const payload = parts[1];
    if (!payload) return {};
    const json = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as Record<string, unknown>;
    return json;
  } catch {
    return {};
  }
}

export function decodeJwtExpiryMs(token: string): number {
  const payload = decodeJwtPayload(token);
  const exp = payload.exp;
  return typeof exp === "number" ? exp * 1000 : Date.now();
}
