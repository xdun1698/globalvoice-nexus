# 🚀 Deploy to Netlify + Supabase

## Overview

This guide shows you how to deploy GlobalVoice Nexus using:
- **Netlify** - Frontend hosting (you have an account ✅)
- **Supabase** - PostgreSQL database (you have an account ✅)
- **Render** - Backend API (free tier)

**Total Cost: $0/month for testing!**

---

## Step 1: Setup Supabase Database (5 minutes)

### 1.1 Create Project

1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Fill in:
   - **Name**: globalvoice-nexus
   - **Database Password**: (generate strong password)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait 2 minutes for setup

### 1.2 Get Connection String

1. In Supabase dashboard, click "Settings" (gear icon)
2. Click "Database"
3. Scroll to "Connection string"
4. Copy the **URI** format:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual password

### 1.3 Run Migrations

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project

# Update .env with Supabase URL
echo "DATABASE_URL=your-supabase-connection-string" >> .env

# Run migrations
cd backend
npm run migrate
```

You should see: ✅ Migrations completed!

---

## Step 2: Deploy Backend to Render (10 minutes)

### 2.1 Create Render Account

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub

### 2.2 Deploy Backend Service

1. Click "New +" → "Web Service"
2. Click "Connect GitHub"
3. Select your repository
4. Configure:

**Service Details:**
```
Name: globalvoice-backend
Region: Oregon (or closest)
Branch: main
Root Directory: backend
```

**Build & Deploy:**
```
Environment: Node
Build Command: npm install
Start Command: npm start
```

**Instance Type:**
```
Free (for testing)
```

5. Click "Advanced" → "Add Environment Variable"

Add these variables:
```env
NODE_ENV=production
DATABASE_URL=your-supabase-connection-string
REDIS_URL=redis://localhost:6379
JWT_SECRET=generate-random-32-char-string
ENCRYPTION_KEY=generate-random-32-char-string
OPENAI_API_KEY=sk-your-openai-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
FRONTEND_URL=https://your-app.netlify.app
NLP_ENGINE_URL=https://your-nlp.onrender.com
```

6. Click "Create Web Service"
7. Wait 5 minutes for deployment
8. Copy your backend URL: `https://globalvoice-backend.onrender.com`

### 2.3 Test Backend

```bash
curl https://globalvoice-backend.onrender.com/health
```

Should return: `{"status":"healthy"}`

---

## Step 3: Deploy NLP Engine to Render (5 minutes)

### 3.1 Create NLP Service

1. In Render, click "New +" → "Web Service"
2. Select same repository
3. Configure:

**Service Details:**
```
Name: globalvoice-nlp
Region: Same as backend
Branch: main
Root Directory: nlp-engine
```

**Build & Deploy:**
```
Environment: Python 3
Build Command: pip install -r requirements-minimal.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

4. Add environment variables:
```env
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-key (optional)
```

5. Click "Create Web Service"
6. Copy NLP URL: `https://globalvoice-nlp.onrender.com`

### 3.2 Update Backend with NLP URL

1. Go back to backend service in Render
2. Click "Environment"
3. Update `NLP_ENGINE_URL` to your NLP service URL
4. Click "Save Changes"

---

## Step 4: Deploy Frontend to Netlify (5 minutes)

### 4.1 Prepare Frontend

Update frontend environment:

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project/frontend

# Create .env.production
cat > .env.production << EOF
VITE_BACKEND_URL=https://globalvoice-backend.onrender.com
VITE_WS_URL=wss://globalvoice-backend.onrender.com
EOF
```

### 4.2 Deploy to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Click "Deploy with GitHub"
4. Select your repository
5. Configure:

**Build settings:**
```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

**Environment variables:**
```
VITE_BACKEND_URL=https://globalvoice-backend.onrender.com
VITE_WS_URL=wss://globalvoice-backend.onrender.com
```

6. Click "Deploy site"
7. Wait 2-3 minutes
8. Your site is live! 🎉

### 4.3 Custom Domain (Optional)

1. In Netlify, click "Domain settings"
2. Click "Add custom domain"
3. Follow instructions to connect your domain

---

## Step 5: Update Backend CORS (Important!)

1. Go to Render backend service
2. Click "Environment"
3. Update `FRONTEND_URL` to your Netlify URL:
   ```
   FRONTEND_URL=https://your-app.netlify.app
   ```
4. Click "Save Changes"
5. Service will redeploy automatically

---

## Step 6: Configure Twilio Webhooks

1. Go to https://console.twilio.com/
2. Navigate to Phone Numbers → Manage → Active numbers
3. Click your phone number
4. Under "Voice Configuration":
   ```
   A CALL COMES IN: Webhook
   URL: https://globalvoice-backend.onrender.com/api/webhooks/twilio/voice
   HTTP: POST
   ```
5. Click "Save"

---

## ✅ Verification Checklist

Test each service:

### Backend
```bash
curl https://globalvoice-backend.onrender.com/health
```
Expected: `{"status":"healthy"}`

### NLP Engine
```bash
curl https://globalvoice-nlp.onrender.com/health
```
Expected: `{"status":"healthy"}`

### Frontend
Open: `https://your-app.netlify.app`
Expected: Login page loads

### Full Flow
1. Go to your Netlify URL
2. Click "Sign up"
3. Create account
4. Should redirect to dashboard ✅

---

## 🐛 Troubleshooting

### Backend won't start
- Check Render logs: Dashboard → Logs
- Verify DATABASE_URL is correct
- Check all environment variables are set

### Frontend can't connect to backend
- Check CORS: Make sure FRONTEND_URL matches Netlify URL
- Check backend URL in frontend .env.production
- Look at browser console for errors

### Database connection failed
- Verify Supabase connection string
- Check if database password is correct
- Make sure migrations ran successfully

### Cold starts (Render free tier)
- First request takes 15-30 seconds
- Upgrade to paid tier ($7/month) for instant response

---

## 💰 Costs

### Free Tier (Perfect for Testing)
- Netlify: Free ✅
- Supabase: Free (500MB) ✅
- Render Backend: Free (with cold starts) ✅
- Render NLP: Free (with cold starts) ✅
- **Total: $0/month**

### Production (Better Performance)
- Netlify: Free ✅
- Supabase Pro: $25/month
- Render Starter (Backend): $7/month
- Render Starter (NLP): $7/month
- **Total: $39/month**

---

## 🚀 Next Steps

1. ✅ Test the application
2. ✅ Add your OpenAI API key
3. ✅ Configure Twilio for calls
4. ✅ Import contacts
5. ✅ Create your first agent
6. ✅ Make test calls

---

## 📊 Monitoring

### Netlify
- Dashboard → Analytics
- See deployment history
- Check build logs

### Render
- Dashboard → Logs (real-time)
- Metrics tab for performance
- Set up alerts

### Supabase
- Dashboard → Database
- Table Editor to view data
- SQL Editor for queries

---

## 🔒 Security Checklist

- [ ] All API keys in environment variables (not in code)
- [ ] CORS configured correctly
- [ ] HTTPS enabled (automatic on Netlify/Render)
- [ ] Strong JWT_SECRET and ENCRYPTION_KEY
- [ ] Database password is strong
- [ ] Twilio webhooks use HTTPS

---

## 🎉 You're Live!

Your GlobalVoice Nexus platform is now deployed and accessible worldwide!

**Your URLs:**
- Frontend: `https://your-app.netlify.app`
- Backend: `https://globalvoice-backend.onrender.com`
- NLP: `https://globalvoice-nlp.onrender.com`

**Need help?** Check the troubleshooting section or deployment logs.
