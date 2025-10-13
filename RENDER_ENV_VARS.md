# 🔑 Render Environment Variables - Copy & Paste

## Blueprint ID: exs-d3mogfh5pdvs73belg6g

---

## 📋 For Service: `globalvoice-backend`

Copy and paste these **exactly** into Render:

### DATABASE_URL
```
postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres
```

### JWT_SECRET
```
globalvoice-jwt-secret-xdun1698-production-key
```

### ENCRYPTION_KEY
```
globalvoice-encryption-xdun1698-prod-key
```

### FRONTEND_URL
```
https://globalvoice-nexus.netlify.app
```

### NLP_ENGINE_URL
```
https://globalvoice-nlp.onrender.com
```

### OPENAI_API_KEY (Add your real key)
```
sk-proj-your-actual-openai-key-here
```

### REDIS_URL (Optional - can skip for now)
```
redis://localhost:6379
```

---

## 📋 For Service: `globalvoice-nlp`

### OPENAI_API_KEY (Add your real key)
```
sk-proj-your-actual-openai-key-here
```

---

## 🚀 How to Add These in Render

### In the Blueprint Setup Screen:

1. You should see two services listed:
   - `globalvoice-backend`
   - `globalvoice-nlp`

2. For each service, click **"Add Environment Variable"**

3. Copy-paste the **Key** and **Value** from above

4. After adding all variables, click **"Apply"** at the bottom

---

## ⚠️ Important Notes

### OpenAI API Key
- **Required** for AI features to work
- Get it from: https://platform.openai.com/api-keys
- Format: `sk-proj-...` (starts with sk-proj or sk-)
- Cost: ~$0.02 per call

### If You Don't Have OpenAI Key Yet
- You can deploy without it
- App will work but AI features will fail
- Add it later in Render dashboard → Service → Environment

### Redis (Optional)
- Not required for initial deployment
- Used for caching and sessions
- Can add later if needed

---

## ✅ After Adding Variables

1. Click **"Apply"** button
2. Render will start building both services
3. Wait 5-10 minutes for deployment
4. You'll get email notifications when done

---

## 📊 Expected Deployment Time

- **Backend**: ~5-7 minutes
- **NLP Engine**: ~5-7 minutes
- **Total**: ~10 minutes

---

## 🔗 Your Service URLs (After Deployment)

- Backend: `https://globalvoice-backend.onrender.com`
- NLP: `https://globalvoice-nlp.onrender.com`

---

## 🎯 Next Steps After Deployment

1. ✅ Wait for both services to deploy
2. ✅ Test backend: `curl https://globalvoice-backend.onrender.com/health`
3. ✅ Update Netlify with backend URL (see below)
4. ✅ Test creating account on your app

---

## 🔄 Update Netlify After Backend Deploys

1. Go to https://app.netlify.com
2. Click your site → **Site settings** → **Environment variables**
3. Add these:

```
VITE_BACKEND_URL = https://globalvoice-backend.onrender.com
VITE_WS_URL = wss://globalvoice-backend.onrender.com
```

4. Go to **Deploys** → **Trigger deploy**
5. Wait 2-3 minutes

---

## 🎉 Then You're Live!

Visit: https://globalvoice-nexus.netlify.app

- Create account
- Build AI agents
- Start making calls!

---

**Copy the environment variables above and paste them into Render now!** 🚀
