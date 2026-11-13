import pandas as pd
from diabetes_ods.config import FEATURES, TARGET
from diabetes_ods.data import clean, quality_report


def _amostra():
    row = {c: 0 for c in FEATURES}
    row.update(BMI=25, GenHlth=2, Age=5, Education=4, Income=5, **{TARGET: 0})
    return pd.DataFrame([row, row, {**row, "BMI": 500}, {**row, TARGET: 1, "BMI": 31}])


def test_quality_report_conta_duplicadas_e_nulos():
    r = quality_report(_amostra())
    assert r["linhas"] == 4 and r["duplicadas"] == 1 and r["nulos"] == 0


def test_clean_remove_duplicadas_e_imc_impossivel():
    out = clean(_amostra())
    assert len(out) == 2
    assert out["BMI"].between(10, 100).all()
    assert out[TARGET].dtype.kind == "i"
