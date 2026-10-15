"use strict";

const http = require("http");
const crypto = require("crypto");

module.exports = function startDashboardApi(port, getStatus, controls = {}) {
  const key = String(process.env.ECLIPSE_DASHBOARD_API_KEY || "").trim();
  const origin = String(process.env.ECLIPSE_DASHBOARD_ORIGIN || "*");
  const events = [];

  const send = (res, status, body) => {
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.end(JSON.stringify(body));
  };

  const authorized = (req) => {
    if (!key) return false;
    const bearer = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
    const supplied = String(req.headers["x-eclipse-dashboard-key"] || bearer);
    const a = Buffer.from(supplied);
    const b = Buffer.from(key);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  };

  const runtime = () => ({
    watchdog: { ok: true },
    traffic: {},
    music: {},
    database: null,
    uptime_seconds: Math.floor(process.uptime()),
    node_version: process.version,
    memory: process.memoryUsage()
  });

  const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-ECLIPSE-DASHBOARD-KEY");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    const url = new URL(req.url || "/", "http://localhost");
    if (url.pathname === "/" || url.pathname === "/health") {
      return send(res, 200, { ok: true, service: "banat-only", dashboard_api: Boolean(key) });
    }

    if (!url.pathname.startsWith("/api/dashboard/")) {
      return send(res, 404, { ok: false, error: "Not found" });
    }

    if (!key) {
      return send(res, 503, { ok: false, error: "Set ECLIPSE_DASHBOARD_API_KEY on this service" });
    }
    if (!authorized(req)) {
      return send(res, 401, { ok: false, error: "Dashboard authorization required" });
    }

    if (req.method === "GET" && url.pathname === "/api/dashboard/status") {
      return send(res, 200, getStatus());
    }
    if (req.method === "GET" && url.pathname === "/api/dashboard/snapshot") {
      return send(res, 200, { ok: true, snapshot: null, degraded: true });
    }
    if (req.method === "GET" && url.pathname === "/api/dashboard/health") {
      return send(res, 200, { ok: true, runtime: runtime() });
    }
    if (req.method === "GET" && url.pathname === "/api/dashboard/events") {
      return send(res, 200, { ok: true, events: events.slice(0, 80) });
    }
    if (req.method === "GET" && url.pathname === "/api/dashboard/analytics") {
      return send(res, 200, { ok: true, analytics: { generated_at: new Date().toISOString(), hours: 24, economy: [], rpg: [], battles: [], moderation: [] } });
    }
    if (req.method === "GET" && url.pathname === "/api/dashboard/user") {
      return send(res, 200, { ok: true, inspector: { generated_at: new Date().toISOString(), user: null, rpg: null, inventory: [], equipment: [], skills: [], spells: [], pets: [], transactions: [], moderation: [] } });
    }

    if (req.method === "POST" && url.pathname === "/api/dashboard/bot/start") {
      if (typeof controls.setPaused !== "function") return send(res, 501, { ok: false, error: "Bot start control is unavailable" });
      controls.setPaused(false);
      return send(res, 200, { ok: true, bot_running: Boolean(getStatus().facebook_connected) });
    }
    if (req.method === "POST" && url.pathname === "/api/dashboard/bot/stop") {
      if (typeof controls.setPaused !== "function") return send(res, 501, { ok: false, error: "Bot stop control is unavailable" });
      controls.setPaused(true);
      return send(res, 200, { ok: true, bot_running: false });
    }

    if (req.method === "POST" && [
      "/api/dashboard/connect-session",
      "/api/dashboard/reconnect",
      "/api/dashboard/disconnect",
      "/api/dashboard/music/pause",
      "/api/dashboard/music/resume"
    ].includes(url.pathname)) {
      return send(res, 501, { ok: false, error: "This action is not supported by the standalone Banat test bot." });
    }

    return send(res, 404, { ok: false, error: "Unsupported dashboard endpoint" });
  });

  server.listen(port, () => console.log("[BANAT] health + dashboard API server :" + port));
  return server;
};
