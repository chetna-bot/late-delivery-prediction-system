"""
FastAPI Permanent 24/7 Cloud Backend for Late Delivery Prediction System
Deployable on Render, Railway, Hugging Face Spaces, or any container host.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
import joblib

app = FastAPI(
    title="Late Delivery Prediction API",
    description="XGBoost & Scikit-Learn Pipeline for Shipment Delay Forecasting",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 27 Verified Model Features
NUMERICAL_FEATURES = [
    "Days for shipment (scheduled)",
    "Sales per customer",
    "Latitude",
    "Longitude",
    "Order Item Discount",
    "Order Item Discount Rate",
    "Order Item Product Price",
    "Order Item Quantity",
    "Sales",
    "Order Item Total",
    "Product Price",
    "Product Status"
]

CATEGORICAL_FEATURES = [
    "Type",
    "Category Name",
    "Customer City",
    "Customer Country",
    "Customer Segment",
    "Customer State",
    "Department Name",
    "Market",
    "Order City",
    "Order Country",
    "Order Region",
    "Order State",
    "Order Status",
    "Product Name",
    "Shipping Mode"
]

CATEGORICAL_OPTIONS = {
    "Type": ["PAYMENT", "TRANSFER", "DEBIT", "CASH"],
    "Shipping Mode": ["Standard Class", "First Class", "Second Class", "Same Day"],
    "Customer Segment": ["Consumer", "Corporate", "Home Office"],
    "Order Status": ["COMPLETE", "PENDING", "PROCESSING", "CLOSED", "ON_HOLD", "CANCELED"],
    "Market": ["Pacific Asia", "USCA", "Africa", "Europe", "LATAM"]
}

ALL_FEATURES = NUMERICAL_FEATURES + CATEGORICAL_FEATURES

# Load model pipeline (looks for model.pkl or late_delivery_model.pkl)
MODEL_PATH = os.environ.get("MODEL_PATH", "model.pkl")
pipeline = None

if os.path.exists(MODEL_PATH):
    try:
        pipeline = joblib.load(MODEL_PATH)
        print(f"[SUCCESS] Loaded model pipeline from {MODEL_PATH}")
    except Exception as e:
        print(f"[WARNING] Could not load model pipeline: {e}")
elif os.path.exists("late_delivery_xgb_pipeline.pkl"):
    try:
        pipeline = joblib.load("late_delivery_xgb_pipeline.pkl")
        print("[SUCCESS] Loaded model pipeline from late_delivery_xgb_pipeline.pkl")
    except Exception as e:
        print(f"[WARNING] Could not load model pipeline: {e}")
else:
    print("[INFO] Model file not found in directory. Place your exported model.pkl in this folder.")


@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "Late Delivery Prediction System",
        "model_loaded": pipeline is not None,
        "framework": "XGBoost + Scikit-Learn Pipeline",
        "version": "1.0.0"
    }


@app.get("/features")
def get_features():
    return {
        "features": ALL_FEATURES,
        "numeric_features": NUMERICAL_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "categorical_options": CATEGORICAL_OPTIONS
    }


@app.post("/predict")
def predict(payload: dict):
    try:
        # If pipeline is loaded from model.pkl
        if pipeline is not None:
            df = pd.DataFrame([payload])
            # Ensure all expected columns exist
            for col in ALL_FEATURES:
                if col not in df.columns:
                    df[col] = 0 if col in NUMERICAL_FEATURES else "Unknown"

            y_pred = int(pipeline.predict(df)[0])
            if hasattr(pipeline, "predict_proba"):
                y_prob = float(pipeline.predict_proba(df)[0][1])
            else:
                y_prob = 0.99 if y_pred == 1 else 0.01

            return {
                "prediction": y_pred,
                "result": "Late Delivery" if y_pred == 1 else "On-Time Delivery",
                "late_probability": round(y_prob * 100, 2)
            }
        else:
            # Fallback estimation if model.pkl hasn't been placed yet
            # Uses standard supply chain risk heuristics based on days and shipping mode
            scheduled = float(payload.get("Days for shipment (scheduled)", 4))
            mode = str(payload.get("Shipping Mode", "Standard Class")).lower()
            
            # Heuristic calculation while awaiting model.pkl upload
            risk = 0.35
            if scheduled <= 1:
                risk += 0.50
            if "first" in mode or "same" in mode:
                risk += 0.15
            if "second" in mode:
                risk += 0.05

            risk = min(max(risk, 0.05), 0.99)
            pred = 1 if risk >= 0.50 else 0

            return {
                "prediction": pred,
                "result": "Late Delivery" if pred == 1 else "On-Time Delivery",
                "late_probability": round(risk * 100, 2),
                "notice": "Trained XGBoost model.pkl file awaiting placement in backend folder."
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
