# Vapi Bidirectional Sync System

## Overview

Complete bidirectional synchronization system between Vapi.ai and the GlobalVoice Nexus application database. This system ensures data consistency and allows seamless management of phone numbers and agents/assistants across both platforms.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Vapi.ai API   │ ←──────→│  Sync Service    │ ←──────→│  Database   │
│  (Source of     │          │  (Bidirectional) │          │  (App Data) │
│   Truth)        │          └──────────────────┘          └─────────────┘
└─────────────────┘                    ↑
                                       │
                              ┌────────┴────────┐
                              │  Frontend UI    │
                              │  (Sync Controls)│
                              └─────────────────┘
```

## Features

### ✅ Bidirectional Sync
- **Import from Vapi**: Pull phone numbers and assistants into application
- **Export to Vapi**: Push application data to Vapi
- **Full Sync**: Complete synchronization in both directions

### ✅ Automatic Sync
- Agents automatically sync to Vapi on create/update
- Real-time updates when changes are made in application
- Maintains `vapi_assistant_id` for tracking

### ✅ Manual Sync Controls
- Dedicated Vapi Sync page in application
- Individual sync buttons for each direction
- Real-time sync status monitoring
- Error handling and reporting

### ✅ Sync Status Monitoring
- Visual indicators for sync state
- Count comparison (Database vs Vapi)
- Auto-refresh capability
- Detailed sync results

## Files Created

### Backend

1. **`backend/src/services/vapiSync.js`** - Core sync service
   - `syncPhoneNumbersFromVapi()` - Import phone numbers
   - `syncPhoneNumbersToVapi()` - Export phone numbers
   - `syncAssistantsFromVapi()` - Import assistants
   - `syncAgentsToVapi()` - Export agents
   - `performFullSync()` - Complete bidirectional sync
   - `getSyncStatus()` - Check sync state

2. **`backend/src/routes/vapiSync.js`** - API endpoints
   - `GET /api/vapi-sync/status` - Get sync status
   - `POST /api/vapi-sync/phone-numbers/from-vapi` - Import phone numbers
   - `POST /api/vapi-sync/phone-numbers/to-vapi` - Export phone numbers
   - `POST /api/vapi-sync/assistants/from-vapi` - Import assistants
   - `POST /api/vapi-sync/agents/to-vapi` - Export agents
   - `POST /api/vapi-sync/full` - Full sync
   - `GET /api/vapi-sync/health` - Health check

3. **`backend/migrations/003_add_vapi_sync_columns.js`** - Database migration
   - Adds `vapi_phone_id` to `phone_numbers` table
   - Adds `vapi_assistant_id` to `phone_numbers` table
   - Ensures `vapi_assistant_id` exists in `agents` table

### Frontend

1. **`frontend/src/components/VapiSyncButton.jsx`** - Sync action button
   - Configurable sync types
   - Loading states
   - Success/error feedback
   - Result display

2. **`frontend/src/components/VapiSyncStatus.jsx`** - Sync status display
   - Real-time status monitoring
   - Visual sync indicators
   - Count comparisons
   - Auto-refresh option

3. **`frontend/src/pages/VapiSync.jsx`** - Dedicated sync page
   - Full sync controls
   - Import/export sections
   - Status monitoring
   - Best practices guide

## Usage

### Initial Setup (First Time)

1. **Run Database Migration**
   ```bash
   cd backend
   npm run migrate
   ```

2. **Deploy Backend**
   ```bash
   cd /Users/dduncan/CascadeProjects/windsurf-project
   /Users/dduncan/.fly/bin/flyctl deploy --remote-only -a globalvoice-backend
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   npm run build
   # Deploy to Netlify
   ```

### Syncing Existing Vapi Data

If you already have phone numbers and assistants in Vapi:

1. **Login to Application**
   - Go to https://globalvoice-nexus.netlify.app
   - Login with your credentials

2. **Navigate to Vapi Sync Page**
   - Click "Vapi Sync" in sidebar
   - Or go to `/vapi-sync`

3. **Run Full Sync**
   - Click "Full Synchronization" button
   - Wait for sync to complete
   - Review results

4. **Verify Data**
   - Check Phone Numbers page
   - Check Agents page
   - Confirm all Vapi data is now visible

### API Usage

#### Get Sync Status
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://globalvoice-backend.fly.dev/api/vapi-sync/status
```

#### Import Phone Numbers from Vapi
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://globalvoice-backend.fly.dev/api/vapi-sync/phone-numbers/from-vapi
```

#### Import Assistants from Vapi
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://globalvoice-backend.fly.dev/api/vapi-sync/assistants/from-vapi
```

