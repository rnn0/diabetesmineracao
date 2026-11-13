import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from diabetes_ods.config import FEATURES, TARGET
from diabetes_ods.features import build_preprocessor
from diabetes_ods.train import best_threshold, split


def _sintetico(n=600, seed=0):
    rng = np.random.default_rng(seed)
    X = pd.DataFrame(rng.integers(0, 2, (n, len(FEATURES))).astype(float), columns=FEATURES)
    X["BMI"] = rng.normal(28, 5, n)
    y = (X["BMI"] + rng.normal(0, 3, n) > 32).astype(int)
    return X.assign(**{TARGET: y})


def test_split_estratificado_e_reprodutivel():
    df = _sintetico()
    a = split(df); b = split(df)
    assert abs(a[2].mean() - a[3].mean()) < 0.02
    assert a[0].index.equals(b[0].index)


def test_preprocessador_preserva_linhas_e_colunas():
    df = _sintetico()
    Z = build_preprocessor().fit_transform(df[FEATURES])
    assert Z.shape == (len(df), len(FEATURES))


def test_limiar_respeita_recall_minimo():
    from sklearn.metrics import recall_score
    df = _sintetico(); X, y = df[FEATURES], df[TARGET]
    m = Pipeline([("p", build_preprocessor()), ("c", LogisticRegression(max_iter=500))]).fit(X, y)
    t = best_threshold(m, X, y, min_recall=0.8)
    assert recall_score(y, (m.predict_proba(X)[:, 1] >= t).astype(int)) >= 0.8
