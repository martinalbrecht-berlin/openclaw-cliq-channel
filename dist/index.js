/**
 * OpenClaw Zoho Cliq Channel Plugin
 * Compatible with Gateway 2026.6.6+
 *
 * Uses registerHttpRoute (not deprecated registerHttpHandler).
 * Imports from openclaw/plugin-sdk for proper Gateway integration.
 */
import { setCliqRuntime } from "./runtime.js";
import { handleCliqWebhookRequest } from "./monitor.js";
import { refreshCliqToken } from "./auth.js";
const plugin = {
    id: "cliq",
    name: "Zoho Cliq",
    description: "Zoho Cliq channel plugin for OpenClaw — real-time team chat integration",
    configSchema: { type: "object", additionalProperties: true, properties: {} },
    register(api) {
        console.log("[cliq] Registering plugin...");
        // Store runtime for use in monitor
        setCliqRuntime(api.runtime);
        // Register HTTP route for webhooks
        // Using registerHttpRoute (new API, not deprecated registerHttpHandler)
        if (typeof api.registerHttpRoute === "function") {
            api.registerHttpRoute({
                path: "/cliq",
                handler: handleCliqWebhookRequest,
                auth: "plugin",
                match: "prefix",
            });
            console.log("[cliq] HTTP route registered at /cliq (prefix match)");
        }
        else {
            console.error("[cliq] registerHttpRoute not available on api — plugin cannot receive webhooks");
        }
        // Register token refresh tool
        if (typeof api.registerTool === "function") {
            api.registerTool({
                name: "cliq_refresh_token",
                description: "Refresh the Zoho Cliq access token",
                parameters: {},
                handler: async ({ cfg }) => {
                    try {
                        const cliqConfig = cfg?.channels?.cliq || cfg?.plugins?.entries?.cliq?.config || {};
                        await refreshCliqToken(cliqConfig);
                        return { success: true, message: "Cliq token refreshed" };
                    }
                    catch (error) {
                        return {
                            success: false,
                            error: error instanceof Error ? error.message : "Refresh failed",
                        };
                    }
                },
            });
        }
        console.log("[cliq] Plugin registered successfully");
    },
};
export default plugin;
//# sourceMappingURL=index.js.map