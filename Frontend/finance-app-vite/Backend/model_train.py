from sklearn.linear_model import LinearRegression
from utils import load_data
import pickle
import numpy as np

def train_and_save_model():
    df = load_data()
    if df.empty:
        print("No data available yet.")
        return

    X = df[["month"]]
    y = df["amount"]

    model = LinearRegression()
    model.fit(X, y)

    with open("model.pkl", "wb") as f:
        pickle.dump(model, f)

    print("Model Trained & Saved as model.pkl")

if __name__ == "__main__":
    train_and_save_model()
