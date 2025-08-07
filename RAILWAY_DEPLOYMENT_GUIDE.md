# 🚀 Railway Deployment Guide

## 📋 Prerequisites
- Railway account (free tier available)
- Node.js installed on your computer

## 🎯 Step-by-Step Deployment Process

### Option 1: Deploy Directly (No Git Required)

#### 1.1 Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 1.2 Login to Railway
```bash
railway login
```

#### 1.3 Update Scraping Limits for Production

**File: `src/bullionbypost-optimized.js`**
```javascript
// Change this line (around line 150):
const maxProducts = 20; // TESTING MODE

// To this:
const maxProducts = allProductUrls.length; // PRODUCTION MODE
```

**File: `src/chards-scraper-optimized.js`**
```javascript
// Change these lines (around line 155):
const totalPages = 5; // Reduced from 23 for testing
const maxProducts = 50;

// To this:
const totalPages = 23; // Full scraping
const maxProducts = allProductUrls.length;
```

#### 1.4 Deploy Directly
```bash
# Initialize Railway project
railway init

# Deploy your code
railway up
```

#### 1.5 Add Database
1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Copy the `DATABASE_URL`
3. Go to "Variables" tab
4. Add: `DATABASE_URL=your_copied_url`
5. Add: `NODE_ENV=production`

### Option 2: Deploy via GitHub (Original Method)

#### 2.1 Prepare Your Code for Production

Before deploying, you need to update the scraping limits from testing mode to production mode:

**File: `src/bullionbypost-optimized.js`**
```javascript
// Change this line (around line 150):
const maxProducts = 20; // TESTING MODE

// To this:
const maxProducts = allProductUrls.length; // PRODUCTION MODE
```

**File: `src/chards-scraper-optimized.js`**
```javascript
// Change these lines (around line 155):
const totalPages = 5; // Reduced from 23 for testing
const maxProducts = 50;

// To this:
const totalPages = 23; // Full scraping
const maxProducts = allProductUrls.length;
```

#### 2.2 Push to GitHub
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

#### 2.3 Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Click "Deploy Now"

#### 2.4 Add Database
1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Copy the `DATABASE_URL`
3. Go to "Variables" tab
4. Add: `DATABASE_URL=your_copied_url`
5. Add: `NODE_ENV=production`

## 🎯 What You Get

✅ **Live web application** at `https://your-app.railway.app`  
✅ **PostgreSQL database** for persistent storage  
✅ **Beautiful UI** with search, filter, and pagination  
✅ **Automatic SSL** and domain management  
✅ **Health monitoring** and auto-restart  
✅ **Free tier** with $5 credit per month  

## 🔧 Troubleshooting

**Build fails?** Check that `postinstall` script is in package.json  
**Database error?** Verify `DATABASE_URL` is set correctly  
**No data?** Click "Scrape All Vendors" to populate database  
**App crashes?** Check Railway logs in dashboard  

## 📞 Need Help?

- [Railway Docs](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- Your app health check: `/health` endpoint

---

**🎉 That's it!** Your gold coin scraper is now live on the internet! 