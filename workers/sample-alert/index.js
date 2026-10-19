// Emails Cass when someone asks for a free sample on cassrices.com.
// Called only by functions/api/sample-request.js through the SAMPLE_ALERT service binding.
// The recipient is ALERT_TO in wrangler.toml; the send_email binding is locked to that
// same address. (`send()` needs an explicit `to`, despite the docs saying it defaults.)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM = { email: "samples@cassrices.com", name: "cassrices.com" };

const oneLine = (v, max) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

export function buildAlert(r, to) {
  const business = oneLine(r.business, 120) || "(no name)";
  const email = oneLine(r.email, 200);
  const where = [r.city, r.country].map((v) => oneLine(v, 80)).filter(Boolean).join(", ");
  const text = [
    `Business: ${business}`,
    `Website: ${oneLine(r.website, 300)}`,
    `Email: ${email}`,
    `Where: ${where || "unknown"}`,
    `When: ${oneLine(r.at, 40)}`,
    "",
    "What they want explained:",
    String(r.topic ?? "").slice(0, 2000),
    "",
    "Reply to this email to answer them directly.",
    `Request id: ${oneLine(r.id, 60)}`,
  ].join("\n");
  const msg = { to, from: FROM, subject: `Free sample request: ${business}`, text };
  if (EMAIL_RE.test(email)) msg.replyTo = email;
  return msg;
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
    let record;
    try { record = await request.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
    try {
      const { messageId } = await env.ALERT_EMAIL.send(buildAlert(record, env.ALERT_TO));
      console.log("sample alert sent", messageId);
      return Response.json({ ok: true, messageId });
    } catch (e) {
      console.error("sample alert failed", e.code, e.message);
      return Response.json({ ok: false, code: e.code || null }, { status: 502 });
    }
  },
};
