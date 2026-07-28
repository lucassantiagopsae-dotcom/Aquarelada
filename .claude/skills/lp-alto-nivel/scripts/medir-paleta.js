/**
 * Mede a distribuição real de cor por área de pixel numa página,
 * para verificar a proporção 70/30/10.
 *
 * Uso A — no console do navegador: cole o conteúdo da IIFE abaixo.
 * Uso B — via Node com a página aberta num browser controlável:
 *          passe o texto de medirPaleta.toString() para o avaliador de JS.
 *
 * Retorna: distribuição por cor, agrupamento em base/oposto/destaque,
 * e um diagnóstico da proporção.
 */

function medirPaleta() {
  const areaPorCor = {};

  document.querySelectorAll("*").forEach((el) => {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    if (!bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent") return;

    const r = el.getBoundingClientRect();
    const area = r.width * r.height;
    // Ignora elementos minúsculos: eles poluem a medição sem afetar a percepção.
    if (area < 500) return;

    areaPorCor[bg] = (areaPorCor[bg] || 0) + area;
  });

  const total = Object.values(areaPorCor).reduce((a, b) => a + b, 0) || 1;

  const luminancia = (cor) => {
    const m = cor.match(/(\d+(?:\.\d+)?)/g);
    if (!m || m.length < 3) return null;
    const [r, g, b] = m.slice(0, 3).map(Number);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  };

  // Croma absoluto (max - min, escala 0-255), não saturação relativa.
  // Saturação relativa ((max-min)/max) é instável em tons escuros: rgb(10,12,16)
  // é praticamente preto mas dá 37% de "saturação", e seria classificado como
  // cor de destaque. Em croma absoluto dá 6, enquanto um laranja vivo dá 227.
  const croma = (cor) => {
    const m = cor.match(/(\d+(?:\.\d+)?)/g);
    if (!m || m.length < 3) return 0;
    const [r, g, b] = m.slice(0, 3).map(Number);
    return Math.max(r, g, b) - Math.min(r, g, b);
  };

  const cores = Object.entries(areaPorCor)
    .map(([cor, area]) => ({
      cor,
      pct: +((area / total) * 100).toFixed(1),
      lum: luminancia(cor),
      croma: croma(cor),
    }))
    .sort((a, b) => b.pct - a.pct);

  // Cor com croma alto conta como destaque, independente do brilho.
  // O resto separa por luminância: claro é base, escuro é o tom oposto.
  const LIMIAR_CROMA = 45;
  let base = 0;
  let oposto = 0;
  let destaque = 0;

  cores.forEach((c) => {
    if (c.lum === null) return;
    if (c.croma > LIMIAR_CROMA) destaque += c.pct;
    else if (c.lum > 0.6) base += c.pct;
    else oposto += c.pct;
  });

  const diagnostico = [];
  if (base < 55) diagnostico.push(`Neutro base em ${base.toFixed(0)}% — abaixo do alvo (~70%). A página pode estar pesada demais.`);
  if (base > 88) diagnostico.push(`Neutro base em ${base.toFixed(0)}% — acima do alvo (~70%). Falta tom oposto para criar peso; é o sintoma clássico da página só branco-e-cinza-clarinho.`);
  if (oposto < 8) diagnostico.push(`Tom oposto em ${oposto.toFixed(0)}% — muito baixo (alvo ~30%; abaixo de 8% é problema). Sem contraste de peso, nenhuma seção consegue ter clímax. É o sintoma da página que só alterna branco com cinza-clarinho.`);
  if (destaque > 18) diagnostico.push(`Cor de destaque em ${destaque.toFixed(0)}% — alta demais (alvo ~10%). Destaque abundante deixa de sinalizar o que importa.`);
  if (destaque < 2) diagnostico.push(`Cor de destaque em ${destaque.toFixed(0)}% — quase ausente. A página provavelmente não tem ponto focal claro.`);

  const distintasRelevantes = cores.filter((c) => c.pct >= 1).length;
  if (distintasRelevantes <= 2) {
    diagnostico.push(`Apenas ${distintasRelevantes} cores com área relevante. Se as duas forem claras, é exatamente o padrão monótono branco/cinza-claro.`);
  }

  return {
    porCor: cores.filter((c) => c.pct >= 0.5),
    agrupado: {
      base: +base.toFixed(1),
      oposto: +oposto.toFixed(1),
      destaque: +destaque.toFixed(1),
    },
    alvo: { base: 70, oposto: 30, destaque: 10 },
    diagnostico: diagnostico.length ? diagnostico : ["Proporção dentro do esperado."],
    // O agrupamento é heurístico: uma marca que use um tom escuro e muito saturado
    // como oposto (um roxo profundo, por exemplo) cairá em "destaque". Quando o
    // resultado surpreender, confira porCor — essa é a medição bruta e confiável.
    nota: "Agrupamento heurístico. Em caso de dúvida, leia porCor.",
  };
}

if (typeof module !== "undefined") module.exports = { medirPaleta };
if (typeof window !== "undefined") window.medirPaleta = medirPaleta;
