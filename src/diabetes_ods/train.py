import json
import joblib
import numpy as np
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (average_precision_score, f1_score, precision_score,
                             recall_score, roc_auc_score)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from .config import FEATURES, METRICS_PATH, MODEL_PATH, SEED, TARGET
from .data import clean, load_data, quality_report
from .features import build_preprocessor


def get_models():
    return {
        "Baseline (classe majoritária)": DummyClassifier(strategy="most_frequent"),
        "Regressão Logística": LogisticRegression(max_iter=1000, class_weight="balanced"),
        "Random Forest": RandomForestClassifier(
            n_estimators=200, min_samples_leaf=20, class_weight="balanced_subsample",
            n_jobs=-1, random_state=SEED),
        "Gradient Boosting": HistGradientBoostingClassifier(
            class_weight="balanced", max_iter=200, learning_rate=0.08, random_state=SEED),
    }


def split(df):
    X, y = df[FEATURES], df[TARGET]
    return train_test_split(X, y, test_size=0.2, stratify=y, random_state=SEED)


def metrics_for(model, X, y, threshold=0.5):
    proba = model.predict_proba(X)[:, 1]
    pred = (proba >= threshold).astype(int)
    return {
        "recall": recall_score(y, pred), "precisao": precision_score(y, pred, zero_division=0),
        "f1": f1_score(y, pred), "roc_auc": roc_auc_score(y, proba),
        "pr_auc": average_precision_score(y, proba),
    }


def best_threshold(model, X, y, min_recall=0.80):
    """Maior precisão possível mantendo recall mínimo (triagem prioriza não perder casos)."""
    proba = model.predict_proba(X)[:, 1]
    best = (0.5, 0.0)
    for t in np.linspace(0.05, 0.95, 91):
        pred = (proba >= t).astype(int)
        if recall_score(y, pred) >= min_recall:
            p = precision_score(y, pred, zero_division=0)
            if p > best[1]:
                best = (float(t), p)
    return best[0]


def run():
    raw = load_data()
    report = quality_report(raw)
    df = clean(raw)
    report["linhas_apos_limpeza"] = int(len(df))
    report["prevalencia_apos_limpeza"] = float(df[TARGET].mean())
    Xtr, Xte, ytr, yte = split(df)
    results, fitted = {}, {}
    for name, est in get_models().items():
        pipe = Pipeline([("prep", build_preprocessor()), ("clf", est)]).fit(Xtr, ytr)
        results[name] = {k: round(float(v), 4) for k, v in metrics_for(pipe, Xte, yte).items()}
        fitted[name] = pipe
    champion = max((n for n in results if not n.startswith("Baseline")),
                   key=lambda n: results[n]["pr_auc"])
    # limiar escolhido em validação (parte do treino), avaliado no teste
    Xa, Xv, ya, yv = train_test_split(Xtr, ytr, test_size=0.2, stratify=ytr, random_state=SEED)
    tmp = Pipeline([("prep", build_preprocessor()), ("clf", get_models()[champion])]).fit(Xa, ya)
    thr = best_threshold(tmp, Xv, yv)
    final = fitted[champion]
    tuned = {k: round(float(v), 4) for k, v in metrics_for(final, Xte, yte, thr).items()}
    MODEL_PATH.parent.mkdir(exist_ok=True)
    joblib.dump({"pipeline": final, "threshold": thr, "features": FEATURES}, MODEL_PATH)
    out = {"qualidade": report, "modelos": results, "campeao": champion,
           "limiar_triagem": round(thr, 2), "campeao_limiar_triagem": tuned}
    METRICS_PATH.parent.mkdir(exist_ok=True)
    METRICS_PATH.write_text(json.dumps(out, indent=2, ensure_ascii=False))
    return out


if __name__ == "__main__":
    print(json.dumps(run(), indent=2, ensure_ascii=False))
