/**
 * Zoho Cliq API client for sending messages.
 */

import type { CliqConfig } from "./types.js";
import { ensureAccessToken } from "./auth.js";

export interface CliqSendMessageParams {
  chatId: string;
  text: string;
  format?: "markdown" | "plaintext";
}

export async function sendCliqMessage(
  cfg: CliqConfig,
  params: CliqSendMessageParams
): Promise<boolean> {
  const baseUrl = cfg.baseUrl || "https://cliq.zoho.eu";
  const token = await ensureAccessToken(cfg);
  if (!token) {
    console.error("[cliq] No access token available for sending message");
    return false;
  }

  try {
    const resp = await fetch(`${baseUrl}/api/v2/chats/${params.chatId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: params.text,
        format: params.format || "markdown",
      }),
    });

    if (!resp.ok) {
      const body = await resp.text();
      console.error(`[cliq] Send message failed: ${resp.status} ${body}`);
      return false;
    }

    console.log(`[cliq] Message sent to ${params.chatId}`);
    return true;
  } catch (err) {
    console.error("[cliq] Send message error:", err);
    return false;
  }
}

export async function sendCliqReply(
  cfg: CliqConfig,
  chatId: string,
  messageId: string,
  text: string
): Promise<boolean> {
  const baseUrl = cfg.baseUrl || "https://cliq.zoho.eu";
  const token = await ensureAccessToken(cfg);
  if (!token) return false;

  try {
    const resp = await fetch(`${baseUrl}/api/v2/chats/${chatId}/messages/${messageId}/reply`, {
      method: "POST",
      headers: {
        "Authorization": `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, format: "markdown" }),
    });

    if (!resp.ok) {
      console.error(`[cliq] Reply failed: ${resp.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[cliq] Reply error:", err);
    return false;
  }
}
