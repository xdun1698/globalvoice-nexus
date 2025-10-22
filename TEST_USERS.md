# Test Users Documentation

## Overview
This document lists all test users available for the GlobalVoice Nexus platform for testing, demos, and sales purposes.

---

## 👤 Admin User

### **Admin Test Account**
- **Email:** `admin@test.com`
- **Password:** `Admin123!`
- **Name:** Admin
- **Type:** Administrator
- **Purpose:** Full platform access for testing all features
- **Phone:** +1 (817) 541-7385 (assigned to Customer Support Agent)

**Capabilities:**
- Full access to all features
- Can create/edit/delete agents
- Can manage phone numbers
- Can view all analytics
- Can manage integrations

---

## 🎯 MVP User

### **2. Courtney (MVP)**
- **Email:** courtney@mvp.com
- **Password:** mvptexas321!
- **Purpose:** Premium demos & MVP trials
- **Access:** Full premium features
- **Created:** October 21, 2025
- **Updated:** October 21, 2025
- **Pre-configured Agents:** 2 agents (Will Collection, Shannan Collection)

**Use Cases:**
- Premium sales demos and presentations
- MVP trial accounts
- High-value prospect demonstrations
- Executive-level presentations
- Feature demonstrations
- Onboarding walkthroughs
- Training sessions

**Pre-configured Agents:**
1. **Will Collection** - Collections agent with professional persona
2. **Shannan Collection** - Collections agent variant

**Typical Demo Flow:**
1. Login as Courtney
2. Show dashboard overview
3. Create a new AI agent
4. Demonstrate phone number management
5. Show call history and analytics
6. Explore integrations page
7. Review contacts management

---

## 🔐 Login URLs

### **Production:**
- **URL:** https://globalvoice-nexus.netlify.app/login
- **Backend:** https://globalvoice-backend.fly.dev

### **Local Development:**
- **URL:** http://localhost:5173/login
- **Backend:** http://localhost:3000

---

## 📝 Creating Additional Test Users

To create additional test users, use the script:

```bash
cd backend
node create-courtney-user.js
```

Or modify the script to create different users with different roles.

---

## 🎭 User Roles & Permissions

### **Administrator**
- Full platform access
- User management
- System configuration
- All CRUD operations

### **MVP (Most Valuable Player)**
- Premium trial access
- Full feature access
- Can create unlimited agents
- Can view all analytics
- Priority support
- Extended trial period
- White-label capabilities

### **Standard User** (Future)
- Full feature access
- Own workspace
- Team collaboration
- Billing management

---

## 🧪 Test Scenarios

### **Scenario 1: Sales Demo (Use Courtney)**
1. Login as prospect
2. Show clean dashboard
3. Create first agent (Will - Collections)
4. Demonstrate voice selection
5. Show phone number purchase flow
6. Display analytics capabilities
7. Highlight integration options

### **Scenario 2: Feature Testing (Use Admin)**
1. Login as admin
2. Test all CRUD operations
3. Verify phone number management
4. Check call logging
5. Test Vapi sync
6. Validate analytics data
7. Test integrations page

### **Scenario 3: Onboarding (Use Courtney)**
1. First-time login experience
2. Dashboard walkthrough
3. Create first agent tutorial
4. Phone number setup
5. Test call functionality
6. Review analytics
7. Explore integrations

---

## 🔒 Security Notes

- **Never commit passwords** to version control
- **Rotate passwords** regularly for production test accounts
- **Use environment variables** for database credentials
- **Limit test user permissions** appropriately
- **Monitor test account activity** for security

---

## 📊 Test Data

### **Mock Data Available:**
- **Dashboard:** 1,247 calls, 8 active, 4:32 avg duration
- **Analytics:** 30-day trends, agent performance, CSAT scores
- **Calls:** 15 sample calls with diverse languages
- **Contacts:** 5 sample contacts with countries and agents
- **Agents:** Will - Collections, Customer Support, Sales Agent

---

## 🚀 Quick Start

### **For Sales Demos:**
```bash
# Use Courtney MVP account
Email: courtney@mvp.com
Password: mvptexas321!
```

### **For Development:**
```bash
# Use Admin account
Email: admin@test.com
Password: Admin123!
```

### **For Testing:**
```bash
# Create new test user
cd backend
node create-courtney-user.js
```

---

## 📞 Support

If you need additional test users or have issues with existing accounts:
1. Check database connection
2. Verify user exists in database
3. Reset password if needed
4. Contact development team

---

## 🎯 Best Practices

1. **Use Courtney for prospects** - Clean, professional demo experience
2. **Use Admin for testing** - Full access to all features
3. **Don't mix test and production data** - Keep environments separate
4. **Document new test users** - Update this file when creating new accounts
5. **Clean up old test data** - Periodically reset test accounts

---

Last Updated: October 21, 2025
