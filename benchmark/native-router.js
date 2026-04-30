#!/usr/bin/env node
"use strict";

const http = require("http");
const https = require("https");
const { URL } = require("url");

function normalizeTarget(value) {
  return String(value || "").trim().toLowerCase();
}

const port = Number(process.env.BENCHMARK_ROUTER_PORT || 5000);
const monolithBase = new URL(process.env.MONOLITH_BASE_URL || "http://127.0.0.1:3001");
const microservicesBase = new URL(
  process.env.MICROSERVICES_BASE_URL || "http://127.0.0.1:8080"
);

function chooseBase(req) {
  const target = normalizeTarget(req.headers["x-benchmark-target"]);
  return target === "monolith" ? monolithBase : microservicesBase;
}

function proxyRequest(req, res) {
  const base = chooseBase(req);
  const upstreamPath = req.url || "/";
  const isHttps = base.protocol === "https:";
  const client = isHttps ? https : http;

  const options = {
    protocol: base.protocol,
    hostname: base.hostname,
    port: base.port || (isHttps ? 443 : 80),
    method: req.method,
    path: upstreamPath,
    headers: {
      ...req.headers,
      host: base.host,
      "x-forwarded-host": req.headers.host || `localhost:${port}`,
      "x-forwarded-proto": "http",
    },
    timeout: 30000,
  };

  const upstreamReq = client.request(options, (upstreamRes) => {
    res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
    upstreamRes.pipe(res);
  });

  upstreamReq.on("timeout", () => {
    upstreamReq.destroy(new Error("upstream timeout"));
  });

  upstreamReq.on("error", (err) => {
    const targetLabel = `${base.protocol}//${base.host}`;
    res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        error: "benchmark_router_upstream_error",
        message: err.message,
        target: targetLabel,
      })
    );
  });

  req.pipe(upstreamReq);
}

const server = http.createServer(proxyRequest);

server.listen(port, "127.0.0.1", () => {
  console.log(
    `[native-router] listening on http://127.0.0.1:${port} -> monolith=${monolithBase.href} microservices=${microservicesBase.href}`
  );
});

server.on("error", (err) => {
  console.error(`[native-router] server error: ${err.message}`);
  process.exit(1);
});
