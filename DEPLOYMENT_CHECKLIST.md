# Vapi Sync System - Deployment Checklist

## ✅ Pre-Deployment Verification

### Backend Files Created
- [x] `backend/src/services/vapiSync.js` - Bidirectional sync service
- [x] `backend/src/routes/vapiSync.js` - Sync API endpoints
- [x] `backend/migrations/003_add_vapi_sync_columns.js` - Database migration
- [x] `backend/src/index.js` - Routes registered

### Frontend Files Created
- [x] `frontend/src/components/VapiSyncButton.jsx` - Sync button component
- [x] `frontend/src/components/VapiSyncStatus.jsx` - Status display component
- [x] `frontend/src/pages/VapiSync.jsx` - Sync management page
- [x] `frontend/src/App.jsx` - Route added
- [x] `frontend/src/layouts/DashboardLayout.jsx` - Navigation updated

### Documentation
- [x] `VAPI_SYNC_SYSTEM.md` - Complete system documentation
- [x] `deploy-vapi-sync.sh` - Deployment script
- [x] `DEPLOYMENT_CHECKLIST.md` - This file

## 🚀 Deployment Steps

### Step 1: Run Database Migration
```bash
cd /Users/dduncan/CascadeProjects/windsurf-project/backend
npm run migrate
```

**Expected Output:**
```
Batch 3 run: 1 migrations
Migration: 003_add_vapi_sync_columns.js
```

### Step 2: Deploy Backend to Fly.io
```bash
cd /Users/dduncan/CascadeProjects/windsurf-project
/Users/dduncan/.fly/bin/flyctl deploy --remote-only -a globalvoice-backend
```

**Expected Output:**
```
==> Building image
==> Pushing image to fly
==> Deploying
 ✓ [1/1] Machine ... [app] update finished: success
```

### Step 3: Verify Backend Deployment
```bash
# Test health endpoint
curl https://globalvoice-backend.fly.dev/health

# Test Vapi sync health
curl https://globalvoice-backend.fly.dev/api/vapi-sync/health
```

**Expected Output:**
```json
{"status":"healthy","vapiConfigured":true,"timestamp":"..."}
```

### Step 4: Deploy Frontend
```bash
cd /Users/dduncan/CascadeProjects/windsurf-project/frontend
npm run build
```

Then either:
- **Option A**: Push to GitHub (Netlify auto-deploys)
- **Option B**: Manual deploy via Netlify dashboard

### Step 5: Verify Frontend Deployment
1. Visit https://globalvoice-nexus.netlify.app
2. Login with admin@test.com / Admin123!
3. Check sidebar for "Vapi Sync" menu item
4. Navigate to /vapi-sync page

## 🧪 Testing Checklist

### Backend API Tests
```bash
# Get auth token first
TOKEN=$(curl -s https://globalvoice-backend.fly.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}' \
  | jq -r '.token')

# Test sync status endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://globalvoice-backend.fly.dev/api/vapi-sync/status

# Test full sync endpoint (dry run - don't execute yet)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  https://globalvoice-backend.fly.dev/api/vapi-sync/health
```

### Frontend UI Tests
- [ ] Vapi Sync page loads without errors
- [ ] Sync status displays correctly
- [ ] Sync buttons are visible and clickable
- [ ] Status indicators show current state
- [ ] Navigation menu includes "Vapi Sync" item

### Integration Tests
- [ ] Click "Full Synchronization" button
- [ ] Verify phone numbers 682-626-9224 and 972-474-1424 appear
- [ ] Check Phone Numbers page shows imported numbers
- [ ] Check Agents page shows imported assistants
- [ ] Verify sync status shows "In Sync"

## 📊 Post-Deployment Verification

### 1. Check Sync Status
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://globalvoice-backend.fly.dev/api/vapi-sync/status
```

**Expected Response:**
```json
{
  "phoneNumbers": {
    "database": 1,
    "vapi": 2,
    "inSync": false
  },
  "agents": {
    "database": 2,
    "vapi": 2,
    "inSync": true
  },
  "overallSync": false
}
```

### 2. Run Full Sync
Via UI:
1. Go to https://globalvoice-nexus.netlify.app/vapi-sync
2. Click "Full Synchronization"
3. Wait for completion
4. Review results

Via API:
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  https://globalvoice-backend.fly.dev/api/vapi-sync/full
```

### 3. Verify Data Import
Check Phone Numbers:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://globalvoice-backend.fly.dev/api/phone-numbers
```

Should now include:
- 682-626-9224
- 972-474-1424

Check Agents:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://globalvoice-backend.fly.dev/api/agents
```

Should include all Vapi assistants.

### 4. Test Agent Creation (Auto-Sync)
1. Create new agent in UI
2. Check backend logs for "Agent synced to Vapi"
3. Verify agent appears in Vapi dashboard
4. Confirm vapi_assistant_id is set in database

## 🔍 Troubleshooting

### Sync Not Working

**Check Vapi API Keys:**
```bash
/Users/dduncan/.fly/bin/flyctl secrets list -a globalvoice-backend | grep VAPI
```

Should show:
- VAPI_PRIVATE_KEY
- VAPI_PUBLIC_KEY

**Check Backend Logs:**
```bash
/Users/dduncan/.fly/bin/flyctl logs -a globalvoice-backend
```

Look for:
- "Phone number sync from Vapi completed"
- "Assistant sync from Vapi completed"
- Any error messages

### Database Migration Issues

**Check migration status:**
```bash
cd backend
npm run migrate:status
```

**Rollback if needed:**
```bash
npm run migrate:rollback
npm run migrate
```

### Frontend Build Issues

**Clear cache and rebuild:**
```bash
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

## 📝 Success Criteria

- [x] All files created and committed
- [ ] Database migration completed successfully
- [ ] Backend deployed to Fly.io
- [ ] Frontend deployed to Netlify
- [ ] Vapi Sync page accessible
- [ ] Sync status displays correctly
- [ ] Full sync completes without errors
- [ ] Phone numbers 682-626-9224 and 972-474-1424 visible in app
- [ ] Agents from Vapi imported successfully
- [ ] New agents auto-sync to Vapi

## 🎉 Completion

Once all items are checked:
1. ✅ System is fully operational
2. ✅ Vapi data is synchronized
3. ✅ User can manage all resources through application
4. ✅ Bidirectional sync is working

## 📞 Support

If issues arise:
1. Check `VAPI_SYNC_SYSTEM.md` for detailed documentation
2. Review backend logs for errors
3. Test API endpoints directly
4. Verify Vapi API keys are set
5. Check database migration status

## 🚀 Next Steps After Deployment

1. **Test Call Flow**
   - Call 682-626-9224
   - Verify call is logged
   - Check transcript capture

2. **Monitor Sync Status**
   - Check sync status regularly
   - Run full sync after Vapi changes
   - Review sync logs

3. **User Training**
   - Show user Vapi Sync page
   - Explain when to use each sync option
   - Demonstrate sync status monitoring

4. **Ongoing Maintenance**
   - Schedule periodic full syncs
   - Monitor for sync errors
   - Keep documentation updated
