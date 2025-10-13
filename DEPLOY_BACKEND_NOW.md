# 🚀 Deploy Backend to Render - Quick Guide

## ✅ Frontend is Live!
**URL**: https://globalvoice-nexus.netlify.app

Now let's deploy the backend so you can create accounts and use the app!

---

## 📋 Deploy Backend (5 minutes)

### Step 1: Go to Render

1. Open https://dashboard.render.com
2. Sign up with your GitHub account (xdun1698)
3. Authorize Render to access your repositories

### Step 2: Deploy Using Blueprint

1. Click **"New +"** button (top right)
2. Select **"Blueprint"**
3. Click **"Connect GitHub"** (if not already connected)
4. Search for and select: **`globalvoice-nexus`**
5. Click **"Connect"**

Render will automatically detect `render.yaml` and show:
- ✅ `globalvoice-backend` service
- ✅ `globalvoice-nlp` service

### Step 3: Add Environment Variables

Before clicking "Apply", you need to add environment variables.

Click on **`globalvoice-backend`** service and add these:

```env
DATABASE_URL
postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres

JWT_SECRET
globalvoice-jwt-secret-xdun1698-production-key

ENCRYPTION_KEY
globalvoice-encryption-xdun1698-prod-key

FRONTEND_URL
https://globalvoice-nexus.netlify.app

NLP_ENGINE_URL
https://globalvoice-nlp.onrender.com
```

**Important:** Add your OpenAI API key if you have it:
```env
OPENAI_API_KEY
sk-proj-your-actual-key-here
```

Click on **`globalvoice-nlp`** service and add:

```env
OPENAI_API_KEY
sk-proj-your-actual-key-here
```

### Step 4: Deploy!

1. Click **"Apply"** button
2. Wait 5-10 minutes for deployment
3. Both services will build and deploy automatically

You'll see:
- ✅ `globalvoice-backend` → `https://globalvoice-backend.onrender.com`
- ✅ `globalvoice-nlp` → `https://globalvoice-nlp.onrender.com`

---

## 🔄 Update Netlify Environment Variables

Once backend is deployed:

1. Go to https://app.netlify.com
2. Click your **globalvoice-nexus** site
3. Go to **Site settings** → **Environment variables**
4. Click **"Add a variable"**

Add these two variables:

```env
Key: VITE_BACKEND_URL
Value: https://globalvoice-backend.onrender.com

Key: VITE_WS_URL
Value: wss://globalvoice-backend.onrender.com
```

5. Click **"Save"**
6. Go to **Deploys** tab
7. Click **"Trigger deploy"** → **"Deploy site"**

Wait 2-3 minutes for redeployment.

---

## ✅ Test Your Application

### 1. Test Backend Health

Open in browser or run:
```bash
curl https://globalvoice-backend.onrender.com/health
```

Expected response:
```json
{"status":"healthy","timestamp":"..."}
```

### 2. Test Frontend

1. Go to https://globalvoice-nexus.netlify.app
2. Click **"Sign up"**
3. Fill in:
   - Name: Your Name
   - Email: your@email.com
   - Password: YourPassword123!
4. Click **"Create Account"**

If successful, you'll be redirected to the dashboard! 🎉

---

## 🐛 Troubleshooting

### Backend won't deploy
- Check Render logs in dashboard
- Verify all environment variables are set
- Make sure DATABASE_URL is correct

### "Failed to create account" error
- Backend might still be deploying (wait 10 minutes)
- Check backend health endpoint
- Look at browser console for errors (F12)

### Render free tier limitations
- Services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Upgrade to Starter plan ($7/month per service) for always-on

---

## 💰 Costs

### Current Setup (Free!)
- Netlify Pro: $19/month (you already have)
- Supabase Pro: $25/month (you already have)
- Render: **$0/month** (free tier)

**Total: $44/month** (what you're already paying!)

### Optional Upgrade
- Render Starter (backend): $7/month
- Render Starter (NLP): $7/month
- **Total: $58/month** (for always-on, no cold starts)

---

## 🎯 What Happens After Deployment

### Auto-Deploy is Active!

Every time you push code to GitHub:

```bash
git add .
git commit -m "Your changes"
git push
```

**Automatically:**
- ✅ Netlify rebuilds frontend (2-3 min)
- ✅ Render rebuilds backend (5-7 min)
- ✅ Render rebuilds NLP engine (5-7 min)
- ✅ You get email notifications

---

## 📊 Your Complete Stack

After deployment:

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://globalvoice-nexus.netlify.app | ✅ Live |
| **Backend** | https://globalvoice-backend.onrender.com | ⏳ Deploy now |
| **NLP Engine** | https://globalvoice-nlp.onrender.com | ⏳ Deploy now |
| **Database** | Supabase | ✅ Ready |

---

## 🎉 Next Steps After Deployment

1. ✅ Create your first user account
2. ✅ Build your first AI agent
3. ✅ Add OpenAI API key for AI features
4. ✅ Configure Twilio for phone calls (optional)
5. ✅ Import contacts
6. ✅ Start making calls!

---

## 📞 Need Help?

- **Render Logs**: Dashboard → Your service → Logs
- **Netlify Logs**: Dashboard → Your site → Deploys → Deploy log
- **Database**: Supabase dashboard → Table Editor

---

**Ready to deploy? Go to https://dashboard.render.com now!** 🚀
