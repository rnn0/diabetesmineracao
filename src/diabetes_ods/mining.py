"""Técnicas de mineração: importância de variáveis, regras de associação e clusters."""
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from sklearn.cluster import KMeans
from sklearn.inspection import permutation_importance
from sklearn.preprocessing import StandardScaler
from .config import FEATURES, SEED, TARGET


def importance(pipeline, X, y, n=5000):
    idx = X.sample(min(n, len(X)), random_state=SEED).index
    r = permutation_importance(pipeline, X.loc[idx], y.loc[idx], scoring="average_precision",
                               n_repeats=5, random_state=SEED, n_jobs=-1)
    return pd.Series(r.importances_mean, index=FEATURES).sort_values(ascending=False)


def to_items(df: pd.DataFrame) -> pd.DataFrame:
    """Discretiza as variáveis em itens booleanos para o Apriori."""
    it = pd.DataFrame(index=df.index)
    it["Diabetes"] = df[TARGET] == 1
    it["Pressao_alta"] = df["HighBP"] == 1
    it["Colesterol_alto"] = df["HighChol"] == 1
    it["Obesidade_IMC>=30"] = df["BMI"] >= 30
    it["Sedentario"] = df["PhysActivity"] == 0
    it["Dificuldade_andar"] = df["DiffWalk"] == 1
    it["Saude_geral_ruim(4-5)"] = df["GenHlth"] >= 4
    it["Idade>=60"] = df["Age"] >= 9
    it["Renda_baixa(<=3)"] = df["Income"] <= 3
    it["Sem_ensino_medio(<=3)"] = df["Education"] <= 3
    it["Fruta_diaria"] = df["Fruits"] == 1
    it["Fumante"] = df["Smoker"] == 1
    return it


def rules_for_diabetes(df, min_support=0.03, min_conf=0.30):
    items = to_items(df)
    fi = apriori(items, min_support=min_support, use_colnames=True, max_len=4)
    rules = association_rules(fi, metric="lift", min_threshold=1.0)
    rules = rules[(rules["consequents"] == frozenset({"Diabetes"})) & (rules["confidence"] >= min_conf)]
    rules = rules.sort_values("lift", ascending=False)
    rules["regra"] = rules["antecedents"].apply(lambda s: " + ".join(sorted(s)))
    return rules[["regra", "support", "confidence", "lift"]].reset_index(drop=True)


def clusters(df, k=4):
    cols = ["BMI", "Age", "Income", "Education", "GenHlth", "HighBP", "HighChol", "PhysActivity"]
    Z = StandardScaler().fit_transform(df[cols])
    km = KMeans(n_clusters=k, n_init=10, random_state=SEED).fit(Z)
    out = df.assign(cluster=km.labels_)
    prof = out.groupby("cluster").agg(
        n=(TARGET, "size"), prevalencia=(TARGET, "mean"), imc=("BMI", "mean"), idade=("Age", "mean"),
        renda=("Income", "mean"), escolaridade=("Education", "mean"), saude_geral=("GenHlth", "mean"),
        pressao_alta=("HighBP", "mean"), atividade=("PhysActivity", "mean"))
    return prof.round(3)
