/**
 * OpenClaw Zoho Cliq Channel Plugin
 * Compatible with Gateway 2026.6.6+
 *
 * Uses registerHttpRoute (not deprecated registerHttpHandler).
 * Imports from openclaw/plugin-sdk for proper Gateway integration.
 */
declare const plugin: {
    id: string;
    name: string;
    description: string;
    configSchema: {
        type: string;
        additionalProperties: boolean;
        properties: {};
    };
    register(api: any): void;
};
export default plugin;