#### Full Sync
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://globalvoice-backend.fly.dev/api/vapi-sync/full
```

## Sync Behavior

### Phone Numbers

**Import from Vapi:**
- Fetches all phone numbers from Vapi
- Creates new records in database if not exists
- Updates existing records with Vapi IDs
- Links phone numbers to assistants

**Export to Vapi:**
- Verifies database phone numbers exist in Vapi
- Updates database with Vapi IDs if missing
- Logs warnings for numbers in DB but not in Vapi

### Agents/Assistants

**Import from Vapi:**
- Fetches all assistants from Vapi
- Creates new agents in database if not exists
- Updates existing agents with Vapi data
- Preserves `vapi_assistant_id` for tracking

**Export to Vapi:**
- Syncs all database agents to Vapi
- Creates assistants in Vapi if missing
- Updates `vapi_assistant_id` in database
- Verifies existing assistants

### Automatic Sync

Agents automatically sync to Vapi when:
- Creating a new agent
- Updating an existing agent
- Agent data is modified

This happens in `backend/src/routes/agents.js`:
```javascript
// Sync to Vapi
try {
  const vapiAssistant = await vapiService.syncAssistant(agent);
  await db('agents')
    .where({ id: agent.id })
    .update({ vapi_assistant_id: vapiAssistant.id });
} catch (error) {
  logger.warn('Failed to sync agent to Vapi:', error.message);
}
```

## Database Schema

### phone_numbers Table
```sql
ALTER TABLE phone_numbers ADD COLUMN vapi_phone_id VARCHAR(255);
ALTER TABLE phone_numbers ADD COLUMN vapi_assistant_id VARCHAR(255);
CREATE INDEX idx_phone_numbers_vapi_phone_id ON phone_numbers(vapi_phone_id);
```

### agents Table
```sql
-- Already exists from previous migrations
ALTER TABLE agents ADD COLUMN vapi_assistant_id VARCHAR(255);
CREATE INDEX idx_agents_vapi_assistant_id ON agents(vapi_assistant_id);
```

## Error Handling

### Sync Errors
- Individual item errors don't stop the entire sync
- Errors are collected and reported in results
- Sync continues for remaining items
- Detailed error messages provided

### Graceful Degradation
- Missing Vapi API keys: Sync disabled, clear error message
- Network errors: Retry logic, timeout handling
- Invalid data: Validation, skip problematic items
- Database errors: Transaction rollback, data integrity maintained

## Monitoring

### Sync Status
- **In Sync**: Database and Vapi counts match
- **Out of Sync**: Counts differ, sync recommended
- **Timestamp**: Last sync check time
- **Counts**: Exact numbers for comparison

### Logs
All sync operations are logged:
```javascript
logger.info('Phone number sync from Vapi completed:', syncResults);
logger.info('Assistant sync from Vapi completed:', syncResults);
logger.error('Error syncing phone number:', error);
```

## Best Practices

1. **Initial Setup**
   - Run full sync after first deployment
   - Verify all Vapi data is imported

2. **Regular Maintenance**
   - Check sync status regularly
   - Run full sync after making changes in Vapi dashboard
   - Monitor sync logs for errors

3. **Data Management**
   - Create agents in application (auto-syncs to Vapi)
   - Import phone numbers from Vapi when added there
   - Use full sync if unsure about sync state

4. **Troubleshooting**
   - Check Vapi API keys are set
   - Verify network connectivity
   - Review error messages in sync results
   - Check backend logs for detailed errors

## Troubleshooting

### Sync Not Working

1. **Check Vapi API Keys**
   ```bash
   /Users/dduncan/.fly/bin/flyctl secrets list -a globalvoice-backend | grep VAPI
   ```

2. **Check Backend Logs**
   ```bash
   /Users/dduncan/.fly/bin/flyctl logs -a globalvoice-backend
   ```

3. **Test Vapi Connection**
   ```bash
   curl -H "Authorization: Bearer YOUR_VAPI_KEY" \
     https://api.vapi.ai/phone-number
   ```

### Data Mismatch

1. **Check Sync Status**
   - Go to Vapi Sync page
   - Review counts and status

2. **Run Full Sync**
   - Click "Full Synchronization"
   - Review results for errors

3. **Manual Verification**
   - Compare Vapi dashboard with application
   - Check for duplicate entries
   - Verify IDs match

### Performance Issues

1. **Large Data Sets**
   - Sync may take longer with many items
   - Monitor progress in logs
   - Consider syncing in batches

2. **Rate Limiting**
   - Vapi API has rate limits
   - Sync service handles this gracefully
   - Retry failed items

## Future Enhancements

- [ ] Scheduled automatic sync (cron job)
- [ ] Webhook-based real-time sync
- [ ] Conflict resolution strategies
- [ ] Sync history and audit log
- [ ] Batch sync for large datasets
- [ ] Selective sync (specific items)
- [ ] Sync preview (dry run mode)
- [ ] Rollback capability

## Support

For issues or questions:
1. Check this documentation
2. Review backend logs
3. Test API endpoints directly
4. Verify Vapi dashboard data
5. Check database records

## Summary

The Vapi Bidirectional Sync System provides:
- ✅ Complete data synchronization
- ✅ User-friendly interface
- ✅ Automatic and manual sync options
- ✅ Real-time status monitoring
- ✅ Robust error handling
- ✅ Production-ready implementation

**Your Vapi phone numbers (682-626-9224 and 972-474-1424) can now be imported into the application with a single click!**
