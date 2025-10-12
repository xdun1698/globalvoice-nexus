# 🔗 Connect Windsurf to GitHub - Quick Guide

## What You Need to Do

Since you have **paid accounts** with Netlify and Supabase linked to your GitHub and Gmail, here's the simple 3-step process:

---

## ⚡ Quick Start (10 minutes)

### Step 1: Push Code to GitHub (2 minutes)

**Option A: Use the automated script**
```bash
cd /Users/dduncan/CascadeProjects/windsurf-project
./setup-github.sh
```

The script will:
1. Guide you to create a GitHub repository
2. Ask for your GitHub username
3. Push all code automatically

**Option B: Manual setup**
```bash
# 1. Create repository on GitHub
# Go to: https://github.com/new
# Name: globalvoice-nexus
# Click "Create repository"

# 2. Push code
cd /Users/dduncan/CascadeProjects/windsurf-project
git remote add origin https://github.com/YOUR_USERNAME/globalvoice-nexus.git
git push -u origin main
```

---

### Step 2: Connect to Netlify (3 minutes)

1. Go to https://app.netlify.com (you're already logged in)
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Select **`globalvoice-nexus`** repository
5. Netlify auto-detects settings from `netlify.toml`! ✅
6. Click **"Deploy site"**

**That's it!** Your frontend auto-deploys on every push! 🎉

---

### Step 3: Setup Supabase + Render (5 minutes)

**Supabase (Database):**
1. Go to https://supabase.com/dashboard (you're already logged in)
2. Click **"New project"**
3. Name: `globalvoice-nexus`
4. Generate strong password (save it!)
5. Click **"Create new project"**
6. Copy connection string from Settings → Database

**Render (Backend):**
1. Go to https://dashboard.render.com
2. Sign up with GitHub (one-time)
3. Click **"New +"** → **"Blueprint"**
4. Select **`globalvoice-nexus`** repository
5. Render auto-detects `render.yaml`! ✅
6. Add environment variables (see below)
7. Click **"Apply"**

---

## 🔑 Environment Variables to Add

### In Render (Backend Service):

```env
DATABASE_URL=your-supabase-connection-string
OPENAI_API_KEY=sk-your-openai-key
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### In Netlify (Frontend):

```env
VITE_BACKEND_URL=https://globalvoice-backend.onrender.com
VITE_WS_URL=wss://globalvoice-backend.onrender.com
```

*(Replace with your actual Render backend URL after it deploys)*

---

## ✅ What Happens After Setup

### Auto-Deploy is Active! 🚀

Every time you make changes in Windsurf:

```bash
# 1. Make your changes in Windsurf
# 2. Commit and push:
git add .
git commit -m "Your changes"
git push

# 3. Automatically:
# ✅ Netlify rebuilds frontend (2-3 min)
# ✅ Render rebuilds backend (5-7 min)
# ✅ You get email notifications
```

---

## 🎯 Your Live URLs

After setup, you'll have:

- **Frontend**: `https://[your-site].netlify.app`
- **Backend**: `https://globalvoice-backend.onrender.com`
- **NLP Engine**: `https://globalvoice-nlp.onrender.com`
- **Database**: Managed by Supabase

---

## 💡 Why This Setup is Perfect for You

### ✅ Advantages:

1. **You already have paid accounts** - No new subscriptions
2. **Auto-deploy on push** - No manual deployment
3. **GitHub integration** - Everything connected
4. **Professional setup** - Production-ready
5. **Cost-effective** - Using accounts you already pay for

### 💰 Current Costs:

- **Netlify Pro**: $19/month (you already have)
- **Supabase Pro**: $25/month (you already have)
- **Render**: $0/month (free tier, upgrade $7/month per service)

**Total**: $44/month (what you're already paying!)

---

## 📋 Checklist

- [ ] Run `./setup-github.sh` or push to GitHub manually
- [ ] Connect Netlify to GitHub repository
- [ ] Create Supabase project and get connection string
- [ ] Connect Render to GitHub repository
- [ ] Add environment variables to Render
- [ ] Add environment variables to Netlify
- [ ] Test the live application
- [ ] Configure Twilio webhooks (optional)

---

## 🐛 Troubleshooting

### "Permission denied" when pushing to GitHub

You need to authenticate with GitHub:

```bash
# Option 1: Use GitHub CLI
gh auth login

# Option 2: Use Personal Access Token
# Go to: https://github.com/settings/tokens
# Generate new token with 'repo' scope
# Use token as password when pushing
```

### Can't find repository in Netlify/Render

Make sure:
1. Repository is created on GitHub
2. Code is pushed to GitHub
3. You've authorized Netlify/Render to access your GitHub account

### Netlify build fails

Check:
1. `netlify.toml` is in repository root
2. `frontend/package.json` exists
3. Build logs in Netlify dashboard

---

## 📚 Full Documentation

For detailed step-by-step instructions with screenshots:
- **AUTO_DEPLOY_GUIDE.md** - Complete deployment guide
- **DEPLOY_NETLIFY_SUPABASE.md** - Netlify + Supabase specific guide

---

## 🎉 Ready to Deploy?

```bash
# Run this now:
./setup-github.sh
```

Then follow the prompts! The script will guide you through everything.

**Questions?** Check AUTO_DEPLOY_GUIDE.md for detailed instructions.

---

**Let's get your app live! 🚀**
