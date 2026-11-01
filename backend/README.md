# 24/7 Permanent FastAPI Backend for Late Delivery Prediction

This folder contains the complete, standalone FastAPI backend for your trained XGBoost model.
Deploying this ensures your backend is **online 24/7 permanently**, so you never need to keep Google Colab open or re-run ngrok tunnels.

---

## 🚀 Option 1: Free 24/7 Deployment on Render (Recommended)

1. Sign up for free at [render.com](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository: `https://github.com/chetna-bot/late-delivery-prediction-system`.
4. Configure these 3 fields:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**.
6. Render will give you a permanent HTTPS URL, for example:
   `https://late-delivery-prediction-api.onrender.com`
7. In your Vercel Dashboard, go to **Settings > Environment Variables**, and set:
   `ML_API_URL` = `https://late-delivery-prediction-api.onrender.com`

**Done!** Your FastAPI backend is now permanently online 24/7.

---

## 🚀 Option 2: Free 24/7 Deployment on Hugging Face Spaces

1. Create a free account at [huggingface.co](https://huggingface.co).
2. Click **New Space**.
3. Choose **Docker** or **Gradio/FastAPI**.
4. Upload `main.py`, `requirements.txt`, and your trained `model.pkl`.
5. Hugging Face gives you a permanent HTTPS URL like:
   `https://chetna-bot-late-delivery-api.hf.space`
6. Put that URL in `ML_API_URL`.

---

## ⚡ Option 3: Keep Google Colab from Sleeping (While Using Colab)

If you still want to run from Google Colab right now without it pausing:

1. In your Colab notebook tab, press **F12** (or Right-Click > Inspect) and open the **Console** tab.
2. Paste this JavaScript snippet and press Enter:
   ```javascript
   function KeepClicking(){
       console.log("Keeping Colab awake...");
       document.querySelector("colab-connect-button")?.click();
   }
   setInterval(KeepClicking, 60000);
   ```
3. This keeps the Colab tab active so Google doesn't disconnect your ngrok tunnel while your browser is open.
