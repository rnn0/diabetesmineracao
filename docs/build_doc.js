const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ShadingType, LevelFormat } = require("docx");
const m = JSON.parse(fs.readFileSync("../reports/metrics.json", "utf8"));
const F = "Times New Roman", SZ = 21;
const f2 = (x) => x.toFixed(2).replace(".", ",");

const p = (text, o = {}) => new Paragraph({ alignment: o.align || AlignmentType.JUSTIFIED, spacing: { after: 80, line: 250 }, children: [].concat(text).map((t) => typeof t === "string" ? new TextRun({ text: t, font: F, size: SZ }) : t) });
const h = (text) => new Paragraph({ keepNext: true, spacing: { before: 200, after: 80 }, children: [new TextRun({ text, font: F, size: 24, bold: true })] });
const b = (text) => new Paragraph({ numbering: { reference: "bl", level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 40, line: 250 }, children: [new TextRun({ text, font: F, size: SZ })] });
const it = (t) => new TextRun({ text: t, font: F, size: SZ, italics: true });

const cols = [2871, 1240, 1240, 1240, 1240, 1240];
const border = { style: BorderStyle.SINGLE, size: 4, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };
const cell = (t, i, head) => new TableCell({ width: { size: cols[i], type: WidthType.DXA }, borders, margins: { top: 40, bottom: 40, left: 80, right: 80 },
  shading: head ? { type: ShadingType.CLEAR, fill: "E8E8E8" } : undefined,
  children: [new Paragraph({ alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, children: [new TextRun({ text: t, font: F, size: 20, bold: !!head })] })] });
const rows = [["Modelo", "Recall", "Precisão", "F1", "ROC-AUC", "PR-AUC"]];
for (const [n, v] of Object.entries(m.modelos)) rows.push([n.replace("Baseline (classe majoritária)", "Baseline (classe majoritária)"), f2(v.recall), f2(v.precisao), f2(v.f1), f2(v.roc_auc), f2(v.pr_auc)]);
const t = m.campeao_limiar_triagem;
rows.push([`${m.campeao}, limiar ${f2(m.limiar_triagem)}`, f2(t.recall), f2(t.precisao), f2(t.f1), f2(t.roc_auc), f2(t.pr_auc)]);
const table = new Table({ width: { size: 9071, type: WidthType.DXA }, columnWidths: cols,
  rows: rows.map((r, ri) => new TableRow({ children: r.map((c, i) => cell(c, i, ri === 0)) })) });

