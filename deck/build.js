const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.title = "Predição de risco de diabetes (ODS 3)";
const F = "Arial", BLUE = "1F6FB2", DARK = "17324D", GRAY = "5B6B7A", LIGHT = "EEF4FA";
const FIG = "../reports/figures/";
const ratio = { "01_alvo": 546/442, "02_desigualdade": 1105/442, "03_modelos": 910/468, "04_importancia": 780/468, "05_avaliacao": 1105/468, "06_clusters": 715/442 };

function base(title, step) {
  const s = pres.addSlide(); s.background = { color: "FFFFFF" };
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 5.625, fill: { color: BLUE }, line: { color: BLUE } });
  if (step) s.addText(step, { x: 0.6, y: 0.3, w: 6, h: 0.3, fontFace: F, fontSize: 12, color: BLUE, bold: true, margin: 0, isTextBox: true });
  s.addText(title, { x: 0.6, y: 0.6, w: 8.8, h: 0.6, fontFace: F, fontSize: 24, color: DARK, bold: true, margin: 0, isTextBox: true });
  return s;
}
function fig(s, name, x, y, maxW, maxH) {
  let w = maxW, h = w / ratio[name]; if (h > maxH) { h = maxH; w = h * ratio[name]; }
  s.addImage({ path: FIG + name + ".png", x: x + (maxW - w) / 2, y: y + (maxH - h) / 2, w, h });
}
function stat(s, x, y, big, small) {
  s.addShape(pres.ShapeType.rect, { x, y, w: 1.9, h: 1.05, fill: { color: LIGHT }, line: { color: LIGHT } });
  s.addText(big, { x, y: y + 0.08, w: 1.9, h: 0.55, align: "center", fontFace: F, fontSize: 24, bold: true, color: BLUE, margin: 0, isTextBox: true });
  s.addText(small, { x: x + 0.1, y: y + 0.62, w: 1.7, h: 0.38, align: "center", fontFace: F, fontSize: 10, color: GRAY, margin: 0, isTextBox: true });
}
const bullets = (arr) => arr.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < arr.length - 1, paraSpaceAfter: 6 } }));

// 1 capa
let s = pres.addSlide(); s.background = { color: DARK };
s.addText("Predição de risco de diabetes", { x: 0.7, y: 1.6, w: 8.6, h: 0.9, fontFace: F, fontSize: 38, bold: true, color: "FFFFFF", margin: 0, isTextBox: true });
s.addText("Triagem com mineração de dados para apoiar a prevenção", { x: 0.7, y: 2.55, w: 8.6, h: 0.5, fontFace: F, fontSize: 18, color: "BFD7EE", margin: 0, isTextBox: true });
s.addText("ODS 3 · Saúde e Bem-Estar  |  Base: BRFSS 2015 (CDC) via Kaggle  |  CRISP-DM", { x: 0.7, y: 4.5, w: 8.6, h: 0.4, fontFace: F, fontSize: 12, color: "BFD7EE", margin: 0, isTextBox: true });

// 2 problema
s = base("Problema, ODS e metodologia", "1 · ENTENDIMENTO DO PROBLEMA E CRISP-DM");
s.addText(bullets([
  "Diabetes sobrecarrega os sistemas de saúde e pesa mais sobre quem tem menos renda e escolaridade.",
  "Objetivo: classificar pré-diabetes/diabetes e priorizar quem precisa de exame e prevenção.",
  "Pergunta: quais hábitos e condições socioeconômicas mais influenciam o risco?",
  "Métrica-chave: recall, porque em triagem perder um caso custa mais que um alerta falso.",
]), { x: 0.6, y: 1.5, w: 5.6, h: 3.4, fontFace: F, fontSize: 15, color: DARK, valign: "top", margin: 0, isTextBox: true });
[["ODS 3", "principal: triagem precoce"], ["ODS 10", "desigualdade (renda, escolaridade)"], ["ODS 2", "alimentação e hábitos"]].forEach((r, i) => {
  s.addShape(pres.ShapeType.rect, { x: 6.7, y: 1.5 + i * 1.15, w: 2.7, h: 0.95, fill: { color: i === 0 ? BLUE : LIGHT }, line: { color: i === 0 ? BLUE : LIGHT } });
  s.addText(r[0], { x: 6.85, y: 1.55 + i * 1.15, w: 2.4, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: i === 0 ? "FFFFFF" : BLUE, margin: 0, isTextBox: true });
  s.addText(r[1], { x: 6.85, y: 1.95 + i * 1.15, w: 2.4, h: 0.4, fontFace: F, fontSize: 11, color: i === 0 ? "FFFFFF" : GRAY, margin: 0, isTextBox: true });
});

