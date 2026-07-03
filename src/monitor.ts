/**
 * HTTP webhook handler for Zoho Cliq inbound messages.
 * Receives POSTs from the Deluge message handler on the Cliq side.
 *
 * Uses registerHttpRoute (not deprecated registerHttpHandler).
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type { CliqConfig, CliqWebhookPayload } from "./types.js";
import { getCliqRuntime } from "./runtime.js";

// ─── Webhook Secret Verification ─────────────────────────────────────────────

function verifyWebhookSecret(req: IncomingMessage, secret?: string): boolean {
  if (!secret) return true; // no secret = accept all
  const provided =
    req.headers["x-cliq-webhook-secret"] ??
    req.headers["x-webhook-secret"] ??
    req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
  return !!provided && provided === secret;
}

// ─── Parse Cliq Payload ──────────────────────────────────────────────────────

function parseCliqPayload(body: CliqWebhookPayload): {
  text: string;
  senderId: string;
  senderName: string;
  chatId: string;
  chatType: string;
  isMention: boolean;
  messageId?: string;
} | null {
  // Extract message text
  let text = "";
  if (typeof body.message === "string") {
    text = body.message;
  } else if (body.message && typeof body.message === "object") {
    text = body.message.text || "";
  }
  if (!text.trim()) return null;

  // Extract sender
  const senderId = body.user?.id || "unknown";
  const senderName =
    body.user?.name ||
    [body.user?.first_name, body.user?.last_name].filter(Boolean).join(" ") ||
    "Unknown";

  // Extract chat
  const chatId = body.chat?.id || "unknown";
  const chatType = body.chat?.type || body.chat?.chat_type || "channel";

  // Detect mention
  const isMention =
    body.handler === "mention" ||
    body.chat?.is_bot_mentioned === true ||
    (body.mentions && body.mentions.length > 0);

  const messageId = typeof body.message === "object" ? body.message.id : undefined;

  return { text, senderId, senderName, chatId, chatType, isMention, messageId };
}

// ─── Read Request Body ────────────────────────────────────────────────────────

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

// ─── Main Webhook Handler ─────────────────────────────────────────────────────

export async function handleCliqWebhookRequest(
  req: IncomingMessage,
  res: ServerResponse,
  cfg: any
): Promise<boolean> {
  // Only handle POST to /cliq or /webhooks/cliq
  const url = req.url || "";
  if (!url.startsWith("/cliq") && !url.startsWith("/webhooks/cliq")) {
    return false;
  }

  if (req.method !== "POST") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", message: "Cliq webhook endpoint" }));
    return true;
  }

  // Resolve config
  const cliqConfig: CliqConfig = cfg?.channels?.cliq || cfg?.plugins?.entries?.cliq?.config || {};

  // Verify webhook secret
  if (!verifyWebhookSecret(req, cliqConfig.webhookSecret)) {
    console.warn("[cliq] Webhook secret mismatch — rejecting request");
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return true;
  }

  // Read and parse body
  try {
    const rawBody = await readBody(req);
    const body: CliqWebhookPayload = JSON.parse(rawBody);

    const parsed = parseCliqPayload(body);
    if (!parsed) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ignored", reason: "empty message" }));
      return true;
    }

    console.log(
      `[cliq] Inbound: ${parsed.chatType} ${parsed.chatId} from ${parsed.senderName}: ${parsed.text.slice(0, 80)}`
    );

    // Get the runtime to process the message
    const runtime = getCliqRuntime();
    if (!runtime) {
      console.error("[cliq] Runtime not initialized");
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Runtime not initialized" }));
      return true;
    }

    // Build session key
    const sessionKey = `cliq:${parsed.chatType}:${parsed.chatId}`;

    // TODO: Process message through OpenClaw runtime
    // For now, acknowledge receipt
    console.log(`[cliq] Session: ${sessionKey}, processing: "${parsed.text.slice(0, 50)}"`);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "received", session: sessionKey }));
    return true;
  } catch (err) {
    console.error("[cliq] Webhook processing error:", err);
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Bad request" }));
    return true;
  }
}
