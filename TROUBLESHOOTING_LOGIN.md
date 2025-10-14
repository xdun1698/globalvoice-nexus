# 🔧 Login Troubleshooting Guide

## ⚠️ Current Issue

**Problem**: Login is failing because the backend is not deployed on Render.

**Status**: Backend deployment is stuck in "created" state and not building.

---

## 🎯 Immediate Solution: Run Backend Locally

Since Render deployment is having issues, let's run the backend locally and test the app:

### Step 1: Start Backend Locally

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project/backend
npm start
```

**Expected output**:
```
✅ Database initialized
⚠️  Redis initialization failed - continuing without cache
✅ WebSocket initialized
🚀 GlobalVoice Nexus Backend running on port 3001
```

### Step 2: Update Frontend to Use Local Backend

Create a `.env.local` file in the frontend directory:

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project/frontend
cat > .env.local << 'EOF'
VITE_BACKEND_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
EOF
```

### Step 3: Start Frontend Locally

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project/frontend
npm run dev
```

### Step 4: Test Login

1. Open http://localhost:5173/login
2. Login with test user:
   - Email: `test@globalvoice.com`
   - Password: `TestPass123!`

---

## 🔍 Debugging Browser Errors

### The Errors You're Seeing

**These are NOT your app's errors**:
```
background.js:1 Uncaught (in promise)
Unchecked runtime.lastError: Could not establish connection
extensionState.js:1 Failed to load resource: net::ERR_FILE_NOT_FOUND
```

**These are from browser extensions** (password managers, ad blockers, etc.) and can be safely ignored.

### Real Errors to Look For

Open Developer Tools (F12) → **Network** tab:

1. Try to login
2. Look for a request to `/api/auth/login`
3. Check the status:
   - **Failed to fetch**: Backend not running
   - **404**: Wrong URL
   - **401**: Wrong credentials
   - **500**: Backend error

---

## 🚀 Alternative: Fix Render Deployment

If you want to fix the Render deployment instead:

### Check Render Dashboard

1. Go to https://dashboard.render.com
2. Click `globalvoice-backend` service
3. Check the **Logs** tab
4. Look for build errors

### Common Render Issues

**Issue**: Deployment stuck in "created" state
- **Solution**: Manually trigger deploy in Render dashboard

**Issue**: Build fails
- **Solution**: Check logs for specific error

**Issue**: Service starts but crashes
- **Solution**: Check runtime logs for errors

---

## ✅ Verification Steps

### 1. Check Backend is Running

```bash
# Local
curl http://localhost:3001/health

# Render (when deployed)
curl https://globalvoice-backend.onrender.com/health
```

**Expected response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T02:50:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

### 2. Test Login API Directly

```bash
# Local
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@globalvoice.com","password":"TestPass123!"}'

# Render (when deployed)
curl -X POST https://globalvoice-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@globalvoice.com","password":"TestPass123!"}'
```

**Expected response**:
```json
{
  "user": {
    "id": "a03d57a6-e545-4ad0-a139-c24edb6ffc0d",
    "name": "Test User",
    "email": "test@globalvoice.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Check Frontend Environment

In browser console:
```javascript
console.log(import.meta.env.VITE_BACKEND_URL)
```

Should show:
- Local: `http://localhost:3001`
- Production: `https://globalvoice-backend.onrender.com`

---

## 🐛 Common Login Errors

### Error: "Network Error"

**Cause**: Backend not accessible

**Solutions**:
1. Check backend is running
2. Check CORS settings
3. Check firewall/network

### Error: "Invalid credentials"

**Cause**: Wrong email or password

**Solutions**:
1. Use exact credentials: `test@globalvoice.com` / `TestPass123!`
2. Check database has test user
3. Verify password hashing

### Error: "Failed to fetch"

**Cause**: Frontend can't reach backend

**Solutions**:
1. Check `VITE_BACKEND_URL` is set
2. Verify backend URL is correct
3. Check backend is running

### Error: 401 Unauthorized

**Cause**: Authentication failed

**Solutions**:
1. Check credentials are correct
2. Verify user exists in database
3. Check JWT_SECRET is set

### Error: 500 Internal Server Error

**Cause**: Backend crashed

**Solutions**:
1. Check backend logs
2. Verify database connection
3. Check all environment variables

---

## 📋 Environment Variables Checklist

### Backend (.env)
```env
✅ DATABASE_URL=postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres
✅ JWT_SECRET=globalvoice-jwt-secret-xdun1698-production-key
✅ ENCRYPTION_KEY=globalvoice-encryption-xdun1698-prod-key
✅ NODE_ENV=development
✅ PORT=3001
✅ FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
✅ VITE_BACKEND_URL=http://localhost:3001
✅ VITE_WS_URL=ws://localhost:3001
```

---

## 🎯 Quick Test Script

Run this to test everything:

```bash
#!/bin/bash

echo "🧪 Testing GlobalVoice Nexus..."

# Test database
echo "1. Testing database..."
cd backend
node create-test-user.js
if [ $? -eq 0 ]; then
  echo "✅ Database working"
else
  echo "❌ Database failed"
fi

# Test backend
echo "2. Testing backend..."
curl -s http://localhost:3001/health > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Backend running"
else
  echo "❌ Backend not running - start with: cd backend && npm start"
fi

# Test login
echo "3. Testing login..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@globalvoice.com","password":"TestPass123!"}')

if echo "$RESPONSE" | grep -q "token"; then
  echo "✅ Login working"
else
  echo "❌ Login failed"
  echo "Response: $RESPONSE"
fi

echo ""
echo "🎉 Test complete!"
```

---

## 💡 Recommended Approach

**For immediate testing**:
1. Run backend locally (`cd backend && npm start`)
2. Run frontend locally (`cd frontend && npm run dev`)
3. Test at http://localhost:5173

**For production deployment**:
1. Fix Render deployment issues
2. Update Netlify environment variables
3. Test at https://globalvoice-nexus.netlify.app

---

## 📞 Next Steps

### If Local Works
- ✅ Your code is correct
- ✅ Database connection works
- ✅ Authentication works
- ⚠️  Just need to fix Render deployment

### If Local Fails
- Check backend logs for errors
- Verify database connection string
- Check all dependencies are installed

---

**Current Status**: Backend deployment stuck on Render. Run locally to test immediately.

**Test User**: `test@globalvoice.com` / `TestPass123!`
