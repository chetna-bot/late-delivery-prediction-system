import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// In-memory active ML API URL (defaults to process.env.ML_API_URL)
let activeMlApiUrl: string = (process.env.ML_API_URL || '').trim();

function getNormalizedUrl(url: string): string {
  let cleaned = url.trim();
  if (!cleaned) return '';
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned.replace(/\/+$/, '');
}

// 1. Config API: Get and update ML_API_URL dynamically
app.get(['/api/config', '/config'], (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    mlApiUrl: activeMlApiUrl,
    hasEnvUrl: Boolean(process.env.ML_API_URL && process.env.ML_API_URL.trim()),
    isConfigured: Boolean(activeMlApiUrl),
  });
});

app.post(['/api/config', '/config'], (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  const { mlApiUrl } = req.body || {};
  if (typeof mlApiUrl !== 'string') {
    res.status(400).json({ error: 'mlApiUrl must be a string' });
    return;
  }
  activeMlApiUrl = getNormalizedUrl(mlApiUrl);
  res.json({
    success: true,
    mlApiUrl: activeMlApiUrl,
    isConfigured: Boolean(activeMlApiUrl),
  });
});

function parseBackendResponse(text: string, status: number): { data: any; cleanError?: string } {
  try {
    const json = JSON.parse(text);
    return { data: json };
  } catch {
    if (text.includes('ERR_NGROK_8012') || text.includes('connect: connection refused')) {
      return {
        data: {
          code: 'ERR_NGROK_8012',
          summary: 'FastAPI not listening on port 8000 in Colab',
        },
        cleanError:
          'Ngrok tunnel is online, but your FastAPI application (uvicorn) is not currently running on port 8000 inside Google Colab (ERR_NGROK_8012: Connection Refused). Please execute the cell starting uvicorn in your Colab notebook: uvicorn.run(app, host="0.0.0.0", port=8000)',
      };
    }
    if (text.includes('ERR_NGROK_3200') || text.includes('endpoint offline')) {
      return {
        data: {
          code: 'ERR_NGROK_3200',
          summary: 'Ngrok tunnel offline',
        },
        cleanError:
          'Ngrok tunnel is offline (ERR_NGROK_3200). The Colab runtime may have stopped. Please re-run the ngrok tunnel cell in Colab to obtain a new URL.',
      };
    }

    const clean = text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      data: { rawText: clean.slice(0, 500) },
      cleanError: clean ? clean.slice(0, 300) : `Upstream returned non-JSON HTTP ${status}`,
    };
  }
}

// 2. Health check: Calls GET / on the FastAPI backend
app.get(['/api/health', '/health'], async (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  const targetUrl = activeMlApiUrl || getNormalizedUrl(process.env.ML_API_URL || '');
  if (!targetUrl) {
    res.status(400).json({
      ok: false,
      error: 'ML_API_URL is not configured. Please set the environment variable or enter your Colab FastAPI URL.',
      code: 'NO_URL_CONFIGURED',
    });
    return;
  }

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const backendRes = await fetch(`${targetUrl}/`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
        'User-Agent': 'LateDeliveryPredictionApp/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const latencyMs = Date.now() - startTime;
    const text = await backendRes.text();
    const { data, cleanError } = parseBackendResponse(text, backendRes.status);

    if (backendRes.ok) {
      res.json({
        ok: true,
        status: backendRes.status,
        statusText: backendRes.statusText,
        data,
        targetUrl,
        latencyMs,
      });
    } else {
      res.status(backendRes.status).json({
        ok: false,
        status: backendRes.status,
        statusText: backendRes.statusText,
        data,
        targetUrl,
        latencyMs,
        error: cleanError || `FastAPI backend responded with HTTP ${backendRes.status}`,
      });
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const isTimeout = err.name === 'AbortError';
    res.status(502).json({
      ok: false,
      error: isTimeout
        ? 'Connection timed out after 12s. Check if your Google Colab notebook is still running and ngrok tunnel is alive.'
        : (err.message || 'Failed to reach FastAPI backend'),
      code: isTimeout ? 'TIMEOUT' : 'FETCH_ERROR',
      targetUrl,
      latencyMs,
    });
  }
});

// 3. Features route: Forward to GET /features on FastAPI backend
app.get(['/api/features', '/features'], async (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  const targetUrl = activeMlApiUrl || getNormalizedUrl(process.env.ML_API_URL || '');
  if (!targetUrl) {
    res.status(400).json({
      error: 'ML_API_URL is not configured. Please provide your Colab FastAPI backend URL.',
      code: 'NO_URL_CONFIGURED',
    });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const backendRes = await fetch(`${targetUrl}/features`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const text = await backendRes.text();
    const { data, cleanError } = parseBackendResponse(text, backendRes.status);

    if (!backendRes.ok) {
      res.status(backendRes.status).json({
        error: cleanError || `Backend error (HTTP ${backendRes.status}) while fetching /features`,
        details: data,
        targetUrl,
      });
      return;
    }

    res.json(data);
  } catch (err: any) {
    const isTimeout = err.name === 'AbortError';
    res.status(502).json({
      error: isTimeout
        ? 'Timeout while connecting to FastAPI /features. Verify Colab notebook is active.'
        : `Could not connect to FastAPI /features: ${err.message}`,
      targetUrl,
    });
  }
});

// 4. Predict route: Forward to POST /predict on FastAPI backend
app.post(['/api/predict', '/predict'], async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  const targetUrl = activeMlApiUrl || getNormalizedUrl(process.env.ML_API_URL || '');
  if (!targetUrl) {
    res.status(400).json({
      error: 'ML_API_URL is not configured. Please set the FastAPI backend URL.',
      code: 'NO_URL_CONFIGURED',
    });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const payload = req.body;

    const backendRes = await fetch(`${targetUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const text = await backendRes.text();
    const { data, cleanError } = parseBackendResponse(text, backendRes.status);

    if (!backendRes.ok) {
      res.status(backendRes.status).json({
        error: cleanError || `ML Backend returned HTTP ${backendRes.status}`,
        details: data,
        targetUrl,
      });
      return;
    }

    res.json(data);
  } catch (err: any) {
    const isTimeout = err.name === 'AbortError';
    res.status(502).json({
      error: isTimeout
        ? 'Inference request timed out after 20s. Check your Colab GPU/CPU execution.'
        : `Failed to connect to FastAPI /predict: ${err.message}`,
      targetUrl,
    });
  }
});

// 5. Reference Colab script template endpoint for developer convenience
app.get(['/api/colab-template', '/colab-template'], (_req: Request, res: Response) => {
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
  res.json({ template });
});

export default app;
