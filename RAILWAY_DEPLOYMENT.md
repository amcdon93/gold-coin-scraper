# 🚀 Railway Deployment Guide

## 🎯 **Railway vs Selenium for Cloudflare**

### **Railway Requirements:**
- ✅ **Headless mode only** - No GUI support
- ✅ **Playwright works** - Better than Selenium for Railway
- ✅ **Serverless environment** - Automatic scaling
- ✅ **Environment variables** - Secure configuration

### **Why Playwright > Selenium for Railway:**
- ✅ **Built for headless** - Designed for server environments
- ✅ **Better performance** - More efficient than Selenium
- ✅ **Modern API** - Better error handling
- ✅ **Railway compatible** - Works out of the box

## 🚀 **Railway Setup**

### 1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

### 2. Login to Railway:
```bash
railway login
```

### 3. Initialize Railway project:
```bash
railway init
```

## 📝 **Railway Configuration**

### Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Update `package.json` scripts:
```json
{
  "scripts": {
    "start": "node src/index.js",
    "railway-scrape": "node src/railway-scraper-template.js",
    "railway-test": "node src/railway-cloudflare-bypass.js"
  }
}
```

## 🔧 **Environment Variables**

### Set in Railway Dashboard:
```bash
TARGET_URL=https://your-gold-vendor.com
DATABASE_URL=your-database-connection-string
API_KEY=your-api-key
```

### Or via CLI:
```bash
railway variables set TARGET_URL=https://your-gold-vendor.com
railway variables set DATABASE_URL=your-database-connection-string
railway variables set API_KEY=your-api-key
```

## 📋 **Railway-Compatible Code**

### Main Entry Point (`src/index.js`):
```javascript
import express from 'express';
import { scrapeGoldCoins } from './railway-scraper-template.js';

const app = express();
const port = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/scrape', async (req, res) => {
  try {
    const data = await scrapeGoldCoins();
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message, 
      timestamp: new Date().toISOString() 
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Railway scraper running on port ${port}`);
});
```

## 🎯 **Cloudflare Bypass for Railway**

### Key Strategies:
1. **Headless mode** - Required for Railway
2. **Advanced anti-detection** - Hide automation
3. **Retry logic** - Handle Cloudflare challenges
4. **Human-like behavior** - Random delays and movements
5. **Realistic headers** - Mimic real browser

### Railway-Specific Settings:
```javascript
const railwayConfig = {
  headless: true, // Required for Railway
  slowMo: 2000,   // Slow down actions
  args: [
    '--disable-blink-features=AutomationControlled',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    // ... more anti-detection args
  ],
};
```

## 🚀 **Deploy to Railway**

### 1. Deploy:
```bash
railway up
```

### 2. Check logs:
```bash
railway logs
```

### 3. Open dashboard:
```bash
railway open
```

## 📊 **Monitoring & Testing**

### Health Check:
```bash
curl https://your-app.railway.app/health
```

### Test Scraping:
```bash
curl https://your-app.railway.app/scrape
```

### View Logs:
```bash
railway logs --tail
```

## 🔧 **Railway Advantages**

### ✅ **Benefits:**
- **Automatic scaling** - Handles traffic spikes
- **Zero downtime** - Automatic deployments
- **Environment variables** - Secure configuration
- **Built-in monitoring** - Logs and metrics
- **Global CDN** - Fast worldwide access

### ⚠️ **Limitations:**
- **Headless only** - No GUI support
- **Memory limits** - Resource constraints
- **Timeout limits** - Request timeouts
- **Cold starts** - Initial delay

## 🎯 **Best Practices**

### 1. **Error Handling:**
```javascript
try {
  const data = await scrapeGoldCoins();
  // Process data
} catch (error) {
  console.error('Scraping failed:', error);
  // Retry or fallback
}
```

### 2. **Retry Logic:**
```javascript
let retries = 3;
while (retries > 0) {
  try {
    await page.goto(url);
    break;
  } catch (error) {
    retries--;
    await page.waitForTimeout(5000);
  }
}
```

### 3. **Environment Variables:**
```javascript
const targetUrl = process.env.TARGET_URL || 'https://default-site.com';
const apiKey = process.env.API_KEY;
```

## 🚀 **Quick Start**

### 1. Test locally:
```bash
npm run railway-scraper
```

### 2. Deploy to Railway:
```bash
railway up
```

### 3. Set environment variables:
```bash
railway variables set TARGET_URL=https://your-site.com
```

### 4. Monitor:
```bash
railway logs --tail
```

## 💡 **Railway vs Selenium Summary**

| Feature | Railway + Playwright | Selenium |
|---------|---------------------|----------|
| **Deployment** | ✅ Works | ❌ Won't work |
| **Cloudflare** | ✅ Advanced bypass | ✅ Better locally |
| **Performance** | ✅ Fast | ⚠️ Slower |
| **Setup** | ✅ Simple | ❌ Complex |
| **Scaling** | ✅ Automatic | ❌ Manual |
| **Cost** | ✅ Pay per use | ❌ Always on |

**For Railway deployment, Playwright is the clear winner!** 