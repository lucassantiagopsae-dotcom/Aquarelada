// API para capturar leads dos formularios, armazenar no Upstash Redis
// e disparar o e-mail automatico de acesso ao Super Manual via Resend

const SOURCE_LABELS = {
  "pagina-editora": "Pagina da editora",
  "qr-code-livro": "QR Code do livro",
  "qrcode-livro": "QR Code do livro",
  "qr-livro": "QR Code do livro",
  "formulario-isca": "Formulario isca",
  "isca": "Formulario isca",
  "formulario-manual": "Formulario do manual",
  "manual-access": "Formulario do manual"
};

function sanitize(value) {
  return String(value || "").trim();
}

// @upstash/redis ja serializa/desserializa JSON automaticamente. Le o valor
// aceitando tanto uma string (comportamento antigo/manual) quanto um valor
// ja desserializado pelo cliente, sem chamar JSON.parse em algo que ja e objeto.
function parseStoredList(value) {
  if (value == null) return [];
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? value : [];
}

function parseStoredObject(value) {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

function escapeHtml(value) {
  return sanitize(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sourceKey(payload) {
  const raw = sanitize(payload.attribution && payload.attribution.source).toLowerCase();
  if (raw.includes("qr") && raw.includes("livro")) return "qr-code-livro";
  if (raw.includes("isca")) return "formulario-isca";
  if (raw.includes("editora") || payload.form === "publisher") return "pagina-editora";
  return raw || "formulario-manual";
}

function sourceLabel(key) {
  return SOURCE_LABELS[key] || key.replace(/-/g, " ");
}

function tagsFor(payload, key) {
  const originalTags = Array.isArray(payload.attribution && payload.attribution.tags)
    ? payload.attribution.tags
    : [];
  return Array.from(new Set(["lead", key, payload.form].concat(originalTags).filter(Boolean)));
}

function replyCopy(key) {
  const copies = {
    "pagina-editora": {
      subject: "Voce esta na lista da Aquarelada",
      title: "Cadastro recebido!",
      body: "Obrigado por querer acompanhar a Aquarelada Editora. Vamos te avisar sobre novidades, lancamentos e materiais especiais para colorir a infancia com historias e brincadeiras."
    },
    "qr-code-livro": {
      subject: "Seu acesso ao Super Manual",
      title: "Que bom ter voce por aqui!",
      body: "Voce chegou pelo livro Um Dia Diferente, Como Era Antigamente!. O Super Manual fica aqui para quando quiser transformar a leitura em uma brincadeira de verdade."
    },
    "formulario-isca": {
      subject: "Seu material da Aquarelada chegou",
      title: "Aqui esta o seu acesso.",
      body: "Obrigado por se cadastrar. Guardamos seu acesso para que voce possa voltar ao material, escolher uma brincadeira e comecar quando quiser."
    },
    "formulario-manual": {
      subject: "Seu acesso ao Super Manual",
      title: "Seu Super Manual esta liberado.",
      body: "Agora e so voltar ao manual quando quiser e escolher uma brincadeira para comecar. Cinco minutos tambem podem virar memoria."
    }
  };
  return copies[key] || copies["formulario-manual"];
}

function leadNotifyHtml(payload, key, tags) {
  const attribution = payload.attribution || {};
  return `
    <h2>Novo lead Aquarelada</h2>
    <p><strong>Origem:</strong> ${escapeHtml(sourceLabel(key))}</p>
    <p><strong>Tags:</strong> ${escapeHtml(tags.join(", "))}</p>
    <hr>
    <p><strong>Nome:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(payload.email)}</p>
    <p><strong>WhatsApp:</strong> ${escapeHtml(payload.whatsapp)}</p>
    <p><strong>Mensagem:</strong> ${escapeHtml(payload.message)}</p>
    <hr>
    <p><strong>Pagina:</strong> ${escapeHtml(attribution.landingPage)}</p>
    <p><strong>Referrer:</strong> ${escapeHtml(attribution.referrer)}</p>
    <p><strong>Criado em:</strong> ${escapeHtml(payload.createdAt)}</p>
  `;
}

function replyHtml(payload, copy, baseUrl) {
  return `
    <h2>${escapeHtml(copy.title)}</h2>
    <p>Oi, ${escapeHtml(payload.name || "tudo bem")}.</p>
    <p>${escapeHtml(copy.body)}</p>
    <p><a href="${escapeHtml(baseUrl)}/supermanual/acesso">Acessar o Super Manual</a></p>
    <p>Com carinho,<br>Aquarelada Editora</p>
  `;
}

async function sendResendEmail({ apiKey, from, to, subject, html, replyTo }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      reply_to: replyTo
    })
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Resend email failed");
  }
  return response.json();
}

