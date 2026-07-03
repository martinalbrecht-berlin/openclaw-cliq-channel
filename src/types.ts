/**
 * Types for the Zoho Cliq channel plugin.
 */

export interface CliqConfig {
  /** Zoho Org ID */
  orgId?: string;
  /** OAuth Client ID */
  clientId?: string;
  /** OAuth Client Secret */
  clientSecret?: string;
  /** Access Token (auto-refreshed) */
  accessToken?: string;
  /** Refresh Token */
  refreshToken?: string;
  /** Bot unique name in Zoho Cliq */
  botId?: string;
  /** Bot display name */
  botName?: string;
  /** Webhook secret for verifying incoming requests */
  webhookSecret?: string;
  /** DM policy: "open" or "restricted" */
  dm?: { policy?: string };
  /** Base URL for Zoho API (default: https://cliq.zoho.eu) */
  baseUrl?: string;
  /** Base URL for Zoho accounts (default: https://accounts.zoho.eu) */
  accountsUrl?: string;
}

export interface CliqWebhookPayload {
  handler?: string;
  message?: string | { text?: string; id?: string };
  user?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    email?: string;
  };
  chat?: {
    id?: string;
    name?: string;
    type?: string;
    chat_type?: string;
    is_bot_mentioned?: boolean;
  };
  mentions?: Array<{ id?: string; name?: string }>;
  thread_id?: string;
  type?: string;
  token?: string;
}
