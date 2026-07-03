/**
 * Zoho Cliq API client for sending messages.
 */
import { ensureAccessToken } from "./auth.js";
export async function sendCliqMessage(cfg, params) {
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
    }
    catch (err) {
        console.error("[cliq] Send message error:", err);
        return false;
    }
}
export async function sendCliqReply(cfg, chatId, messageId, text) {
    const baseUrl = cfg.baseUrl || "https://cliq.zoho.eu";
    const token = await ensureAccessToken(cfg);
    if (!token)
        return false;
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
    }
    catch (err) {
        console.error("[cliq] Reply error:", err);
        return false;
    }
}
//# sourceMappingURL=api.js.map