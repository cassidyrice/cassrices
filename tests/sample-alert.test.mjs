// node tests/sample-alert.test.mjs
import assert from "node:assert/strict";
import { onRequestPost } from "../functions/api/sample-request.js";
import worker, { buildAlert } from "../workers/sample-alert/index.js";

function kv() {
  const store = new Map();
  return { store, get: async (k) => store.get(k) ?? null, put: async (k, v) => { store.set(k, v); } };
}
function post(fields) {
  return new Request("https://cassrices.com/api/sample-request", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "CF-Connecting-IP": String(Math.random()) },
    body: JSON.stringify(fields),
  });
}
const good = { business: "Acme HVAC", website: "https://acme.example", email: "owner@acme.example", topic: "How a heat pump works" };

// 1. A valid request is stored and alerts once with the stored record.
{
  const calls = [], waited = [];
  const env = { SAMPLE_REQUESTS: kv(), SAMPLE_ALERT: { fetch: async (url, init) => { calls.push(JSON.parse(init.body)); return new Response("{}"); } } };
  const res = await onRequestPost({ request: post(good), env, waitUntil: (p) => waited.push(p) });
  await Promise.all(waited);
  assert.equal(res.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].business, "Acme HVAC");
  assert.equal(calls[0].email, "owner@acme.example");
  assert.ok([...env.SAMPLE_REQUESTS.store.keys()].some((k) => k.startsWith("req:")));
}

// 2. A broken alert never breaks the form.
{
  const waited = [];
  const env = { SAMPLE_REQUESTS: kv(), SAMPLE_ALERT: { fetch: async () => { throw new Error("down"); } } };
  const res = await onRequestPost({ request: post(good), env, waitUntil: (p) => waited.push(p) });
  await Promise.all(waited);
  assert.equal(res.status, 200);
}

// 3. Honeypot and invalid requests don't alert; no binding still works.
{
  const calls = [];
  const env = { SAMPLE_REQUESTS: kv(), SAMPLE_ALERT: { fetch: async () => { calls.push(1); return new Response("{}"); } } };
  await onRequestPost({ request: post({ ...good, company_url: "spam" }), env, waitUntil: () => {} });
  await onRequestPost({ request: post({ ...good, email: "nope" }), env, waitUntil: () => {} });
  assert.equal(calls.length, 0);
  const res = await onRequestPost({ request: post(good), env: { SAMPLE_REQUESTS: kv() }, waitUntil: () => {} });
  assert.equal(res.status, 200);
}

// 4. The email: reply goes to the requester, subject can't inject headers.
{
  const msg = buildAlert({ ...good, business: "Evil\r\nBcc: x@y.z", at: "2026-10-19T07:00:00Z", id: "abc", city: "Kalispell", country: "US" }, "cass@example.com");
  assert.equal(msg.subject, "Free sample request: Evil Bcc: x@y.z");
  assert.equal(msg.replyTo, "owner@acme.example");
  assert.equal(msg.to, "cass@example.com");
  assert.match(msg.text, /Where: Kalispell, US/);
  assert.match(msg.text, /How a heat pump works/);
  assert.equal(buildAlert({ ...good, email: "bad" }).replyTo, undefined);
}

// 5. The worker sends through its binding and reports failures as 502.
{
  const sent = [];
  const ok = await worker.fetch(new Request("https://x/", { method: "POST", body: JSON.stringify(good) }), { ALERT_TO: "cass@example.com", ALERT_EMAIL: { send: async (m) => { sent.push(m); return { messageId: "m1" }; } } });
  assert.equal(ok.status, 200);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, "cass@example.com");
  const bad = await worker.fetch(new Request("https://x/", { method: "POST", body: JSON.stringify(good) }), { ALERT_EMAIL: { send: async () => { const e = new Error("no"); e.code = "E_SENDER_NOT_VERIFIED"; throw e; } } });
  assert.equal(bad.status, 502);
  assert.equal((await worker.fetch(new Request("https://x/"), {})).status, 405);
}

console.log("sample-alert tests passed");
