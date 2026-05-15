# Deployment Guide — Aftersales App

**GitHub repo:** https://github.com/bezzu123/aftersales

---

## Step 1: Deploy Backend on Render (free)

1. Go to https://render.com and sign in with GitHub
2. Click **New + → Web Service**
3. Connect repo: `bezzu123/aftersales`
4. Fill in:
   | Field | Value |
   |-------|-------|
   | Root Directory | `backend` |
   | Runtime | `Python 3` |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
   | Instance Type | `Free` |

5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `PYTHONPATH` | `.` |
   | `JWT_SECRET` | *(any long random string)* |
   | `STORAGE_TYPE` | `local` |
   | `UPLOAD_DIR` | `./uploads` |
   | `CORS_ORIGINS` | *(add your Vercel URL after step 2)* |

6. Click **Create Web Service** → wait ~3 minutes
7. Copy your backend URL, e.g. `https://aftersales-backend.onrender.com`

---

## Step 2: Deploy Frontend on Vercel (free)

1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New → Project**
3. Import: `bezzu123/aftersales`
4. Set:
   | Field | Value |
   |-------|-------|
   | Root Directory | `frontend` |
   | Framework Preset | `Vite` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

5. Add Environment Variable:
   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | *(your Render URL from Step 1)* |

6. Click **Deploy** → wait ~1 minute
7. Copy your frontend URL, e.g. `https://aftersales-central.vercel.app`

---

## Step 3: Update CORS on Render

Go to Render dashboard → your service → Environment:
- Update `CORS_ORIGINS` to your Vercel URL
- Click **Save Changes** → Render will redeploy (~1 min)

---

## Step 4 (optional): Enable auto-deploy via GitHub Actions

For future pushes to auto-deploy both services:

### Get Render API credentials:
1. https://dashboard.render.com/u/settings → API Keys → Create Key
2. Open your Render service → copy the Service ID from the URL

### Get Vercel credentials:
1. https://vercel.com/account/tokens → Create Token
2. Run: `cd frontend && vercel link` to get Org ID + Project ID from `.vercel/project.json`

### Add GitHub Secrets:
Go to https://github.com/bezzu123/aftersales/settings/secrets/actions
- `RENDER_API_KEY` = *(Render API key)*
- `RENDER_SERVICE_ID` = *(Render service ID)*
- `VERCEL_TOKEN` = *(Vercel token)*
- `VERCEL_ORG_ID` = *(from .vercel/project.json)*
- `VERCEL_PROJECT_ID` = *(from .vercel/project.json)*

---

## Test Credentials

| User | Password | Role |
|------|----------|------|
| admin | admin1234 | Full access |
| staff01 | staff1234 | Store Staff |
| dsm01 | dsm1234 | Manager (dashboard) |
| vendor01 | vendor1234 | Vendor portal |