// 3 dados
s = base("Dados: duplicatas e classes desbalanceadas", "2 · AQUISIÇÃO, QUALIDADE E PREPARAÇÃO");
stat(s, 0.6, 1.5, "253.680", "registros e 21 variáveis"); stat(s, 0.6, 2.7, "0", "valores nulos");
stat(s, 0.6, 3.9, "24.206", "duplicatas removidas (9,5%)");
fig(s, "01_alvo", 2.9, 1.4, 3.1, 3.2);
s.addText(bullets(["Após a limpeza: 229.474 registros.", "Prevalência do alvo: 15,3%.", "Accuracy seria enganosa: o baseline que só prevê “sem diabetes” acerta ~85%."]),
  { x: 6.2, y: 1.6, w: 3.3, h: 3, fontFace: F, fontSize: 13, color: DARK, valign: "top", margin: 0, isTextBox: true });

// 4 modelagem
s = base("Modelagem e balanceamento das classes", "3 · MINERAÇÃO E MODELAGEM");
fig(s, "03_modelos", 0.5, 1.4, 5.2, 3.3);
s.addText("Balanceamento (regressão logística)", { x: 6.0, y: 1.45, w: 3.5, h: 0.3, fontFace: F, fontSize: 13, bold: true, color: DARK, margin: 0, isTextBox: true });
const hdr = { bold: true, color: "FFFFFF", fill: { color: BLUE }, fontFace: F, fontSize: 11 };
const cell = { fontFace: F, fontSize: 11, color: DARK };
s.addTable([
  [{ text: "Estratégia", options: hdr }, { text: "Recall", options: hdr }, { text: "F1", options: hdr }],
  [{ text: "Sem tratamento", options: cell }, { text: "0,15", options: cell }, { text: "0,24", options: cell }],
  [{ text: "Pesos de classe", options: cell }, { text: "0,76", options: cell }, { text: "0,45", options: cell }],
  [{ text: "Subamostragem", options: cell }, { text: "0,76", options: cell }, { text: "0,45", options: cell }],
  [{ text: "SMOTE", options: cell }, { text: "0,76", options: cell }, { text: "0,45", options: cell }],
], { x: 6.0, y: 1.85, w: 3.5, colW: [1.7, 0.9, 0.9], rowH: 0.3, border: { type: "solid", pt: 0.5, color: "D5DEE8" } });
s.addText("Pesos de classe empatam com SMOTE e não criam dados sintéticos; foi a escolha.", { x: 6.0, y: 3.6, w: 3.5, h: 0.8, fontFace: F, fontSize: 12, color: GRAY, valign: "top", margin: 0, isTextBox: true });

// 5 resultados
s = base("Resultados: bom para triagem, não para diagnóstico", "4 · AVALIAÇÃO E INTERPRETAÇÃO");
stat(s, 0.6, 1.5, "82%", "recall no limiar 0,47"); stat(s, 0.6, 2.7, "31%", "precisão (7 em 10 alertas são falsos)");
stat(s, 0.6, 3.9, "0,82", "ROC-AUC (Gradient Boosting)");
fig(s, "04_importancia", 2.8, 1.4, 3.6, 2.2);
s.addText(bullets(["Mais importantes: IMC, saúde geral, idade, colesterol e pressão alta.", "Limitações: autorrelato, dados dos EUA de 2015, associação não é causalidade."]),
  { x: 6.6, y: 1.5, w: 2.9, h: 3.2, fontFace: F, fontSize: 12, color: DARK, valign: "top", margin: 0, isTextBox: true });
s.addText("Alertas devem ser confirmados por exame de glicemia.", { x: 2.8, y: 3.9, w: 3.6, h: 0.6, fontFace: F, fontSize: 12, italic: true, color: GRAY, valign: "top", margin: 0, isTextBox: true });

// 6 desigualdade
s = base("Desigualdade social e risco (ODS 10)", "4 · AVALIAÇÃO E INTERPRETAÇÃO");
fig(s, "02_desigualdade", 0.5, 1.35, 6.0, 2.6);
s.addText(bullets(["Prevalência de ~24–29% nas faixas mais baixas de renda e escolaridade, contra ~10–12% nas mais altas.", "K-Means: dois perfis com ~25% de prevalência, de baixa renda ou sedentários.", "Apriori: obesidade + pressão alta + saúde ruim tem confiança de 48% (lift 3,2)."]),
  { x: 6.7, y: 1.5, w: 2.8, h: 3.4, fontFace: F, fontSize: 12, color: DARK, valign: "top", margin: 0, isTextBox: true });
