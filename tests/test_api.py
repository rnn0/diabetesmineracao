import pytest
from fastapi.testclient import TestClient
from app.main import app
from diabetes_ods.config import MODEL_PATH

client = TestClient(app)
PACIENTE = dict(HighBP=1, HighChol=1, BMI=34, PhysActivity=0, GenHlth=4, Sex=0, Age=10, Education=3, Income=2)


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


@pytest.mark.skipif(not MODEL_PATH.exists(), reason="modelo não treinado (rode make train)")
def test_predict_retorna_probabilidade_valida():
    r = client.post("/predict", json=PACIENTE)
    assert r.status_code == 200
    assert 0 <= r.json()["probabilidade"] <= 1


def test_predict_rejeita_valor_invalido():
    assert client.post("/predict", json={**PACIENTE, "BMI": 5}).status_code == 422
