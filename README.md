# Predição de risco de diabetes (ODS 3)

Projeto de Mineração de Dados com a base **Diabetes Health Indicators** (BRFSS 2015, CDC).
Triagem de pré-diabetes/diabetes para apoiar a prevenção, com foco em **ODS 3** e ligações com **ODS 10** e **ODS 2**.

## Como executar
1. Baixe `diabetes_binary_health_indicators_BRFSS2015.csv` em
   https://www.kaggle.com/datasets/alexteboul/diabetes-health-indicators-dataset e coloque em `data/`.
2. `make install` · `make train` · `make report` · `make test`
3. API: `make api` e abra http://localhost:8000/docs (ou `make docker`).

## Estrutura
| Pasta | Conteúdo |
|---|---|
| `src/diabetes_ods/` | dados, features, treino, mineração (Apriori, K-Means), relatório, predição |
| `app/` | API FastAPI (`/health`, `/predict`) |
| `tests/` | 8 testes pytest |
| `notebooks/` | análise CRISP-DM completa, já executada |
| `reports/` | métricas (`metrics.json`) e figuras |
| `models/` | modelo treinado (`modelo.joblib`) |

## Resultados (teste, 20% estratificado, seed 42)
Gradient Boosting: ROC-AUC 0,82 · com limiar de triagem 0,47: recall 0,82, precisão 0,31.
Serve para triagem (a confirmação é por exame), não para diagnóstico.
