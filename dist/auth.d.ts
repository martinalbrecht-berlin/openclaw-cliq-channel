/**
 * OAuth token management for Zoho Cliq API.
 */
import type { CliqConfig } from "./types.js";
export declare function getAccessToken(): string | undefined;
export declare function setAccessToken(token: string, expiresIn: number): void;
export declare function isTokenExpired(): boolean;
export declare function refreshCliqToken(cfg: CliqConfig): Promise<string | undefined>;
export declare function ensureAccessToken(cfg: CliqConfig): Promise<string | undefined>;
