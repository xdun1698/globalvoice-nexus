# ElevenLabs Deployment Checklist

## Quick Deployment Steps

### 1. Get ElevenLabs API Key (5 minutes)
```bash
# Go to https://elevenlabs.io
# Sign up for free account (10,000 chars/month)
# Navigate to: Profile → API Keys
# Create new key and copy it
```

### 2. Deploy Backend with ElevenLabs (5 minutes)
```bash
# Set the API key in Fly.io
flyctl secrets set ELEVENLABS_API_KEY="your_api_key_here" -a globalvoice-backend

# Deploy updated backend
cd /Users/dduncan/CascadeProjects/windsurf-project/backend
flyctl deploy --remote-only -a globalvoice-backend

# Wait for deployment (2-3 minutes)
# Check logs to confirm ElevenLabs is enabled
flyctl logs -a globalvoice-backend
```

### 3. Verify Integration
```bash
# Check health endpoint
curl https://globalvoice-backend.fly.dev/health

# Check logs for "Voice engine: ElevenLabs"
flyctl logs -a globalvoice-backend | grep "Voice engine"
```

### 4. Test with Agent
1. Go to https://globalvoice-nexus.netlify.app
2. Login with admin@test.com / Admin123!
3. Edit existing agent or create new one
4. Add field: `elevenlabs_voice: "rachel"` (or any voice from list)
5. Save agent
6. Call the agent's phone number
7. Listen for improved voice quality

## Files Changed
- ✅ `backend/package.json` - Added elevenlabs-node dependency
- ✅ `backend/src/services/elevenlabs.js` - NEW: ElevenLabs service
- ✅ `backend/src/services/telephony.js` - Updated to use ElevenLabs
- ✅ `backend/src/routes/agents.js` - Added voice listing endpoint
- ✅ `ELEVENLABS_INTEGRATION.md` - Complete documentation

## Environment Variables

### Required
```bash
ELEVENLABS_API_KEY=your_api_key_here
```

### Optional (already set)
```bash
TWILIO_ACCOUNT_SID=ACxxxx...
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
OPENAI_API_KEY=sk-...
```

## Testing Checklist

- [ ] Backend deployed successfully
- [ ] Logs show "Voice engine: ElevenLabs"
- [ ] Agent has `elevenlabs_voice` field set
- [ ] Call sounds natural (not metallic)
- [ ] Fallback to Polly works if ElevenLabs fails
- [ ] Usage tracking works: `GET /api/agents/voices/elevenlabs`

## Rollback Plan

If issues occur:
```bash
# Remove API key to fall back to Polly
flyctl secrets unset ELEVENLABS_API_KEY -a globalvoice-backend

# Or deploy previous version
cd backend
git checkout HEAD~1
flyctl deploy --remote-only -a globalvoice-backend
```

## Cost Monitoring

### Free Tier Limits
- 10,000 characters/month
- ~20-30 test calls
- Perfect for POC/testing

### Upgrade When
- Exceeding 10k chars/month
- Need more than 30 calls/month
- Ready for production

### Check Usage
```bash
curl https://globalvoice-backend.fly.dev/api/agents/voices/elevenlabs
```

## Next Steps After Deployment

1. **Test Voice Quality**
   - Call agent and verify natural sound
   - Compare to old Polly voice
   - Test different voices (rachel, antoni, etc.)

2. **Update Frontend** (Optional)
   - Add voice selector dropdown in Agent Builder
   - Show voice preview samples
   - Display usage statistics

3. **Monitor Usage**
   - Check daily for first week
   - Set up alerts at 80% of limit
   - Plan upgrade if needed

4. **Optimize Settings**
   - Adjust stability/similarity in `elevenlabs.js`
   - Test different voices for different agent types
   - Fine-tune for your use case

## Support

- **Integration Guide**: `ELEVENLABS_INTEGRATION.md`
- **ElevenLabs Docs**: https://docs.elevenlabs.io
- **Voice Samples**: https://elevenlabs.io/voice-library

---

**Ready to Deploy**: ✅ All code changes complete
**Estimated Time**: 10-15 minutes total
**Risk Level**: Low (automatic fallback to Polly)
