import { handleCors } from './_utils';

export default async function handler(req: any, res: any) {
  if (handleCors(req, res)) return;

  res.setHeader('Content-Type', 'application/json');

  const template = `# ==========================================================
# Google Colab FastAPI Backend for Late Delivery Prediction
# XGBoost + Scikit-Learn Pipeline
# ==========================================================

!pip install fastapi uvicorn pyngrok pydantic xgboost scikit-learn pandas numpy

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import joblib
import uvicorn
from pyngrok import ngrok
import nest_asyncio

nest_asyncio.apply()
app = FastAPI(title="Late Delivery Prediction API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Load trained pipeline
# model_pipeline = joblib.load("late_delivery_xgb_pipeline.pkl")

@app.get("/")
def root():
    return {
        "status": "online",
        "message": "Late Delivery Prediction API is working!",
        "framework": "XGBoost + Scikit-Learn",
        "version": "1.0.0"
    }

@app.get("/features")
def get_features():
    return {
        "features": [
            "Type", "Days for shipment (scheduled)", "Sales per customer",
            "Category Name", "Customer City", "Customer Country",
            "Customer Segment", "Customer State", "Department Name",
            "Latitude", "Longitude", "Market", "Order City", "Order Country",
            "Order Item Discount", "Order Item Discount Rate",
            "Order Item Product Price", "Order Item Quantity", "Sales",
            "Order Item Total", "Order Region", "Order State", "Order Status",
            "Product Name", "Product Price", "Product Status", "Shipping Mode"
        ],
        "numeric_features": [
            "Days for shipment (scheduled)", "Sales per customer", "Latitude",
            "Longitude", "Order Item Discount", "Order Item Discount Rate",
            "Order Item Product Price", "Order Item Quantity", "Sales",
            "Order Item Total", "Product Price", "Product Status"
        ],
        "categorical_features": [
            "Type", "Category Name", "Customer City", "Customer Country",
            "Customer Segment", "Customer State", "Department Name", "Market",
            "Order City", "Order Country", "Order Region", "Order State",
            "Order Status", "Product Name", "Shipping Mode"
        ]
    }

@app.post("/predict")
def predict(payload: dict):
    try:
        # df = pd.DataFrame([payload])
        # y_pred = model_pipeline.predict(df)[0]
        # y_prob = float(model_pipeline.predict_proba(df)[0][1])
        # return {
        #     "prediction": int(y_pred),
        #     "result": "Late Delivery" if int(y_pred) == 1 else "On-Time Delivery",
        #     "late_probability": round(y_prob * 100, 2)
        # }
        pass
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Setup ngrok tunnel and run server:
# ngrok.set_auth_token("YOUR_NGROK_AUTHTOKEN")
# public_url = ngrok.connect(8000).public_url
# print("FastAPI URL for ML_API_URL:", public_url)
# uvicorn.run(app, host="0.0.0.0", port=8000)
`;

  res.status(200).json({ template });
}
