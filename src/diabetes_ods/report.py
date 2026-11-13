"""Gera figuras e a comparação de estratégias de balanceamento."""
import json
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from imblearn.under_sampling import RandomUnderSampler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import ConfusionMatrixDisplay, PrecisionRecallDisplay
from .config import FIG_DIR, METRICS_PATH, MODEL_PATH, SEED, TARGET
from .data import clean, load_data
from .features import build_preprocessor
from .mining import clusters, importance
from .train import metrics_for, split

plt.rcParams.update({"figure.dpi": 130, "axes.spines.top": False, "axes.spines.right": False})
C = "#1F6FB2"


def save(name):
    FIG_DIR.mkdir(parents=True, exist_ok=True)
    plt.tight_layout(); plt.savefig(FIG_DIR / name); plt.close()


def balance_comparison(Xtr, ytr, Xte, yte):
    out = {}
    strategies = {
        "Sem tratamento": None,
        "Pesos de classe": "weights",
        "Subamostragem": RandomUnderSampler(random_state=SEED),
        "SMOTE": SMOTE(random_state=SEED),
    }
    for name, s in strategies.items():
        clf = LogisticRegression(max_iter=1000, class_weight="balanced" if s == "weights" else None)
        steps = [("prep", build_preprocessor())] + ([("bal", s)] if s not in (None, "weights") else []) + [("clf", clf)]
        m = ImbPipeline(steps).fit(Xtr, ytr)
        out[name] = {k: round(float(v), 4) for k, v in metrics_for(m, Xte, yte).items()}
    return out


def run():
    df = clean(load_data())
    met = json.loads(METRICS_PATH.read_text())
    art = joblib.load(MODEL_PATH)
    pipe, thr = art["pipeline"], art["threshold"]
    Xtr, Xte, ytr, yte = split(df)

    # 1 desbalanceamento
    plt.figure(figsize=(4.2, 3.4))
    vc = df[TARGET].value_counts(normalize=True).sort_index() * 100
    plt.bar(["Sem diabetes", "Pré-diabetes/diabetes"], vc.values, color=["#9DB7CF", C])
    for i, v in enumerate(vc.values): plt.text(i, v + 1, f"{v:.1f}%", ha="center")
    plt.ylabel("% dos registros"); plt.title("Distribuição do alvo"); save("01_alvo.png")

    # 2 ODS 10: prevalência por renda e escolaridade
    fig, ax = plt.subplots(1, 2, figsize=(8.5, 3.4), sharey=True)
    for a, col, t in zip(ax, ["Income", "Education"], ["Renda (1 = menor, 8 = maior)", "Escolaridade (1 = menor, 6 = maior)"]):
        g = df.groupby(col)[TARGET].mean() * 100
        a.plot(g.index, g.values, marker="o", color=C); a.set_xlabel(t); a.set_ylim(0, 35)
    ax[0].set_ylabel("% com pré-diabetes/diabetes"); fig.suptitle("Desigualdade social e diabetes (ODS 10)")
    save("02_desigualdade.png")

    # 3 modelos
    names = [n for n in met["modelos"] if not n.startswith("Baseline")]
    x = np.arange(len(names)); w = 0.25
    plt.figure(figsize=(7, 3.6))
    for i, (k, lab) in enumerate([("recall", "Recall"), ("f1", "F1"), ("pr_auc", "PR-AUC")]):
        plt.bar(x + (i - 1) * w, [met["modelos"][n][k] for n in names], w, label=lab)
    plt.xticks(x, names); plt.ylim(0, 1); plt.legend(frameon=False); plt.title("Comparação de modelos (teste)")
    save("03_modelos.png")

    # 4 importância
    imp = importance(pipe, Xte, yte).head(8)[::-1]
    plt.figure(figsize=(6, 3.6)); plt.barh(imp.index, imp.values, color=C)
    plt.xlabel("Queda na PR-AUC ao embaralhar a variável"); plt.title("Importância das variáveis"); save("04_importancia.png")

    # 5 matriz de confusão e curva PR no limiar de triagem
    proba = pipe.predict_proba(Xte)[:, 1]
    fig, ax = plt.subplots(1, 2, figsize=(8.5, 3.6))
    ConfusionMatrixDisplay.from_predictions(yte, (proba >= thr).astype(int), ax=ax[0], cmap="Blues",
        display_labels=["Sem", "Com"], colorbar=False)
    ax[0].set_title(f"Matriz de confusão (limiar {thr:.2f})")
    PrecisionRecallDisplay.from_predictions(yte, proba, ax=ax[1], color=C); ax[1].set_title("Curva precisão–recall")
    save("05_avaliacao.png")

    # 6 clusters
    prof = clusters(df)
    plt.figure(figsize=(5.5, 3.4))
    plt.bar([f"Perfil {i}" for i in prof.index], prof["prevalencia"] * 100, color=C)
    plt.ylabel("% com diabetes"); plt.title("Prevalência por perfil (K-Means)"); save("06_clusters.png")

    met["balanceamento"] = balance_comparison(Xtr, ytr, Xte, yte)
    METRICS_PATH.write_text(json.dumps(met, indent=2, ensure_ascii=False))
    return met["balanceamento"]


if __name__ == "__main__":
    print(json.dumps(run(), indent=2, ensure_ascii=False))
