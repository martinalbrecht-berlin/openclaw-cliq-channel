/**
 * OAuth token management for Zoho Cliq API.
 */

import type { CliqConfig } from "./types.js";

let currentAccessToken: string | undefined;
let tokenExpiresAt = 0;

export function getAccessToken(): string | undefined {
  return currentAccessToken;
}

export function setAccessToken(token: string, expiresIn: number): void {
  currentAccessToken = token;
  tokenExpiresAt = Date.now() + expiresIn * 1000;
}

export function isTokenExpired(): boolean {
  return Date.now() >= tokenExpiresAt - 60_000; // 1 min buffer
}

export async function refreshCliqToken(cfg: CliqConfig): Promise<string | undefined> {
  const accountsUrl = cfg.accountsUrl || "https://accounts.zoho.eu";
  const clientId = cfg.clientId;
  const clientSecret = cfg.clientSecret;

  if (!clientId || !clientSecret) {
    console.error("[cliq] Missing clientId or clientSecret for token refresh");
    return undefined;
  }

  try {
    const resp = await fetch(`${accountsUrl}/oauth/v2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        scope: "ZohoCliq.Webhooks.CREATE,ZohoCliq.Channels.READ,ZohoCliq.Users.READ",
      }),
    });

    if (!resp.ok) {
      console.error(`[cliq] Token refresh failed: ${resp.status} ${resp.statusText}`);
      return undefined;
    }

    const data = (await resp.json()) as { access_token?: string; expires_in?: number };
    if (data.access_token) {
      setAccessToken(data.access_token, data.expires_in ?? 3600);
      console.log("[cliq] Access token refreshed");
      return data.access_token;
    }
  } catch (err) {
    console.error("[cliq] Token refresh error:", err);
  }
  return undefined;
}

export async function ensureAccessToken(cfg: CliqConfig): Promise<string | undefined> {
  if (currentAccessToken && !isTokenExpired()) {
    return currentAccessToken;
  }
  // Try config-provided token first
  if (cfg.accessToken && !isTokenExpired()) {
    currentAccessToken = cfg.accessToken;
    return currentAccessToken;
  }
  // Refresh
  return refreshCliqToken(cfg);
}
