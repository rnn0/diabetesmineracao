from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "data" / "diabetes_binary_health_indicators_BRFSS2015.csv"
MODEL_PATH = ROOT / "models" / "modelo.joblib"
METRICS_PATH = ROOT / "reports" / "metrics.json"
FIG_DIR = ROOT / "reports" / "figures"

TARGET = "Diabetes_binary"
BINARY = ["HighBP", "HighChol", "CholCheck", "Smoker", "Stroke", "HeartDiseaseorAttack",
          "PhysActivity", "Fruits", "Veggies", "HvyAlcoholConsump", "AnyHealthcare",
          "NoDocbcCost", "DiffWalk", "Sex"]
NUMERIC = ["BMI", "MentHlth", "PhysHlth"]
ORDINAL = ["GenHlth", "Age", "Education", "Income"]
FEATURES = BINARY + NUMERIC + ORDINAL
SEED = 42