async function dispatchEmails(lead, request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true, reason: "missing-resend-key" };

  const key = sourceKey(lead);
  const tags = tagsFor(lead, key);
  const from = process.env.LEAD_FROM_EMAIL || "Aquarelada <onboarding@resend.dev>";
  const replyFrom = process.env.LEAD_REPLY_FROM || from;
  const notifyTo = process.env.LEAD_NOTIFY_TO;
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host");
  const baseUrl = process.env.PUBLIC_BASE_URL || `${protocol}://${host}`;

  const result = { key, tags };

  try {
    const copy = replyCopy(key);
    await sendResendEmail({
      apiKey,
      from,
      to: lead.email,
      subject: copy.subject,
      html: replyHtml(lead, copy, baseUrl),
      replyTo: replyFrom
    });
    result.reply = "sent";
  } catch (error) {
    console.error("Erro ao enviar e-mail de acesso ao lead:", error);
    result.reply = "failed";
  }

  if (notifyTo) {
    try {
      await sendResendEmail({
        apiKey,
        from,
        to: notifyTo.split(",").map((item) => item.trim()).filter(Boolean),
        subject: `[Aquarelada] Novo lead - ${sourceLabel(key)}`,
        html: leadNotifyHtml(lead, key, tags),
        replyTo: lead.email
      });
      result.notify = "sent";
    } catch (error) {
      console.error("Erro ao enviar notificacao interna de lead:", error);
      result.notify = "failed";
    }
  }

  return result;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { form, name, email, whatsapp, message, attribution } = body;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Nome e e-mail sao obrigatorios" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const lead = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      form: form || "unknown",
      name: sanitize(name),
      email: sanitize(email).toLowerCase(),
      whatsapp: sanitize(whatsapp),
      message: sanitize(message),
      attribution: attribution || {},
      createdAt: new Date().toISOString(),
      source: "web-form",
      status: "active"
    };

    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { Redis } = await import("@upstash/redis");
        const redis = new Redis({
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN
        });

        await redis.set(`lead:${lead.id}`, lead);

        const formLeadsKey = `leads:${lead.form}`;
        const existingLeads = await redis.get(formLeadsKey);
        const leadsList = parseStoredList(existingLeads);
        leadsList.push(lead.id);
        await redis.set(formLeadsKey, leadsList);

        const allLeadsKey = "leads:all";
        const allLeads = await redis.get(allLeadsKey);
        const allLeadsList = parseStoredList(allLeads);
        allLeadsList.push(lead.id);
        await redis.set(allLeadsKey, allLeadsList);
      } catch (redisError) {
        console.error("Erro ao armazenar no Redis:", redisError);
      }
    } else {
      console.log("Upstash Redis nao configurado. Lead recebido (nao armazenado):", lead);
    }

    const emailResult = await dispatchEmails(lead, request);

    return new Response(
      JSON.stringify({ success: true, leadId: lead.id, email: emailResult }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao processar lead:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno ao processar lead" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const form = searchParams.get("form");

    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Upstash Redis nao configurado", leads: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    });

    const leadsKey = form ? `leads:${form}` : "leads:all";
    const leadsIds = await redis.get(leadsKey);
    const leadsList = parseStoredList(leadsIds);

    const leads = await Promise.all(
      leadsList.map(async (id) => {
        const leadData = await redis.get(`lead:${id}`);
        return parseStoredObject(leadData);
      })
    );

    return new Response(
      JSON.stringify({ leads: leads.filter(Boolean), total: leads.filter(Boolean).length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao listar leads:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao listar leads" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
