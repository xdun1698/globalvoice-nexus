# 🗄️ Install PostgreSQL & Redis - Step by Step

## Why You Need These

- **PostgreSQL**: Stores users, agents, calls, contacts, analytics
- **Redis**: Caches data for fast performance

## 🚀 Quick Install (macOS)

### Method 1: Homebrew (Recommended - 5 minutes)

```bash
# Step 1: Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Step 2: Install PostgreSQL and Redis
brew install postgresql@15 redis

# Step 3: Start services
brew services start postgresql@15
brew services start redis

# Step 4: Create database
createdb globalvoice

# Step 5: Verify installation
pg_isready
redis-cli ping

# Step 6: Update .env (if needed)
# DATABASE_URL is already set correctly in .env
# REDIS_URL is already set correctly in .env

# Step 7: Restart backend
cd /Users/dduncan/CascadeProjects/windsurf-project/backend
npm run dev
```

**Done!** Your backend should now start successfully.

### Method 2: Docker (Alternative - 2 minutes)

If you have Docker Desktop installed:

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project

# Start just PostgreSQL and Redis
docker-compose up -d postgres redis

# Verify they're running
docker-compose ps

# Backend will connect automatically
cd backend
npm run dev
```

## ✅ Verify Installation

### Check PostgreSQL
```bash
# Should return "accepting connections"
pg_isready

# Connect to database
psql globalvoice

# Inside psql, type:
\l    # List databases
\q    # Quit
```

### Check Redis
```bash
# Should return "PONG"
redis-cli ping

# Test set/get
redis-cli set test "hello"
redis-cli get test
```

### Check Backend Connection
```bash
# Should return health status
curl http://localhost:3001/health
```

## 🔧 Troubleshooting

### PostgreSQL Issues

**"command not found: pg_isready"**
```bash
# Add PostgreSQL to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**"connection refused"**
```bash
# Start PostgreSQL
brew services start postgresql@15

# Check if running
brew services list
```

**"database does not exist"**
```bash
# Create the database
createdb globalvoice

# Or with specific user
createdb -U postgres globalvoice
```

### Redis Issues

**"connection refused"**
```bash
# Start Redis
brew services start redis

# Check if running
brew services list
```

**"command not found: redis-cli"**
```bash
# Add Redis to PATH
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Backend Still Won't Start

**Check the logs:**
```bash
cd /Users/dduncan/CascadeProjects/windsurf-project
tail -f logs/backend.log
```

**Common errors:**

1. **"connect ECONNREFUSED 127.0.0.1:5432"**
   - PostgreSQL is not running
   - Run: `brew services start postgresql@15`

2. **"connect ECONNREFUSED 127.0.0.1:6379"**
   - Redis is not running
   - Run: `brew services start redis`

3. **"database 'globalvoice' does not exist"**
   - Create database: `createdb globalvoice`

## 🎯 After Installation

Once PostgreSQL and Redis are running:

### 1. Run Database Migrations
```bash
cd /Users/dduncan/CascadeProjects/windsurf-project/backend
npm run migrate
```

This creates all necessary tables (users, agents, calls, etc.)

### 2. Restart Backend
```bash
npm run dev
```

### 3. Verify Backend is Running
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-10T...",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### 4. Open Frontend
```bash
open http://localhost:3000
```

### 5. Create Your First Account
1. Click "Sign up"
2. Enter name, email, password
3. Click "Create Account"
4. Start building agents!

## 📊 Service Management

### Start Services
```bash
brew services start postgresql@15
brew services start redis
```

### Stop Services
```bash
brew services stop postgresql@15
brew services stop redis
```

### Restart Services
```bash
brew services restart postgresql@15
brew services restart redis
```

### Check Status
```bash
brew services list
```

## 🔒 Security Notes

### Default Credentials
- **PostgreSQL**: No password by default (local only)
- **Redis**: No password by default (local only)

### For Production
Update `.env` with secure credentials:
```env
DATABASE_URL=postgresql://username:password@host:5432/globalvoice
REDIS_URL=redis://:password@host:6379
```

## 💾 Database Backup

### Backup PostgreSQL
```bash
pg_dump globalvoice > backup.sql
```

### Restore PostgreSQL
```bash
psql globalvoice < backup.sql
```

### Backup Redis
```bash
redis-cli SAVE
# Backup file: /opt/homebrew/var/db/redis/dump.rdb
```

## 🗑️ Uninstall (if needed)

```bash
# Stop services
brew services stop postgresql@15
brew services stop redis

# Uninstall
brew uninstall postgresql@15 redis

# Remove data (optional)
rm -rf /opt/homebrew/var/postgres
rm -rf /opt/homebrew/var/db/redis
```

## 🐳 Docker Alternative (Complete Setup)

If you prefer Docker for everything:

```bash
cd /Users/dduncan/CascadeProjects/windsurf-project

# Install Docker Desktop from:
# https://www.docker.com/products/docker-desktop/

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## ✅ Final Checklist

- [ ] PostgreSQL installed and running
- [ ] Redis installed and running
- [ ] Database `globalvoice` created
- [ ] Migrations run successfully
- [ ] Backend starts without errors
- [ ] Backend health check passes
- [ ] Frontend accessible at http://localhost:3000
- [ ] Can create user account

## 🎉 Success!

Once all checkboxes are complete, you have a fully functional GlobalVoice Nexus platform!

**Next Steps:**
1. Add your OpenAI API key to `.env`
2. Create your first AI agent
3. Test the platform
4. Add Twilio for phone calls (optional)

---

**Need help?** Check SETUP_GUIDE.md or STATUS.md
