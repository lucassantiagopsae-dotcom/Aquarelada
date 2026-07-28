#!/usr/bin/env node
/**
 * Auditor de composição de landing page.
 *
 * Lê os atributos data-arquetipo / data-tom / data-forma / data-cabecalho /
 * data-ancora das seções e verifica as regras R1-R9 do SKILL.md.
 *
 * Uso:  node auditar-lp.mjs caminho/da/pagina.html
 *
 * Sai com código 1 se alguma regra falhar, para servir como condição de
 * parada de um loop de correção.
 *
 * A regra R10 (proporção de cor 70/30/10) não é verificável estaticamente
 * porque depende da área renderizada — use scripts/medir-paleta.js.
 */

import { readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

const arquivo = argv[2];
if (!arquivo) {
  console.error("Uso: node auditar-lp.mjs <arquivo.html>");
  exit(2);
}

const html = await readFile(arquivo, "utf8");

// Captura as tags de abertura que declaram arquétipo, na ordem do documento.
const secoes = [];
const reTag = /<[a-zA-Z][^>]*\bdata-arquetipo\s*=\s*["']([^"']+)["'][^>]*>/g;
let m;
while ((m = reTag.exec(html)) !== null) {
  const tag = m[0];
  const attr = (nome) => {
    const r = new RegExp(`\\b${nome}\\s*=\\s*["']([^"']*)["']`).exec(tag);
    return r ? r[1].trim() : null;
  };
  secoes.push({
    ordem: secoes.length + 1,
    arquetipo: m[1].trim(),
    tom: attr("data-tom") || "nao-declarado",
    forma: attr("data-forma") || "nao-declarado",
    tratamento: attr("data-tratamento") || "nao-declarado",
    divisa: attr("data-divisa"),
    cabecalho: attr("data-cabecalho"),
    ancora: attr("data-ancora"),
    variacao: attr("data-variacao"),
  });
}

const falhas = [];
const avisos = [];
const ok = [];

function reprovar(regra, msg, detalhe) {
  falhas.push({ regra, msg, detalhe });
}
function aprovar(regra, msg) {
  ok.push({ regra, msg });
}

if (secoes.length === 0) {
  console.error(
    "\nNenhuma seção com data-arquetipo encontrada.\n\n" +
      "As regras de composição só podem ser auditadas se cada seção declarar\n" +
      "seu arquétipo. Adicione os atributos conforme a Fase 2 do SKILL.md:\n\n" +
      '  <section data-arquetipo="timeline-vertical" data-tom="claro" data-forma="contido">\n'
  );
  exit(2);
}

const total = secoes.length;

// As duas últimas seções são avaliadas com menos rigor em R6, R7 e R11.
// Perto do fim da página a pessoa já decidiu, e simplicidade ali funciona melhor
// que invenção — um FAQ cinza chapado e um CTA de cor chapada estão corretos.
// O esforço de variação pertence ao miolo.
const FIM_ISENTO = 2;
const miolo = total > FIM_ISENTO ? secoes.slice(0, total - FIM_ISENTO) : secoes;

// ---------- R1: nenhum arquétipo em duas seções consecutivas ----------
const consecutivos = [];
for (let i = 1; i < secoes.length; i++) {
  if (secoes[i].arquetipo === secoes[i - 1].arquetipo) {
    consecutivos.push(`seções ${secoes[i - 1].ordem} e ${secoes[i].ordem}: "${secoes[i].arquetipo}"`);
  }
}
consecutivos.length
  ? reprovar("R1", "Arquétipo repetido em seções consecutivas", consecutivos)
  : aprovar("R1", "Nenhuma repetição adjacente de arquétipo");

// ---------- R2: nenhum arquétipo mais de 2x ----------
const contagem = {};
secoes.forEach((s) => (contagem[s.arquetipo] = (contagem[s.arquetipo] || 0) + 1));
const excedentes = Object.entries(contagem).filter(([, n]) => n > 2);
excedentes.length
  ? reprovar(
      "R2",
      "Arquétipo usado mais de 2x na página",
      excedentes.map(([a, n]) => `"${a}" aparece ${n}x`)
    )
  : aprovar("R2", "Nenhum arquétipo usado mais de 2x");

// ---------- R3: no máximo 1 card-grid uniforme ----------
// Grade com variação interna real (tamanhos, cores, um com foto e outro sem)
// não é o vício que a regra combate — o problema é a grade uniforme.
const gridsUniformes = secoes.filter((s) => s.arquetipo === "card-grid" && s.variacao !== "interna");
const gridsVariados = secoes.filter((s) => s.arquetipo === "card-grid" && s.variacao === "interna");
gridsUniformes.length > 1
  ? reprovar("R3", "Mais de um card-grid uniforme", [
      `${gridsUniformes.length} grades uniformes (seções ${gridsUniformes.map((s) => s.ordem).join(", ")}); limite: 1.`,
      "Duas saídas: (a) troque por bento-assimetrico, lista-editorial, stepper-numerado ou scroll-horizontal, conforme a natureza do conteúdo; ou (b) dê variação interna real à grade — um card escuro com foto ao lado de um sem, um ocupando duas colunas, um na cor de destaque — e marque data-variacao=\"interna\". Trocar o ícone não conta como variação.",
    ])
  : aprovar(
      "R3",
      `${gridsUniformes.length} card-grid uniforme (limite: 1)` +
        (gridsVariados.length ? ` + ${gridsVariados.length} com variação interna (não contam)` : "")
    );

// ---------- R4: cabeçalho padrão no máximo 2x ----------
const nCab = secoes.filter((s) => s.cabecalho === "padrao").length;
nCab > 2
  ? reprovar("R4", "Cabeçalho chapéu+título+subtítulo usado demais", [
      `${nCab} seções abrem com o cabeçalho padrão (limite: 2).`,
      "As demais precisam entrar de outro jeito: direto no visual, com uma pergunta, com um número grande, com uma frase solta, ou sem título nenhum.",
    ])
  : aprovar("R4", `Cabeçalho padrão em ${nCab} seções (limite: 2)`);

// ---------- R5: ao menos 1 faixa full-bleed a cada 4 seções ----------
const nFullBleed = secoes.filter((s) => s.forma === "faixa-full-bleed").length;
const minFullBleed = Math.floor(total / 4);
nFullBleed < minFullBleed
  ? reprovar("R5", "Poucas seções full-bleed", [
      `${nFullBleed} de ${total} seções são faixa-full-bleed; o mínimo para ${total} seções é ${minFullBleed}.`,
      "Página inteira na mesma largura contida lê como documento, não como site.",
    ])
  : aprovar("R5", `${nFullBleed} seções full-bleed (mínimo: ${minFullBleed})`);

// ---------- R6: ritmo tonal irregular ----------
// Deliberadamente NÃO exige alternância. Exigir "no máximo N seguidas iguais"
// empurra para claro-escuro-claro-escuro, e alternância rígida é tão monótona
// quanto a repetição — só que com dois passos em vez de um. O que se mede aqui
// é irregularidade: corridas de tamanhos diferentes. Uma corrida de 3 claros
// seguida de 1 escuro e 2 claros tem ritmo; 1-1-1-1-1-1 não tem.
const corridas = [];
miolo.forEach((s, i) => {
  if (i > 0 && s.tom === miolo[i - 1].tom) corridas[corridas.length - 1].len++;
  else corridas.push({ tom: s.tom, inicio: s.ordem, len: 1 });
});
const tamanhos = corridas.map((c) => c.len);
const LIMITE_CORRIDA = 4;
const problemasR6 = [];

const longa = corridas.find((c) => c.len > LIMITE_CORRIDA);
if (longa) {
  problemasR6.push(
    `Corrida longa demais: ${longa.len} seções seguidas com tom "${longa.tom}" a partir da seção ${longa.inicio} (limite: ${LIMITE_CORRIDA}).`
  );
}
if (corridas.length >= 3 && new Set(tamanhos).size === 1) {
  problemasR6.push(
    `Ritmo rígido: todas as ${corridas.length} corridas têm exatamente ${tamanhos[0]} seção(ões) — padrão ${corridas.map((c) => c.tom[0].toUpperCase()).join("")}.`,
    "Alternância perfeitamente regular é um padrão como qualquer outro, e o olho o decodifica igualmente rápido. Varie o tamanho das corridas: uma sequência como 3 claros, 1 escuro, 2 claros, 1 cor tem respiração; 1-1-1-1 não tem."
  );
}
problemasR6.length
  ? reprovar("R6", "Ritmo tonal previsível", [
      ...problemasR6,
      'Lembre: data-tom é o tom percebido. Uma seção de fundo claro dominada por um bloco escuro contido é "escuro" — corrija a marcação antes de mexer no design.',
    ])
  : aprovar("R6", `Ritmo tonal irregular (corridas: ${tamanhos.join("-")})`);

// ---------- R12: variação da forma da divisa ----------
// Complemento direto da R6: não basta variar QUANDO o tom muda, é preciso variar
// COMO ele muda. Se toda transição é uma linha reta horizontal, a página tem ritmo
// mas não tem repertório.
const transicoes = [];
miolo.forEach((s, i) => {
  if (i > 0 && s.tom !== miolo[i - 1].tom) transicoes.push(s);
});
if (transicoes.length >= 3) {
  const naoRetas = transicoes.filter((s) => s.divisa && s.divisa !== "reta");
  naoRetas.length === 0
    ? reprovar("R12", "Todas as transições de tom são linha reta", [
        `${transicoes.length} mudanças de tom, nenhuma com divisa personalizada (seções ${transicoes.map((s) => s.ordem).join(", ")}).`,
        'Ao menos uma deve usar data-divisa="inclinada", "curva", "sobreposta" ou "recorte". É barato de fazer e é o que separa uma página montada de uma página desenhada.',
      ])
    : aprovar("R12", `${naoRetas.length} de ${transicoes.length} transições com divisa personalizada`);
} else {
  avisos.push(`R12 não avaliada: ${transicoes.length} mudanças de tom no miolo (regra vale a partir de 3).`);
}

// ---------- R7: no máximo 2 faixas full-bleed escuras ou coloridas ----------
const pesadasFullBleed = miolo.filter(
  (s) => s.forma === "faixa-full-bleed" && (s.tom === "escuro" || s.tom === "cor")
);
pesadasFullBleed.length > 2
  ? reprovar("R7", "Excesso de faixas full-bleed escuras/coloridas", [
      `${pesadasFullBleed.length} faixas pesadas (limite: 2): seções ${pesadasFullBleed.map((s) => s.ordem).join(", ")}.`,
      "Converta as excedentes em bloco-contido: mantém o neutro base ao redor, cria forma com contorno, aceita sombra e permite transbordo. Ver references/ritmo-e-composicao.md.",
    ])
  : aprovar("R7", `${pesadasFullBleed.length} faixas full-bleed pesadas (limite: 2)`);

// ---------- R8: variedade mínima de arquétipos ----------
const distintos = Object.keys(contagem).length;
if (total >= 8) {
  distintos < 6
    ? reprovar("R8", "Variedade insuficiente de arquétipos", [
        `${distintos} arquétipos distintos em ${total} seções (mínimo: 6).`,
        "Consulte references/arquetipos.md — há 30 opções catalogadas.",
      ])
    : aprovar("R8", `${distintos} arquétipos distintos em ${total} seções`);
} else {
  avisos.push(`R8 não avaliada: página com ${total} seções (regra vale a partir de 8).`);
}

// ---------- R9: âncoras visuais ----------
const nAncora = secoes.filter((s) => s.ancora === "visual").length;
nAncora < 2
  ? reprovar("R9", "Âncoras visuais insuficientes", [
      `${nAncora} seções com data-ancora="visual" (mínimo: 2).`,
      "Ícone de biblioteca não conta. Precisa de ilustração, foto, diagrama, gráfico ou imagem de produto com peso real na composição.",
    ])
  : aprovar("R9", `${nAncora} seções com âncora visual`);

// ---------- R11: nenhum tratamento visual repetido mais de 2x ----------
// A repetição que mais cansa não é a de arquétipo, é a de superfície: card branco
// nos benefícios, card branco nos depoimentos, card branco no FAQ. Três arquétipos
// diferentes que o olho lê como a mesma coisa três vezes.
// "texto-puro" fica de fora: é a ausência de superfície, não uma superfície
// repetida. Três seções sem tratamento dominante podem ser visualmente muito
// diferentes entre si — a regra existe para pegar o card branco pela terceira vez,
// não para punir seções que se apoiam só em tipografia.
const contTrat = {};
miolo
  .filter((s) => s.tratamento !== "nao-declarado" && s.tratamento !== "texto-puro")
  .forEach((s) => (contTrat[s.tratamento] = (contTrat[s.tratamento] || 0) + 1));
const tratExcedentes = Object.entries(contTrat).filter(([, n]) => n > 2);
tratExcedentes.length
  ? reprovar("R11", "Tratamento visual repetido demais", [
      ...tratExcedentes.map(([t, n]) => `"${t}" em ${n} seções do miolo (limite: 2)`),
      "Troque a superfície de uma delas, não o arquétipo. Uma seção de depoimento que viraria o terceiro card branco da página funciona melhor como bloco na cor de destaque com imagem ao fundo.",
    ])
  : aprovar("R11", "Nenhum tratamento visual repetido mais de 2x");

// ---------- Higiene da marcação ----------
const semTom = secoes.filter((s) => s.tom === "nao-declarado");
const semForma = secoes.filter((s) => s.forma === "nao-declarado");
const semTrat = secoes.filter((s) => s.tratamento === "nao-declarado");
if (semTom.length) avisos.push(`${semTom.length} seções sem data-tom (ordem: ${semTom.map((s) => s.ordem).join(", ")}) — R6 e R7 ficam incompletas.`);
if (semForma.length) avisos.push(`${semForma.length} seções sem data-forma (ordem: ${semForma.map((s) => s.ordem).join(", ")}) — R5 e R7 ficam incompletas.`);
if (semTrat.length) avisos.push(`${semTrat.length} seções sem data-tratamento (ordem: ${semTrat.map((s) => s.ordem).join(", ")}) — R11 fica incompleta.`);
if (total > FIM_ISENTO) avisos.push(`R6, R7 e R11 avaliadas apenas no miolo (seções 1-${total - FIM_ISENTO}); as ${FIM_ISENTO} últimas são isentas por estarem no fecho da página.`);

// ---------- Relatório ----------
const linha = "─".repeat(64);
console.log(`\n${linha}`);
console.log(`AUDITORIA DE COMPOSIÇÃO — ${arquivo}`);
console.log(linha);

console.log(`\nSeções encontradas: ${total}`);
secoes.forEach((s) => {
  const marcas = [
    s.forma,
    s.tom,
    s.tratamento !== "nao-declarado" ? s.tratamento : null,
    s.variacao === "interna" ? "variação-interna" : null,
    s.cabecalho === "padrao" ? "cabeçalho-padrão" : null,
    s.ancora === "visual" ? "âncora" : null,
  ]
    .filter(Boolean)
    .join(" · ");
  console.log(`  ${String(s.ordem).padStart(2)}. ${s.arquetipo.padEnd(24)} ${marcas}`);
});

if (ok.length) {
  console.log(`\n✓ APROVADO (${ok.length})`);
  ok.forEach((o) => console.log(`  ${o.regra}  ${o.msg}`));
}

if (avisos.length) {
  console.log(`\n! AVISOS (${avisos.length})`);
  avisos.forEach((a) => console.log(`  ${a}`));
}

if (falhas.length) {
  console.log(`\n✗ REPROVADO (${falhas.length})`);
  falhas.forEach((f) => {
    console.log(`\n  ${f.regra}  ${f.msg}`);
    (Array.isArray(f.detalhe) ? f.detalhe : [f.detalhe]).forEach((d) => console.log(`      ${d}`));
  });
}

console.log(`\n${linha}`);
if (falhas.length) {
  console.log(`RESULTADO: ${falhas.length} regra(s) reprovada(s). Corrija e rode de novo.`);
  console.log("Regra R10 (proporção 70/30/10) não é coberta aqui — use scripts/medir-paleta.js.");
  console.log(`${linha}\n`);
  exit(1);
}
console.log("RESULTADO: composição aprovada.");
console.log("Falta ainda: R10 (medir-paleta.js) e references/checklist-entrega.md.");
console.log(`${linha}\n`);
exit(0);
