# 🚀 Quick Railway Deployment Guide

## ⚡ 5-Minute Setup

### 1. Prepare Your Code
```bash
# Update scraping limits for production
# Edit src/bullionbypost-optimized.js:
# Change: const maxProducts = 20;
# To: const maxProducts = allProductUrls.length;

# Edit src/chards-scraper-optimized.js:
# Change: const totalPages = 5; const maxProducts = 50;
# To: const totalPages = 23; const maxProducts = allProductUrls.length;
```

### 2. Push to GitHub
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 3. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Click "Deploy Now"

### 4. Add Database
1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Copy the `DATABASE_URL`
3. Go to "Variables" tab
4. Add: `DATABASE_URL=your_copied_url`
5. Add: `NODE_ENV=production`

### 5. Test Your App
- Visit your Railway URL
- Click "🚀 Scrape All Vendors"
- Check that data appears in the web interface

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