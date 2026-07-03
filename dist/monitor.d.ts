/**
 * HTTP webhook handler for Zoho Cliq inbound messages.
 * Receives POSTs from the Deluge message handler on the Cliq side.
 *
 * Uses registerHttpRoute (not deprecated registerHttpHandler).
 */
import type { IncomingMessage, ServerResponse } from "node:http";
export declare function handleCliqWebhookRequest(req: IncomingMessage, res: ServerResponse, cfg: any): Promise<boolean>;