s.addText("Implicação: ações de prevenção rendem mais se priorizarem populações vulneráveis.", { x: 0.6, y: 4.2, w: 5.8, h: 0.6, fontFace: F, fontSize: 13, bold: true, color: BLUE, valign: "top", margin: 0, isTextBox: true });

// 7 engenharia
s = base("Pipeline, software e DevOps", "5 · PIPELINE  ·  6 · ARQUITETURA  ·  7 · REPRODUTIBILIDADE");
const steps = ["Dados\nBRFSS", "Limpeza e\nqualidade", "Pipeline\nsklearn", "Modelo\n.joblib", "API\nFastAPI", "Docker"];
steps.forEach((t, i) => {
  s.addShape(pres.ShapeType.rect, { x: 0.6 + i * 1.5, y: 1.5, w: 1.3, h: 0.8, fill: { color: i === 2 || i === 4 ? BLUE : LIGHT }, line: { color: i === 2 || i === 4 ? BLUE : LIGHT } });
  s.addText(t, { x: 0.6 + i * 1.5, y: 1.5, w: 1.3, h: 0.8, align: "center", valign: "middle", fontFace: F, fontSize: 11, bold: true, color: i === 2 || i === 4 ? "FFFFFF" : DARK, margin: 0, isTextBox: true });
  if (i < 5) s.addText("›", { x: 1.9 + i * 1.5, y: 1.5, w: 0.2, h: 0.8, align: "center", valign: "middle", fontFace: F, fontSize: 18, color: GRAY, margin: 0, isTextBox: true });
});
s.addText(bullets([
  "Pré-processamento dentro do Pipeline: treino e inferência usam a mesma transformação, sem vazamento.",
  "API com validação (Pydantic): endpoints /health e /predict.",
  "Seed fixa, requirements.txt e Makefile (make train report test).",
  "8 testes com pytest (dados, pipeline, limiar e API), todos passando.",
  "Dockerfile e GitHub Actions rodando testes e build a cada push.",
]), { x: 0.6, y: 2.7, w: 8.8, h: 2.3, fontFace: F, fontSize: 14, color: DARK, valign: "top", margin: 0, isTextBox: true });

// 8 demo
s = base("Demonstração e próximos passos", "8 · APRESENTAÇÃO E DEMONSTRAÇÃO");
s.addShape(pres.ShapeType.rect, { x: 0.6, y: 1.5, w: 5.2, h: 3.0, fill: { color: "0F1F2E" }, line: { color: "0F1F2E" } });
s.addText([
  { text: "POST /predict", options: { color: "7FC1FF", bold: true, breakLine: true } },
  { text: "IMC 34, pressão e colesterol altos,", options: { color: "D8E6F3", breakLine: true } },
  { text: "sedentário, saúde geral 4, renda baixa", options: { color: "D8E6F3", breakLine: true } },
  { text: " ", options: { breakLine: true } },
  { text: "→ probabilidade 0,87 · alto risco", options: { color: "FFD27F", bold: true, breakLine: true } },
  { text: " ", options: { breakLine: true } },
  { text: "IMC 22, ativo, saúde geral 1, renda alta", options: { color: "D8E6F3", breakLine: true } },
  { text: "→ probabilidade 0,02 · baixo risco", options: { color: "9FE3B0", bold: true } },
], { x: 0.85, y: 1.7, w: 4.8, h: 2.6, fontFace: "Courier New", fontSize: 12, valign: "top", margin: 0, isTextBox: true });
s.addText("Próximos passos", { x: 6.2, y: 1.5, w: 3.3, h: 0.35, fontFace: F, fontSize: 15, bold: true, color: DARK, margin: 0, isTextBox: true });
s.addText(bullets(["Calibrar as probabilidades.", "Validar com dados brasileiros (ex.: PNS).", "Testar com profissionais de saúde antes de qualquer uso real."]),
  { x: 6.2, y: 1.95, w: 3.3, h: 2.6, fontFace: F, fontSize: 13, color: DARK, valign: "top", margin: 0, isTextBox: true });

pres.writeFile({ fileName: "../apresentacao_diabetes_ods3.pptx" }).then(() => console.log("ok"));
