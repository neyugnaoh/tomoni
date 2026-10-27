/* ============================================================================
 * azure-tts-worker.js — Cloudflare Worker proxy for Azure Speech (neural TTS)
 *
 * Holds your Azure Speech key server-side and returns MP3 audio with CORS,
 * so the static app can use natural Japanese voices (Nanami/Keita) for free
 * (Azure F0 tier = 500k chars/month).
 *
 * Deploy: see worker/README.md. Set secrets AZURE_KEY and AZURE_REGION.
 * Call:  GET  <worker-url>?text=よんひゃく&voice=ja-JP-NanamiNeural&rate=-8%25
 * ========================================================================== */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(req.url);
    let text, voice, rate;
    if (req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      ({ text, voice, rate } = b);
    } else {
      text = url.searchParams.get("text");
      voice = url.searchParams.get("voice");
      rate = url.searchParams.get("rate");
    }
    voice = voice || "ja-JP-NanamiNeural";
    rate = rate || "-8%";

    if (!text) return json({ error: "missing ?text" }, 400);
    if (text.length > 400) text = text.slice(0, 400);
    if (!env.AZURE_KEY || !env.AZURE_REGION)
      return json({ error: "Worker not configured: set AZURE_KEY and AZURE_REGION secrets" }, 500);
    if (!/^[a-z0-9-]+$/i.test(voice)) return json({ error: "bad voice" }, 400);

    const ssml =
      `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ja-JP'>` +
      `<voice name='${voice}'><prosody rate='${escapeXml(rate)}'>${escapeXml(text)}</prosody></voice></speak>`;

    let az;
    try {
      az = await fetch(`https://${env.AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": env.AZURE_KEY,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
          "User-Agent": "japanese-learner",
        },
        body: ssml,
      });
    } catch (e) {
      return json({ error: "fetch failed: " + (e.message || e) }, 502);
    }
    if (!az.ok) {
      const detail = await az.text().catch(() => "");
      return json({ error: "azure " + az.status, detail: detail.slice(0, 200) }, 502);
    }
    return new Response(az.body, {
      headers: { ...CORS, "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=604800" },
    });
  },
};

function escapeXml(s) {
  return String(s).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&apos;", '"': "&quot;" }[c]));
}
function json(obj, status) {
  return new Response(JSON.stringify(obj), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
