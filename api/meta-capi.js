import { createMetaEventId, sendMetaEvent } from "../lib/meta-capi.js";

const ALLOWED_FRONTEND_EVENTS = new Set(["ClickAmazon"]);

function sanitize(value) {
  return String(value || "").trim();
}

function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders
    }
  });
}

function safeMetaResult(result) {
  return {
    ok: Boolean(result && result.ok),
    skipped: Boolean(result && result.skipped),
    reason: result && result.reason,
    event_id: result && result.eventId
  };
}

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: "JSON invalido" }, 400);
  }

  const eventName = sanitize(body.event_name || body.eventName);
  if (!ALLOWED_FRONTEND_EVENTS.has(eventName)) {
    return json({ error: "Evento nao permitido" }, 400);
  }

  const result = await sendMetaEvent({
    request,
    eventName,
    eventId: sanitize(body.event_id) || createMetaEventId("click-amazon"),
    eventSourceUrl: sanitize(body.event_source_url || body.source_url || body.page_url),
    customData: {
      content_name: sanitize(body.content_name) || "Aquarelada - Livro",
      content_category: "livro",
      button_label: sanitize(body.button_label),
      target_url: sanitize(body.target_url),
      page_path: sanitize(body.page_path)
    }
  });

  return json({ success: true, accepted: true, meta: safeMetaResult(result) }, result.ok || result.skipped ? 200 : 202);
}

export async function GET() {
  return json({ error: "Metodo nao permitido" }, 405, { Allow: "POST" });
}