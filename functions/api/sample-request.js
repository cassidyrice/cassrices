// Free-sample request form for cassrices.com.
// Each valid submission is stored in the SAMPLE_REQUESTS KV namespace
// under a key like "req:2026-10-18T07:12:00.000Z:<uuid>", then Cass gets an email
// through the SAMPLE_ALERT service binding (workers/sample-alert). A failed alert
// never fails the form: the request is already saved in KV.

const LIMITS = { business: 120, website: 300, email: 200, topic: 2000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function reply(request, status, body) {
  const wantsJson = (request.headers.get("Accept") || "").includes("application/json") ||
    (request.headers.get("Content-Type") || "").includes("application/json");
  if (!wantsJson) {
    if (body.ok) return Response.redirect(new URL("/thanks/", request.url).toString(), 303);
    return new Response(body.error || "Error", { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function readBody(request) {
  const type = request.headers.get("Content-Type") || "";
  if (type.includes("application/json")) return await request.json();
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

export async function onRequestPost({ request, env, waitUntil }) {
  if (!env.SAMPLE_REQUESTS) return reply(request, 500, { ok: false, error: "Form storage is not set up yet." });

  let raw;
  try { raw = await readBody(request); } catch { return reply(request, 400, { ok: false, error: "Couldn’t read the form." }); }

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (raw.company_url) return reply(request, 200, { ok: true });

  const data = {};
  for (const [k, max] of Object.entries(LIMITS)) {
    const v = String(raw[k] ?? "").trim();
    if (!v) return reply(request, 400, { ok: false, error: "Please fill in every field." });
    if (v.length > max) return reply(request, 400, { ok: false, error: `That ${k} is too long.` });
    data[k] = v;
  }
  if (!EMAIL_RE.test(data.email)) return reply(request, 400, { ok: false, error: "Please use a valid email address." });

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const throttleKey = `rl:${ip}`;
  if (await env.SAMPLE_REQUESTS.get(throttleKey)) {
    return reply(request, 429, { ok: false, error: "Got it already. Please wait a minute before sending another." });
  }

  const at = new Date().toISOString();
  const id = crypto.randomUUID();
  const record = {
    id, at, ...data,
    country: request.cf?.country || null,
    city: request.cf?.city || null,
    userAgent: (request.headers.get("User-Agent") || "").slice(0, 300),
  };
  await env.SAMPLE_REQUESTS.put(`req:${at}:${id}`, JSON.stringify(record), {
    metadata: { business: data.business.slice(0, 80), email: data.email, at },
  });
  await env.SAMPLE_REQUESTS.put(throttleKey, "1", { expirationTtl: 60 });

  if (env.SAMPLE_ALERT) {
    const alert = env.SAMPLE_ALERT.fetch("https://sample-alert/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    }).then((r) => { if (!r.ok) console.error("sample alert returned", r.status); })
      .catch((e) => console.error("sample alert failed", e && e.message));
    if (waitUntil) waitUntil(alert); else await alert;
  }

  return reply(request, 200, { ok: true, id });
}

export async function onRequest({ request }) {
  return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
}
