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

function leadHtml(payload, key, tags) {
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
    <p><strong>Criado em:</strong> ${escapeHtml(payload.createdAt || new Date().toISOString())}</p>
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

async function readJson(req) {
  if (req.body) {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function sendResend({ apiKey, from, to, subject, html, replyTo }) {
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

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const payload = await readJson(req);
    const email = sanitize(payload.email);
    if (!email || !email.includes("@")) {
      res.status(400).json({ ok: false, error: "E-mail invalido" });
      return;
    }

    const key = sourceKey(payload);
    const tags = tagsFor(payload, key);
    const apiKey = process.env.RESEND_API_KEY;
    const notifyTo = process.env.LEAD_NOTIFY_TO;
    const from = process.env.LEAD_FROM_EMAIL || "Aquarelada <onboarding@resend.dev>";
    const replyFrom = process.env.LEAD_REPLY_FROM || from;
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const baseUrl = process.env.PUBLIC_BASE_URL || `${protocol}://${req.headers.host}`;

    if (!apiKey || !notifyTo) {
      res.status(202).json({ ok: true, email: "skipped", reason: "missing-env", tags });
      return;
    }

    await sendResend({
      apiKey,
      from,
      to: notifyTo.split(",").map((item) => item.trim()).filter(Boolean),
      subject: `[Aquarelada] Novo lead - ${sourceLabel(key)}`,
      html: leadHtml(payload, key, tags),
      replyTo: email
    });

    const copy = replyCopy(key);
    await sendResend({
      apiKey,
      from: replyFrom,
      to: email,
      subject: copy.subject,
      html: replyHtml(payload, copy, baseUrl)
    });

    res.status(200).json({ ok: true, tags, source: key });
  } catch (error) {
    res.status(502).json({ ok: false, error: error.message || "Erro ao enviar lead" });
  }
};
