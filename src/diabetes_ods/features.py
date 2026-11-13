from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from .config import BINARY, NUMERIC, ORDINAL


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        [("num", StandardScaler(), NUMERIC + ORDINAL), ("bin", "passthrough", BINARY)]
    )
