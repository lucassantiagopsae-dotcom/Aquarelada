import { createHash, randomUUID } from "node:crypto";

const GRAPH_API_VERSION = "v21.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
const REQUIRED_ENV = ["META_PIXEL_ID", "META_ACCESS_TOKEN"];

function sanitize(value) {
  return String(value || "").trim();
}

function safeLower(value) {
  return sanitize(value).toLowerCase();
}

function normalizePhone(value) {
  return sanitize(value).replace(/\D/g, "");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function parseCookies(cookieHeader) {
  return sanitize(cookieHeader)
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((cookies, chunk) => {
      const separator = chunk.indexOf("=");
      if (separator === -1) return cookies;
      const key = chunk.slice(0, separator).trim();
      const value = chunk.slice(separator + 1).trim();
      if (!key) return cookies;
      try {
        cookies[key] = decodeURIComponent(value);
      } catch {
        cookies[key] = value;
      }
      return cookies;
    }, {});
}

function requestHeader(request, name) {
  return request && request.headers && request.headers.get
    ? request.headers.get(name)
    : "";
}

function cleanCustomData(customData) {
  return Object.entries(customData || {}).reduce((clean, [key, value]) => {
    if (value == null || value === "") return clean;
    clean[key] = typeof value === "string" ? value.slice(0, 500) : value;
    return clean;
  }, {});
}

function safeMetaResponse(body) {
  if (!body || typeof body !== "object") return {};
  const error = body.error && typeof body.error === "object" ? body.error : null;
  return {
    events_received: body.events_received,
    fbtrace_id: body.fbtrace_id || (error && error.fbtrace_id),
    error_code: error && error.code,
    error_type: error && error.type,
    error_message: error && error.message
  };
}

function missingEnv() {
  return REQUIRED_ENV.filter((key) => !sanitize(process.env[key]));
}

function hashedArray(value, normalizer) {
  const normalized = normalizer(value);
  return normalized ? [sha256(normalized)] : undefined;
}

function resolveEventSourceUrl(request, fallbackUrl) {
  const fallback = sanitize(fallbackUrl);
  if (fallback) return fallback;
  if (request && request.url) return request.url;

  const protocol = requestHeader(request, "x-forwarded-proto") || "https";
  const host = requestHeader(request, "host");
  return host ? `${protocol}://${host}` : "";
}

export function createMetaEventId(prefix = "meta") {
  if (typeof randomUUID === "function") return `${prefix}-${randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildMetaUserData({ request, email, phone, userData = {} }) {
  const cookies = parseCookies(requestHeader(request, "cookie"));
  const clientUserAgent =
    sanitize(userData.client_user_agent) || sanitize(requestHeader(request, "user-agent"));
  const fbp = sanitize(userData.fbp) || sanitize(cookies._fbp);
  const fbc = sanitize(userData.fbc) || sanitize(cookies._fbc);

  return cleanCustomData({
    em: hashedArray(email, safeLower),
    ph: hashedArray(phone, normalizePhone),
    client_user_agent: clientUserAgent,
    fbp,
    fbc
  });
}

export async function sendMetaEvent({
  request,
  eventName,
  eventId,
  eventSourceUrl,
  email,
  phone,
  userData,
  customData,
  actionSource = "website"
}) {
  const name = sanitize(eventName);
  if (!name) {
    return { ok: false, skipped: true, reason: "missing-event-name" };
  }

  const id = sanitize(eventId) || createMetaEventId(name.toLowerCase());
  const missing = missingEnv();
  if (missing.length) {
    console.warn(`[Meta CAPI] Evento ${name} ignorado: variaveis ausentes (${missing.join(", ")})`);
    return { ok: false, skipped: true, reason: "missing-env", missing, eventName: name, eventId: id };
  }

  const pixelId = sanitize(process.env.META_PIXEL_ID);
  const accessToken = sanitize(process.env.META_ACCESS_TOKEN);
  const event = {
    event_name: name,
    event_time: Math.floor(Date.now() / 1000),
    action_source: actionSource,
    event_source_url: resolveEventSourceUrl(request, eventSourceUrl),
    user_data: buildMetaUserData({ request, email, phone, userData }),
    custom_data: cleanCustomData(customData),
    event_id: id
  };

  const body = cleanCustomData({
    data: [event],
    test_event_code: sanitize(process.env.META_TEST_EVENT_CODE)
  });

  try {
    const response = await fetch(`${GRAPH_API_BASE}/${encodeURIComponent(pixelId)}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...body,
        access_token: accessToken
      })
    });
    const responseBody = await response.json().catch(() => ({}));
    const safeResponse = safeMetaResponse(responseBody);

    if (!response.ok) {
      console.error(`[Meta CAPI] Falha ao enviar ${name}: status ${response.status}`, safeResponse);
      return {
        ok: false,
        status: response.status,
        eventName: name,
        eventId: id,
        response: safeResponse
      };
    }

    console.log(`[Meta CAPI] Evento ${name} enviado`, {
      event_id: id,
      events_received: safeResponse.events_received,
      fbtrace_id: safeResponse.fbtrace_id
    });

    return {
      ok: true,
      status: response.status,
      eventName: name,
      eventId: id,
      response: safeResponse
    };
  } catch (error) {
    console.error(`[Meta CAPI] Erro de rede ao enviar ${name}:`, error && error.message);
    return {
      ok: false,
      eventName: name,
      eventId: id,
      error: "network-error"
    };
  }
}

