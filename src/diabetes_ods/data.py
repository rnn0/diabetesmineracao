import pandas as pd
from .config import DATA_PATH, TARGET, FEATURES


def load_data(path=DATA_PATH) -> pd.DataFrame:
    return pd.read_csv(path)


def quality_report(df: pd.DataFrame) -> dict:
    return {
        "linhas": int(len(df)),
        "colunas": int(df.shape[1]),
        "nulos": int(df.isna().sum().sum()),
        "duplicadas": int(df.duplicated().sum()),
        "prevalencia_alvo": float(df[TARGET].mean()),
    }


def clean(df: pd.DataFrame) -> pd.DataFrame:
    """Remove duplicatas, filtra valores impossíveis e converte tipos."""
    out = df.drop_duplicates().copy()
    out = out[(out["BMI"].between(10, 100)) & (out["MentHlth"].between(0, 30))
              & (out["PhysHlth"].between(0, 30))]
    out[TARGET] = out[TARGET].astype(int)
    out[FEATURES] = out[FEATURES].astype(float)
    return out.reset_index(drop=True)
