from fastapi import FastAPI
from pydantic import BaseModel, Field
from diabetes_ods.predict import Predictor

app = FastAPI(title="Triagem de risco de diabetes (ODS 3)", version="1.0.0")
_pred = None


def get_predictor() -> Predictor:
    global _pred
    if _pred is None:
        _pred = Predictor()
    return _pred


class Paciente(BaseModel):
    HighBP: int = Field(ge=0, le=1)
    HighChol: int = Field(ge=0, le=1)
    CholCheck: int = Field(1, ge=0, le=1)
    BMI: float = Field(ge=10, le=100)
    Smoker: int = Field(0, ge=0, le=1)
    Stroke: int = Field(0, ge=0, le=1)
    HeartDiseaseorAttack: int = Field(0, ge=0, le=1)
    PhysActivity: int = Field(ge=0, le=1)
    Fruits: int = Field(1, ge=0, le=1)
    Veggies: int = Field(1, ge=0, le=1)
    HvyAlcoholConsump: int = Field(0, ge=0, le=1)
    AnyHealthcare: int = Field(1, ge=0, le=1)
    NoDocbcCost: int = Field(0, ge=0, le=1)
    GenHlth: int = Field(ge=1, le=5)
    MentHlth: int = Field(0, ge=0, le=30)
    PhysHlth: int = Field(0, ge=0, le=30)
    DiffWalk: int = Field(0, ge=0, le=1)
    Sex: int = Field(ge=0, le=1)
    Age: int = Field(ge=1, le=13)
    Education: int = Field(ge=1, le=6)
    Income: int = Field(ge=1, le=8)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(p: Paciente):
    return get_predictor().predict(p.model_dump())
