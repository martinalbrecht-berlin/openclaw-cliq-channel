/**
 * Zoho Cliq API client for sending messages.
 */
import type { CliqConfig } from "./types.js";
export interface CliqSendMessageParams {
    chatId: string;
    text: string;
    format?: "markdown" | "plaintext";
}
export declare function sendCliqMessage(cfg: CliqConfig, params: CliqSendMessageParams): Promise<boolean>;
export declare function sendCliqReply(cfg: CliqConfig, chatId: string, messageId: string, text: string): Promise<boolean>;
