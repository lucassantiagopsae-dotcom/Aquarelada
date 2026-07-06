(function () {
  const data = window.SUPERMANUAL_GENERATED || window.SUPERMANUAL || { opening: [], brincadeiras: [], grouped: {}, pdfs: {} };

  const playFilters = [
    { icon: "📖", title: "Brincadeiras do Livro", tag: "Livro", text: "As brincadeiras que se conectam diretamente ao livro." },
    { icon: "⚡", title: "Rápidas", tag: "Rápida", text: "Para começar em poucos minutos." },
    { icon: "⏳", title: "Tenho Bastante Tempo", tag: "Bastante tempo", text: "Para quando dá para brincar com mais calma." },
    { icon: "🏠", title: "Dentro de Casa", tag: "Dentro de casa", text: "Boas para sala, quarto, mesa ou dias de chuva." },
    { icon: "🌳", title: "Ao Ar Livre", tag: "Ao ar livre", text: "Para quintal, praça, pátio, parque ou rua segura." },
    { icon: "🏅", title: "Clássicos da Infância", tag: "Clássico", text: "Aquelas que atravessam gerações." },
    { icon: "🪁", title: "Todas Brincadeiras", tag: "Todas", text: "A lista completa para escolher livremente." }
  ];

  function byId(id) {
    return document.getElementById(id);
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function sourceAttribution(formType) {
    const query = params();
    const source =
      query.get("origem") ||
      query.get("source") ||
      query.get("src") ||
      query.get("ref") ||
      query.get("utm_campaign") ||
      query.get("utm_source") ||
      (formType === "publisher" ? "pagina-editora" : "formulario-manual");
    const tags = [
      "lead",
      formType,
      source,
      query.get("utm_source") && `utm:${query.get("utm_source")}`,
      query.get("utm_medium") && `medium:${query.get("utm_medium")}`,
      query.get("utm_campaign") && `campaign:${query.get("utm_campaign")}`
    ].filter(Boolean);

    return {
      source,
      tags,
      path: window.location.pathname,
      landingPage: window.location.href,
      referrer: document.referrer || ""
    };
  }

  async function sendLead(payload) {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error("Nao foi possivel enviar o cadastro.");
    }
    return response.json().catch(() => ({}));
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  const categoryTitles = {
    Livro: [
      "Elástico", "Carrinho de Rolimã", "Amarelinha", "Pião", "Pipa", "Ioiô",
      "Corrida de saco", "Taco", "Bolinha de Gude", "Cama de Gato", "Cabaninha"
    ],
    Rápida: [
      "Estátua", "Morto-Vivo", "O Mestre Mandou", "Batata Quente", "Passa Chapéu",
      "Adoleta", "Passa-Anel", "Telefone Sem Fio", "Espião", "Quente ou Frio",
      "Mímica", "Mão com Mão", "Mudando de Lugar", "Segura e Larga",
      "Desafio: Adivinhe a Sequência", "Vovó Viajou", "Forca", "Jogo da Memória",
      "Adivinhe o que é?", "Bola ao Alvo", "Boliche com Garrafas PET", "Bambolê",
      "Ioiô", "Rodar Pião", "Cinco Marias", "Cama de Gato"
    ],
    "Dentro de casa": [
      "Boliche com Garrafas PET", "Mímica", "Mudando de Lugar", "Segura e Larga",
      "Mão com Mão", "Nariz de Palhaço", "Dança das Cadeiras", "Estátua",
      "Morto-Vivo", "O Mestre Mandou", "Batata Quente", "Passa-Anel",
      "Telefone Sem Fio", "Espião", "Eu Espio", "Jogo do \"Se\"", "Quente ou Frio",
      "Vovó Viajou", "Forca", "Stop", "Jogo da Memória", "Adivinhe o que é?",
      "Cinco Marias", "Cama de Gato"
    ],
    "Ao ar livre": [
      "Gato e Rato das Tocas", "A Toca do Leão", "Batatinha Frita 1, 2, 3",
      "Boca de Forno", "Amarelinha", "Amarelinha Africana", "Dia-a-Dia",
      "Gato e Rato na Roda", "O Lobo e os Porquinhos", "Taco", "Bolinha de Gude",
      "Ciranda, Cirandinha", "Pega-Pega Congela", "Rouba-Bandeira", "Dono da Rua",
      "Carrinho de Rolimã", "Pião", "Pipa", "Barra-Manteiga", "Quebra-Corrente",
      "Cabo de Guerra", "Corrida de Saco", "Pé de Lata", "Esquibunda", "Estátua",
      "Morto-Vivo", "O Mestre Mandou", "Mamãe, Posso Ir?", "Bambolê", "Bola ao Alvo",
      "Dança das Cadeiras"
    ],
    Clássico: [
      "Amarelinha", "Batata Quente", "Boca de Forno", "Cabo de Guerra",
      "Cama de Gato", "Cinco Marias", "Ciranda, Cirandinha", "Corrida de Saco",
      "Dança das Cadeiras", "Esconde-Esconde", "Estátua", "Forca", "Mímica",
      "Morto-Vivo", "O Mestre Mandou", "Passa-Anel", "Pega-Pega", "Pião",
      "Pular Corda", "Queimada", "Rouba-Bandeira", "Stop", "Telefone Sem Fio",
      "Bolinha de Gude", "Pipa", "Ioiô"
    ]
  };

  function applyOfficialCategories() {
    const categoryTags = ["Livro", "Rápida", "Dentro de casa", "Ao ar livre", "Clássico"];
    const sets = Object.fromEntries(
      Object.entries(categoryTitles).map(([tag, titles]) => [tag, new Set(titles.map(normalize))])
    );
    data.brincadeiras.forEach((play) => {
      const names = [play.title].concat(play.aliases || []).map(normalize);
      play.tags = (play.tags || []).filter((tag) => !categoryTags.includes(tag));
      Object.entries(sets).forEach(([tag, titles]) => {
        if (names.some((name) => titles.has(name))) play.tags.push(tag);
      });
      if (play.tags.includes("Rápida")) {
        play.tags = play.tags.filter((tag) => tag !== "Bastante tempo");
      }
    });
  }

  applyOfficialCategories();

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function paragraphLines(value) {
    return String(value || "")
      .split(/\n+/)
      .filter(Boolean)
      .map((line) => `<p>${escapeHtml(line)}</p>`)
      .join("");
  }

  function linkedText(value) {
    const escaped = escapeHtml(value);
    return escaped.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noreferrer">$1</a>'
    );
  }

  function visual(play, className) {
    if (play.image) {
      return `<img src="${play.image}" alt="">`;
    }
    return `<span class="${className || "visual-tile"}" aria-hidden="true">${play.icon || "🎲"}</span>`;
  }

  function card(play) {
    const tags = play.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
    const sourceTag = params().get("tag");
    const itemHref = `/item/?slug=${play.slug}${sourceTag ? `&tag=${encodeURIComponent(sourceTag)}` : ""}`;
    return `
      <article class="play-card" data-tags="${play.tags.join("|")}">
        <a class="play-card-image" href="${itemHref}" aria-label="Ver ${escapeHtml(play.title)}">
          ${visual(play)}
        </a>
        <div class="play-card-body">
          <h3>${escapeHtml(play.title)}</h3>
          <p>${escapeHtml(play.subtitle)}</p>
          <div class="tags">${tags}</div>
          <div class="actions-row">
            <a class="btn light" href="${itemHref}">Ver brincadeira</a>
            <a class="btn light" href="${play.pdf}" download>Baixar PDF</a>
          </div>
        </div>
      </article>
    `;
  }

  function initCapture() {
    const form = byId("capture-form");
    if (!form) return;
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const button = form.querySelector("button[type='submit']");
      const payload = {
        form: "manual-access",
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        whatsapp: form.whatsapp.value.trim(),
        createdAt: new Date().toISOString(),
        attribution: sourceAttribution("manual-access")
      };
      localStorage.setItem("supermanualLead", JSON.stringify(payload));
      if (button) button.disabled = true;
      try {
        await sendLead(payload);
      } catch (error) {
        console.warn(error);
      } finally {
        window.location.href = manualUrl("/acesso/");
      }
    });
  }

  function manualUrl(page) {
    return scopedRoute(page);
  }

  function cleanRoute(pathname) {
    let route = String(pathname || window.location.pathname || "/")
      .replace(/^\/supermanual(?=\/)/, "")
      .replace(/\/index\.html$/, "/")
      .replace(/\.html$/, "/");
    if (!route.startsWith("/")) route = `/${route}`;
    if (!route.endsWith("/")) route += "/";
    return route;
  }

  function scopedRoute(route) {
    const clean = cleanRoute(route);
    return window.location.pathname.startsWith("/supermanual/")
      ? `/supermanual${clean}`
      : clean;
  }

  function currentPageHref() {
    return scopedRoute(cleanRoute(window.location.pathname));
  }

  function initPublisherForm() {
    const form = byId("publisher-form");
    if (!form) return;
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const button = form.querySelector("button[type='submit']");
      const feedback = byId("publisher-form-feedback");
      const payload = {
        form: "publisher",
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        message: form.message.value.trim(),
        createdAt: new Date().toISOString(),
        attribution: sourceAttribution("publisher")
      };
      localStorage.setItem("aquareladaLead", JSON.stringify(payload));
      if (button) button.disabled = true;
      if (feedback) feedback.textContent = "Enviando cadastro...";
      try {
        await sendLead(payload);
        if (feedback) feedback.textContent = "Cadastro registrado. Obrigado pelo contato!";
        form.reset();
      } catch (error) {
        console.warn(error);
        if (feedback) feedback.textContent = "Cadastro registrado. Obrigado pelo contato!";
      } finally {
        if (button) button.disabled = false;
      }
    });
  }

  function initAccessSearch() {
    const form = byId("manual-search-form");
    const input = byId("manual-search");
    if (!form || !input) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const value = input.value.trim();
      window.location.href = value ? `/brincadeiras/?q=${encodeURIComponent(value)}` : "/brincadeiras/";
    });
  }

  function initOpeningModal() {
    const mount = byId("opening-modal");
    if (!mount || localStorage.getItem("supermanualOpeningHidden") === "1") return;
    mount.innerHTML = `
      <div class="modal-backdrop" role="presentation"></div>
      <section class="opening-dialog" role="dialog" aria-modal="true" aria-labelledby="opening-title">
        <p class="eyebrow">Antes de começar</p>
        <h2 id="opening-title">Super Manual de Brincadeiras</h2>
        <div class="opening-copy">${data.opening.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}</div>
        <label class="check-row"><input type="checkbox" id="hide-opening"> Não visualizar no próximo acesso</label>
        <button class="btn primary" type="button" id="close-opening">Acessar o manual</button>
      </section>
    `;
    byId("close-opening").addEventListener("click", function () {
      if (byId("hide-opening").checked) {
        localStorage.setItem("supermanualOpeningHidden", "1");
      }
      mount.innerHTML = "";
    });
  }

  let deferredInstallPrompt = null;

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredInstallPrompt = event;
  });

  function initInstallApp() {
    const button = byId("install-app-button");
    const modal = byId("install-app-modal");
    if (!button || !modal) return;

    function openInstructions() {
      modal.hidden = false;
      document.body.classList.add("modal-open");
    }

    function closeInstructions() {
      modal.hidden = true;
      document.body.classList.remove("modal-open");
    }

    button.addEventListener("click", async function () {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        try {
          await deferredInstallPrompt.userChoice;
        } finally {
          deferredInstallPrompt = null;
        }
      }
      openInstructions();
    });

    modal.addEventListener("click", function (event) {
      if (event.target === modal || event.target.closest("[data-close-install]")) {
        closeInstructions();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) closeInstructions();
    });
  }

  function initBrincadeiras() {
    const app = byId("brincadeiras-app");
    if (!app) return;
    const query = params();
    const tag = query.get("tag");
    const termFromUrl = query.get("q") || "";
    const isSubmenu = Boolean(tag);

    if (!tag && !termFromUrl) {
      app.innerHTML = `
        <div class="subcategory-grid">
          ${playFilters.map((filter) => `
            <a class="category-card subcategory-card" href="/brincadeiras/?tag=${encodeURIComponent(filter.tag)}" style="--accent:${accentFor(filter.tag)}">
              <span class="icon">${filter.icon}</span>
              <div><h3>${filter.title}</h3><p>${filter.text}</p></div>
              <strong>Explorar</strong>
            </a>
          `).join("")}
        </div>
        <div class="actions-row page-end-actions"><a class="btn light" href="/acesso/">Voltar</a></div>
      `;
      return;
    }

    const active = tag || "Todas";
    if (isSubmenu) document.body.classList.add("compact-category-page");
    app.innerHTML = `
      ${isSubmenu ? "" : `<div class="search-panel">
        <input class="search-input" id="play-search" type="search" placeholder="Buscar brincadeira" value="${escapeHtml(termFromUrl)}">
        <button class="btn secondary" id="clear-search" type="button">Limpar</button>
      </div>`}
      <div class="filters" id="filters"></div>
      <div class="grid three" id="play-grid"></div>
      <div class="empty-state" id="empty-state" hidden>Nenhuma brincadeira encontrada.</div>
      <div class="actions-row page-end-actions">
        <a class="btn light" href="/brincadeiras/">Voltar às subcategorias</a>
        <a class="btn light" href="/acesso/">Voltar</a>
      </div>
    `;

    const filtersEl = byId("filters");
    const grid = byId("play-grid");
    const empty = byId("empty-state");
    const search = byId("play-search");
    let current = active;

    filtersEl.innerHTML = playFilters
      .map((filter) => `<button class="filter-btn${filter.tag === current ? " active" : ""}" type="button" data-filter="${filter.tag}">${filter.icon} ${filter.title}</button>`)
      .join("");

    function render() {
      const term = normalize(search ? search.value : termFromUrl);
      const filtered = data.brincadeiras.filter((play) => {
        const matchFilter = current === "Todas" || play.tags.includes(current);
        const haystack = normalize([play.title, play.subtitle, play.description, play.tags.join(" "), play.aliases.join(" ")].join(" "));
        return matchFilter && (!term || haystack.includes(term));
      });
      grid.innerHTML = filtered.map(card).join("");
      empty.hidden = filtered.length > 0;
    }

    filtersEl.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-filter]");
      if (!button) return;
      current = button.dataset.filter;
      filtersEl.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.toggle("active", btn === button));
      render();
    });

    if (search) {
      search.addEventListener("input", render);
      byId("clear-search").addEventListener("click", function () {
        search.value = "";
        render();
      });
    }

    render();
  }

  function accentFor(tag) {
    return {
      Livro: "#f4bd45",
      Rápida: "#ef6b5a",
      "Dentro de casa": "#4f9f68",
      "Ao ar livre": "#2b8fb8",
      "Bastante tempo": "#7b6cc7",
      Clássico: "#f4bd45",
      Todas: "#243042"
    }[tag] || "#f4bd45";
  }

  function initItem() {
    const app = byId("item-app");
    if (!app) return;
    const slug = params().get("slug") || data.brincadeiras[0]?.slug;
    const play = data.brincadeiras.find((item) => item.slug === slug) || data.brincadeiras[0];
    if (!play) return;
    document.title = `${play.title} | Super Manual de Brincadeiras`;

    const returnTag = params().get("tag");
    const returnHref = returnTag ? `/brincadeiras/?tag=${encodeURIComponent(returnTag)}` : "/brincadeiras/";
    app.innerHTML = `
      <div class="item-layout">
        <article class="article">
          <div class="item-hero-image">${visual(play, "visual-tile large")}</div>
          <p class="eyebrow">Brincadeira</p>
          <h1>${escapeHtml(play.title)}</h1>
          ${play.aliases.length ? `<p class="alias">Também conhecido como: ${escapeHtml(play.aliases.join(", "))}</p>` : ""}
          <p class="lead">${escapeHtml(play.subtitle)}</p>
          ${listSection("Como brincar", play.steps)}
          ${section("Desfecho da rodada", paragraphLines(play.ending))}
          ${play.modes.length ? listSection("Modos tradicionais de brincar", play.modes) : ""}
          ${section("Desenvolvimento da criança", paragraphLines(play.development))}
          ${section("Cuidados e segurança", paragraphLines(play.safety))}
          ${play.youtube.length ? listSection("Vídeo de apoio no YouTube", play.youtube.map((url) => `<a href="${url}" target="_blank" rel="noreferrer">${url}</a>`), true) : ""}
        </article>

        <aside class="side-panel">
          <div class="fact"><span>Idade recomendada</span>${escapeHtml(play.age)}</div>
          <div class="fact"><span>Participantes</span>${escapeHtml(play.participants)}</div>
          <div class="fact"><span>Materiais</span>${escapeHtml(play.materials)}</div>
          <a class="btn primary" href="${play.pdf}" download>Baixar PDF</a>
          <a class="btn light" href="${returnHref}">Voltar</a>
          <a class="btn light" href="/brincadeiras/">Voltar às subcategorias</a>
        </aside>
      </div>
    `;
  }

  function section(title, body) {
    if (!body) return "";
    return `<div class="article-section"><h2>${title}</h2>${body}</div>`;
  }

  function listSection(title, items, alreadyHtml) {
    if (!items || !items.length) return "";
    return `<div class="article-section"><h2>${title}</h2><ol>${items.map((item) => `<li>${alreadyHtml ? item : escapeHtml(item)}</li>`).join("")}</ol></div>`;
  }

  function initGrouped() {
    const mount = byId("grouped-content");
    if (!mount) return;
    const type = mount.dataset.type;
    const content = data.grouped[type] || [];
    const pdf = data.pdfs[type];

    if (Array.isArray(content)) {
      mount.classList.remove("grid", "three");
      mount.innerHTML = simpleContent(content, type);
      return;
    }

    const selected = params().get("grupo");
    if (!selected) {
      mount.classList.remove("grid", "three");
      mount.innerHTML = `
        <div class="subcategory-grid">
          ${content.blocks.map((block, index) => `
            <a class="category-card subcategory-card" href="${currentPageHref()}?grupo=${index}" style="--accent:${["#f4bd45", "#2b8fb8", "#4f9f68", "#7b6cc7", "#ef6b5a", "#2b8fb8"][index % 6]}">
              <span class="icon">${index + 1}</span>
              <div><h3>${escapeHtml(block.title)}</h3><p>${escapeHtml((block.items || []).slice(0, 2).join(" ").slice(0, 130))}...</p></div>
              <strong>Abrir</strong>
            </a>
          `).join("")}
        </div>
        <div class="actions-row page-end-actions"><a class="btn light" href="/acesso/">Voltar</a></div>
      `;
      return;
    }

    const block = content.blocks[Number(selected)] || content.blocks[0];
    document.body.classList.add("compact-category-page");
    mount.classList.remove("grid", "three");
    mount.innerHTML = `
      ${groupCard(block, true)}
      <div class="actions-row page-end-actions">
        <a class="btn light" href="${currentPageHref()}">Voltar às subcategorias</a>
        <a class="btn light" href="/acesso/">Voltar</a>
      </div>
    `;
  }

  function groupCard(group, full) {
    return `
      <article class="content-card${full ? " full" : ""}">
        <h3>${escapeHtml(group.title)}</h3>
        <div class="content-flow">${flowContent(group.items || [])}</div>
      </article>
    `;
  }

  function simpleContent(groups, type) {
    const intro = groups[0]?.title === "Para começar" ? groups[0] : null;
    const remaining = intro ? groups.slice(1) : groups;
    if (type === "dobraduras") {
      const items = intro ? intro.items : (groups[0]?.items || []);
      return `
        ${introBlock(items.slice(0, 1))}
        <div class="grid three">${foldingCards(items.slice(1))}</div>
        <div class="actions-row page-end-actions"><a class="btn light" href="/acesso/">Voltar</a></div>
      `;
    }
    return `
      ${intro ? introBlock(intro.items) : ""}
      <div class="grid three">${remaining.map((group) => groupCard(group, false)).join("")}</div>
      <div class="actions-row page-end-actions"><a class="btn light" href="/acesso/">Voltar</a></div>
    `;
  }

  function introBlock(items) {
    if (!items.length) return "";
    return `<div class="category-intro">${items.map((item) => `<p>${linkedText(item)}</p>`).join("")}</div>`;
  }

  function foldingCards(items) {
    const titlePattern = /^(✈️|⛵|🎩|🔮|🐸|🌬️|🐶|🐟|🦋|🌷|🕊️)/;
    const folds = [];
    let current = null;
    items.forEach((item) => {
      if (titlePattern.test(item)) {
        if (current) folds.push(current);
        current = { title: item, lines: [] };
      } else if (current) {
        current.lines.push(item);
      }
    });
    if (current) folds.push(current);
    return folds.map((fold) => `
      <article class="content-card folding-card">
        <h3>${escapeHtml(fold.title)}</h3>
        <div class="content-flow">${flowContent(fold.lines)}</div>
      </article>
    `).join("");
  }

  function flowContent(items) {
    const blocks = [];
    let list = [];
    let collectingList = false;
    function flushList() {
      if (!list.length) return;
      blocks.push(`<ul>${list.map((item) => `<li>${linkedText(item)}</li>`).join("")}</ul>`);
      list = [];
      collectingList = false;
    }
    items.forEach((item, index) => {
      const isHeading = /^(🎵|🗣️|❓)/.test(item);
      const startsList = /^(Depois de pront[oa]:|Este bloco é ideal para:)/.test(item);
      const isVideo = /^🎥 Aprenda a fazer:/.test(item);
      const isLabel = /^Observação:/.test(item);
      const isUrl = /^https?:\/\//.test(item);
      if (isHeading) {
        flushList();
        blocks.push(`<h4>${escapeHtml(item)}</h4>`);
      } else if (startsList) {
        flushList();
        blocks.push(`<p class="content-label">${linkedText(item)}</p>`);
        collectingList = true;
      } else if (isVideo) {
        flushList();
        const inlineUrl = item.match(/https?:\/\/\S+/)?.[0];
        const nextUrl = /^https?:\/\//.test(items[index + 1] || "") ? items[index + 1] : "";
        const url = inlineUrl || nextUrl;
        blocks.push(url
          ? `<p class="content-label video-link">🎥 <a class="inline-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Aprenda a fazer</a></p>`
          : `<p class="content-label">🎥 Aprenda a fazer</p>`);
      } else if (isLabel) {
        flushList();
        blocks.push(`<p class="content-label">${linkedText(item)}</p>`);
      } else if (isUrl) {
        if (/^🎥 Aprenda a fazer:/.test(items[index - 1] || "")) return;
        flushList();
        blocks.push(`<p><a class="inline-link" href="${escapeHtml(item)}" target="_blank" rel="noreferrer">Aprenda a fazer</a></p>`);
      } else if (collectingList && !/[.!?]$/.test(item)) {
        list.push(item);
      } else {
        flushList();
        blocks.push(`<p>${linkedText(item)}</p>`);
      }
    });
    flushList();
    return blocks.join("");
  }

  initCapture();
  initPublisherForm();
  initAccessSearch();
  initInstallApp();
  initOpeningModal();
  initBrincadeiras();
  initItem();
  initGrouped();
})();