const q = m.qualidade;
const doc = new Document({
  numbering: { config: [{ reference: "bl", levels: [{ level: 0, format: LevelFormat.BULLET, text: "-", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 500, hanging: 260 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1020, bottom: 1020, left: 1701, right: 1134 } } },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "Predição de risco de diabetes com mineração de dados: um projeto alinhado à ODS 3", font: F, size: 28, bold: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: "Projeto de Mineração de Dados · Metodologia CRISP-DM · Código: github.com/rnn0/diabetesmineracao", font: F, size: 20 })] }),

      h("Resumo"),
      p(`Este trabalho desenvolve um modelo de triagem de pré-diabetes e diabetes a partir de ${q.linhas.toLocaleString("pt-BR")} respostas da pesquisa BRFSS 2015 do CDC (versão tratada disponível no Kaggle). O projeto segue o CRISP-DM, da compreensão do problema à entrega de uma API containerizada com testes automatizados. O melhor modelo (Gradient Boosting) atinge recall de ${f2(t.recall)} e precisão de ${f2(t.precisao)} no limiar de triagem, o que o torna adequado para priorizar exames, e não para diagnóstico. A análise também mostra que a prevalência é maior nas faixas de menor renda e escolaridade, o que conecta o tema às ODS 3 e 10.`),

      h("1. Introdução e objetivo"),
      p("O diabetes é uma doença crônica cuja prevalência varia com idade, renda e escolaridade. A detecção precoce permite intervir no estilo de vida antes do agravamento, o que dialoga com a meta 3.4 da ODS 3 (reduzir a mortalidade prematura por doenças crônicas não transmissíveis por meio da prevenção). O projeto também se relaciona com a ODS 10 (redução das desigualdades), pelas variáveis de renda e escolaridade, e com a ODS 2, pelos hábitos alimentares."),
      p([ "A pergunta de pesquisa é: ", it("quais hábitos e condições socioeconômicas mais influenciam o risco de diabetes, e é possível usar esses dados para priorizar ações de prevenção em populações vulneráveis?"), " Como o uso é de triagem, a métrica prioritária é o recall, pois deixar de identificar um caso custa mais do que um alerta falso." ]),

      h("2. Dados e preparação"),
      p(`Foi usado o arquivo binário completo do Diabetes Health Indicators Dataset (Teboul), com ${q.linhas.toLocaleString("pt-BR")} registros e 21 variáveis sobre condições de saúde, hábitos, acesso a serviços de saúde e características demográficas e socioeconômicas. O alvo vale 0 (sem diabetes) ou 1 (pré-diabetes ou diabetes).`),
      p(`A base não tem valores nulos, mas contém ${q.duplicadas.toLocaleString("pt-BR")} linhas duplicadas (9,5%), que foram removidas, restando ${q.linhas_apos_limpeza.toLocaleString("pt-BR")} registros. Filtros de consistência (IMC entre 10 e 100; dias de saúde entre 0 e 30) não eliminaram registros adicionais. A prevalência do alvo passou de 13,9% para ${(q.prevalencia_apos_limpeza * 100).toFixed(1).replace(".", ",")}%. Como as variáveis são quase todas categóricas, linhas idênticas podem ser respondentes distintos; a remoção é, portanto, uma decisão conservadora que pode retirar casos legítimos. A classe positiva é minoritária, razão pela qual a acurácia não foi usada como métrica principal: um modelo que sempre prevê "sem diabetes" acertaria cerca de 85%.`),

      h("3. Mineração e modelagem"),
      p("Os dados foram divididos em 80% para treino e 20% para teste, de forma estratificada e com semente 42. O pré-processamento (padronização das variáveis numéricas e ordinais; variáveis binárias sem transformação) fica dentro de um Pipeline do scikit-learn, o que evita vazamento de dados e garante a mesma transformação no treino e na inferência. Foram comparados um baseline (classe majoritária), regressão logística, random forest e gradient boosting."),
      p(`Para o desbalanceamento, a regressão logística foi testada sem tratamento, com pesos de classe, subamostragem e SMOTE. Sem tratamento, o recall foi de apenas ${f2(m.balanceamento["Sem tratamento"].recall)}; as três estratégias de balanceamento ficaram praticamente empatadas (recall em torno de ${f2(m.balanceamento["Pesos de classe"].recall)}). Optou-se pelos pesos de classe por serem mais simples e não gerarem dados sintéticos. O limiar de decisão foi escolhido em uma partição de validação, retirada do treino, como o que maximiza a precisão mantendo recall mínimo de 0,80, e só então aplicado ao conjunto de teste.`),
      p("Duas técnicas descritivas complementam a classificação: regras de associação (Apriori, suporte mínimo de 3% e confiança mínima de 30%) e agrupamento K-Means com quatro grupos, aplicado a oito variáveis de saúde e socioeconômicas."),

      h("4. Resultados e interpretação"),
      p("A Tabela 1 resume o desempenho no conjunto de teste."),
      new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Tabela 1 – Desempenho dos modelos no conjunto de teste (limiar 0,50, exceto na última linha)", font: F, size: 20, bold: true })] }),
      table,
      new Paragraph({ spacing: { after: 100 }, children: [] }),
      p(`O Gradient Boosting obteve a maior PR-AUC (${f2(m.modelos["Gradient Boosting"].pr_auc)}) e foi o modelo escolhido. No limiar de triagem de ${f2(m.limiar_triagem)}, o recall é ${f2(t.recall)}, mas a precisão cai para ${f2(t.precisao)}: aproximadamente sete em cada dez alertas são falsos positivos. Isso é aceitável para uma triagem seguida de exame de glicemia, mas inadequado como diagnóstico.`),
      p("Pela importância por permutação, as variáveis mais relevantes são IMC, saúde geral autodeclarada, idade, colesterol alto e pressão alta. Sobre a desigualdade, a prevalência é de 24% a 29% nas faixas mais baixas de renda e escolaridade e de 10% a 12% nas mais altas, o que sustenta a priorização de populações vulneráveis em ações de prevenção. Nas regras de associação, a combinação de obesidade, pressão alta e saúde geral ruim tem confiança de 48% e lift de 3,2. O K-Means identificou dois grupos com cerca de 25% de prevalência (um de baixa renda com pressão alta e outro de sedentários) e um grupo mais jovem e ativo com cerca de 3%."),

      h("5. Pipeline, arquitetura e software"),
      p("O fluxo é: carga dos dados, relatório de qualidade, limpeza, divisão treino/teste, pipeline com modelo, métricas, escolha do limiar e gravação do modelo e das métricas. Cada etapa é uma função no pacote src/diabetes_ods (dados, variáveis, treino, mineração, relatório e predição). O modelo treinado é servido por uma API FastAPI com os endpoints /health e /predict, que valida as entradas com Pydantic (por exemplo, IMC entre 10 e 100) e devolve a probabilidade e o alerta de alto risco. Em demonstração, um perfil com IMC 34, pressão e colesterol altos e sedentarismo recebeu probabilidade de 0,87, e um perfil ativo, com IMC 22, recebeu 0,02."),

      h("6. Reprodutibilidade, testes e DevOps"),
      b("Semente fixa em todas as etapas aleatórias, requirements.txt e Makefile (make train, report e test)."),
      b("Oito testes automatizados com pytest, cobrindo limpeza, relatório de qualidade, divisão estratificada, pré-processamento, escolha do limiar e API."),
      b("Dockerfile para empacotar a API e fluxo de integração contínua no GitHub Actions, que executa os testes e o build da imagem a cada push. A última execução foi concluída com sucesso."),
      b("Os dados brutos não ficam no repositório; o README descreve como baixá-los do Kaggle."),

      h("7. Limitações e conclusão"),
      p("Os dados são autodeclarados, coletados por telefone nos Estados Unidos em 2015, e a pesquisa é transversal; portanto, as associações encontradas não indicam causalidade, e o modelo não foi validado em outra população. A precisão baixa limita o uso a triagem. Como próximos passos, propõem-se calibrar as probabilidades, validar com dados brasileiros (por exemplo, a Pesquisa Nacional de Saúde do IBGE) e avaliar o uso com profissionais de saúde antes de qualquer aplicação real."),
      p("Conclui-se que é viável construir, com dados abertos e ferramentas livres, um modelo de triagem reprodutível e testado, e que a análise reforça a importância de direcionar a prevenção a quem tem menos renda e escolaridade."),

      h("Referências"),
      p("CENTERS FOR DISEASE CONTROL AND PREVENTION (CDC). Behavioral Risk Factor Surveillance System (BRFSS), 2015.", { align: AlignmentType.LEFT }),
      p("CHAPMAN, P. et al. CRISP-DM 1.0: step-by-step data mining guide. SPSS Inc., 2000.", { align: AlignmentType.LEFT }),
      p("ORGANIZAÇÃO DAS NAÇÕES UNIDAS. Objetivos de Desenvolvimento Sustentável: ODS 2, 3 e 10.", { align: AlignmentType.LEFT }),
      p("TEBOUL, A. Diabetes Health Indicators Dataset. Kaggle. Disponível em: https://www.kaggle.com/datasets/alexteboul/diabetes-health-indicators-dataset.", { align: AlignmentType.LEFT }),
    ],
  }],
});
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync("relatorio_projeto_diabetes_ods3.docx", buf); console.log("ok"); });
