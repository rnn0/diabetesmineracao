import joblib
import pandas as pd
from .config import MODEL_PATH


class Predictor:
    def __init__(self, path=MODEL_PATH):
        art = joblib.load(path)
        self.pipeline, self.threshold, self.features = art["pipeline"], art["threshold"], art["features"]

    def predict(self, record: dict) -> dict:
        X = pd.DataFrame([record])[self.features]
        p = float(self.pipeline.predict_proba(X)[0, 1])
        return {"probabilidade": round(p, 4), "alto_risco": p >= self.threshold,
                "limiar": round(self.threshold, 2)}
