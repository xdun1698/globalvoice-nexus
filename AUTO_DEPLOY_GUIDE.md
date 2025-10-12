# 🚀 Auto-Deploy Guide - Connect to GitHub

## Overview

This guide will help you set up **automatic deployment** for GlobalVoice Nexus using your existing paid accounts:
- ✅ **Netlify** (Frontend) - Auto-deploy on push
- ✅ **Supabase** (Database) - Already have account
- ✅ **Render** (Backend + NLP) - Free tier with auto-deploy

**Every time you push to GitHub, your app automatically deploys!** 🎉

---

## Step 1: Create GitHub Repository (2 minutes)

### Option A: Using GitHub Website

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `globalvoice-nexus`
   - **Description**: `AI Call Agent Platform with Multilingual NLP`
   - **Visibility**: Private (recommended) or Public
3. **DO NOT** initialize with README (we already have one)
4. Click "Create repository"

### Option B: Using GitHub CLI (if installed)

```bash
gh repo create globalvoice-nexus --private --source=. --remote=origin
```

---

## Step 2: Push Code to GitHub (1 minute)

The code is already committed. Now push it:

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/globalvoice-nexus.git

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

---

## Step 3: Setup Supabase Database (5 minutes)

### 3.1 Create Project

1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Select your organization
4. Fill in:
   - **Name**: `globalvoice-nexus`
   - **Database Password**: (generate strong password - save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Use your paid plan
5. Click "Create new project"
6. Wait 2 minutes for setup

### 3.2 Get Connection String

1. Click "Settings" (gear icon) → "Database"
2. Scroll to "Connection string" → "URI"
3. Copy the connection string:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
4. **Save this!** You'll need it for Render

### 3.3 Run Migrations

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project/backend

# Set your Supabase URL temporarily
export DATABASE_URL="your-supabase-connection-string"

# Run migrations
npm run migrate
```

You should see: ✅ Migrations completed successfully!

---

## Step 4: Deploy Backend to Render (Auto-Deploy) (5 minutes)

### 4.1 Connect GitHub to Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Blueprint"
3. Click "Connect GitHub"
4. Authorize Render to access your repositories
5. Select `globalvoice-nexus` repository

### 4.2 Configure Blueprint

Render will detect the `render.yaml` file automatically!

1. Click "Apply"
2. You'll see two services:
   - `globalvoice-backend`
   - `globalvoice-nlp`

### 4.3 Add Environment Variables

For **globalvoice-backend**:

Click on the service → "Environment" → Add these:

```env
DATABASE_URL=your-supabase-connection-string
OPENAI_API_KEY=sk-your-openai-key
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
ELEVENLABS_API_KEY=your-elevenlabs-key (optional)
```

For **globalvoice-nlp**:

```env
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-key (optional)
```

### 4.4 Deploy

1. Click "Create Services"
2. Wait 5-10 minutes for first deployment
3. Both services will deploy automatically

**Copy your backend URL**: `https://globalvoice-backend.onrender.com`

---

## Step 5: Deploy Frontend to Netlify (Auto-Deploy) (3 minutes)

### 5.1 Connect GitHub to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Click "Deploy with GitHub"
4. Authorize Netlify (if not already)
5. Select `globalvoice-nexus` repository

### 5.2 Configure Build Settings

Netlify will detect `netlify.toml` automatically!

Just verify:
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

### 5.3 Add Environment Variables (Important!)

Click "Site settings" → "Environment variables" → "Add a variable"

Add:
```env
VITE_BACKEND_URL=https://globalvoice-backend.onrender.com
VITE_WS_URL=wss://globalvoice-backend.onrender.com
```

**Replace with your actual Render backend URL!**

### 5.4 Deploy

1. Click "Deploy site"
2. Wait 2-3 minutes
3. Your site is live! 🎉

**Your Netlify URL**: `https://[random-name].netlify.app`

### 5.5 Custom Domain (Optional)

1. Click "Domain settings"
2. Click "Add custom domain"
3. Enter your domain (e.g., `globalvoice-nexus.com`)
4. Follow DNS configuration instructions

---

## Step 6: Update Backend CORS (Important!)

1. Go to Render dashboard
2. Click `globalvoice-backend` service
3. Click "Environment"
4. Update `FRONTEND_URL` to your Netlify URL:
   ```
   FRONTEND_URL=https://your-app.netlify.app
   ```
5. Click "Save Changes"
6. Service will auto-redeploy

---

## Step 7: Configure Twilio Webhooks

1. Go to https://console.twilio.com/
2. Phone Numbers → Manage → Active numbers
3. Click your phone number
4. Under "Voice Configuration":
   ```
   A CALL COMES IN: Webhook
   URL: https://globalvoice-backend.onrender.com/api/webhooks/twilio/voice
   HTTP: POST
   ```
5. Click "Save"

---

## ✅ Verification

### Test Backend
```bash
curl https://globalvoice-backend.onrender.com/health
```
Expected: `{"status":"healthy"}`

### Test NLP Engine
```bash
curl https://globalvoice-nlp.onrender.com/health
```
Expected: `{"status":"healthy"}`

### Test Frontend
1. Open your Netlify URL
2. Click "Sign up"
3. Create account
4. Should redirect to dashboard ✅

---

## 🔄 Auto-Deploy is Now Active!

### How It Works:

**Every time you push to GitHub:**

```bash
git add .
git commit -m "Your changes"
git push
```

**Automatically:**
1. ✅ Netlify rebuilds and deploys frontend (2-3 min)
2. ✅ Render rebuilds and deploys backend (5-7 min)
3. ✅ Render rebuilds and deploys NLP engine (5-7 min)

**You'll get notifications:**
- Email from Netlify when frontend deploys
- Email from Render when backend deploys

---

## 📊 Monitoring Your Deployments

### Netlify Dashboard
- **URL**: https://app.netlify.com
- **View**: Deployment history, build logs, analytics
- **Notifications**: Email on every deploy

### Render Dashboard
- **URL**: https://dashboard.render.com
- **View**: Service logs, metrics, deployment history
- **Notifications**: Email on deploy success/failure

### Supabase Dashboard
- **URL**: https://supabase.com/dashboard
- **View**: Database tables, SQL editor, API logs

---

## 🎯 Your Live URLs

After setup, you'll have:

- **Frontend**: `https://your-app.netlify.app`
- **Backend API**: `https://globalvoice-backend.onrender.com`
- **NLP Engine**: `https://globalvoice-nlp.onrender.com`
- **Database**: Supabase (managed)

---

## 🔧 Making Changes

### To Update Code:

```bash
# Make your changes in Windsurf
# Then:

cd /Users/dduncan/CascadeProjects/windsurf-project

git add .
git commit -m "Description of changes"
git push

# Everything auto-deploys! 🎉
```

### To View Deployment Status:

- **Netlify**: Check dashboard or email
- **Render**: Check dashboard or email
- **Logs**: View in respective dashboards

---

## 🐛 Troubleshooting

### Deployment Failed

**Netlify:**
- Check build logs in dashboard
- Verify environment variables are set
- Check `netlify.toml` configuration

**Render:**
- Check service logs in dashboard
- Verify all environment variables are set
- Check `render.yaml` configuration

### Backend Can't Connect to Database

- Verify `DATABASE_URL` in Render environment variables
- Check Supabase connection string is correct
- Test connection from local machine first

### Frontend Can't Connect to Backend

- Check `VITE_BACKEND_URL` in Netlify environment variables
- Verify CORS settings in backend
- Check backend is actually running (visit health endpoint)

---

## 💰 Costs with Your Paid Accounts

### Netlify Pro
- **Cost**: $19/month (you already have this)
- **Benefits**: 
  - Unlimited builds
  - Faster build times
  - Team features
  - Custom domains

### Supabase Pro
- **Cost**: $25/month (you already have this)
- **Benefits**:
  - 8GB database
  - 100GB bandwidth
  - Daily backups
  - Better performance

### Render (Free Tier)
- **Cost**: $0/month
- **Limitations**: 
  - Services sleep after 15 min inactivity
  - 750 hours/month
- **Upgrade**: $7/month per service for always-on

**Total Current Cost**: $44/month (Netlify + Supabase)
**Optional Upgrade**: +$14/month for Render Starter (both services)

---

## 🎉 You're All Set!

Your GlobalVoice Nexus platform is now:
- ✅ Connected to GitHub
- ✅ Auto-deploying on every push
- ✅ Running on your paid Netlify and Supabase accounts
- ✅ Accessible worldwide

**Next Steps:**
1. Test the live application
2. Create your first AI agent
3. Make a test call
4. Invite team members
5. Start building!

---

## 📞 Quick Commands Reference

```bash
# Check deployment status
git status

# Make changes and deploy
git add .
git commit -m "Your message"
git push

# View logs
# Netlify: https://app.netlify.com → Your site → Deploys
# Render: https://dashboard.render.com → Your service → Logs

# Test endpoints
curl https://globalvoice-backend.onrender.com/health
curl https://globalvoice-nlp.onrender.com/health
```

**Happy deploying! 🚀**
