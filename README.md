# 🏆 Gold Coin Scraper

A powerful, database-driven web scraper for gold coin data from BullionByPost and Chards, built with Playwright and Express.js.

## ✨ Features

- **🔍 Multi-vendor scraping**: BullionByPost and Chards
- **💾 Database storage**: PostgreSQL (Railway) and SQLite (local)
- **📊 Real-time data**: Live product information and pricing
- **🔍 Advanced filtering**: Search by vendor, price, stock status
- **📈 Statistics dashboard**: Database analytics and insights
- **🚀 Railway ready**: Easy deployment with PostgreSQL
- **⚡ Optimized performance**: Parallel scraping and connection pooling

## 🚀 Quick Start

### Local Development

1. **Clone and install**:
```bash
git clone <your-repo>
cd gold-coin-scraper
npm install
```

2. **Start the application**:
```bash
npm start
```

3. **Access the web interface**:
   - Open http://localhost:3000
   - Click "Scrape All Vendors" to start scraping
   - View and filter products in the database

### Railway Deployment

1. **Create Railway account** at [railway.app](https://railway.app)
2. **Add PostgreSQL database** to your project
3. **Set environment variables**:
```bash
   DATABASE_URL=postgres://username:password@host:port/database
   NODE_ENV=production
   PORT=3000
   ```
4. **Deploy your application**

📖 **Detailed Railway setup**: See [RAILWAY_DATABASE_SETUP.md](./RAILWAY_DATABASE_SETUP.md)

## 📊 Database Features

### Automatic Setup
- **SQLite** for local development (no setup required)
- **PostgreSQL** for Railway production
- Tables and indexes created automatically
- Connection pooling for optimal performance

### Data Persistence
- Products saved to database after scraping
- Persistent storage across restarts
- Automatic cleanup of old data
- Search and filtering capabilities

### API Endpoints
```http
GET  /api/products     # Get all products
GET  /api/search       # Search/filter products
POST /api/scrape       # Trigger scraping
GET  /api/stats        # Database statistics
GET  /health           # Health check
```

## 🛠️ Available Scripts

```bash
npm start              # Start the application
npm run dev            # Start with auto-reload
npm run test:db        # Test database functionality
npm run bullionbypost  # Scrape BullionByPost only
npm run chards         # Scrape Chards only
npm run install-browsers # Install Playwright browsers
```

## 📈 Web Interface

The application includes a modern web interface with:

- **Real-time scraping**: Trigger scraping from the UI
- **Advanced filtering**: Search by vendor, price, stock status
- **Database statistics**: View product counts and vendor breakdown
- **Responsive design**: Works on desktop and mobile
- **Live updates**: Data refreshes automatically

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | SQLite (local) |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |

### Database Support

- **SQLite**: Local development (automatic)
- **PostgreSQL**: Railway production
- **Automatic migration**: No manual setup required

## 📊 Data Structure

Each product contains:
```json
{
  "id": 1,
  "title": "Gold Sovereign Coin 2024",
  "price": "£350.00",
  "stock": "In Stock",
  "url": "https://example.com/product",
  "vendor": "BullionByPost",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "originalTitle": "Original Title",
  "pageNumber": 1,
  "error": null
}
```

## 🚨 Troubleshooting

### Common Issues

1. **"Database not initialized"**
   - Check database connection string
   - Verify Railway database is active

2. **"No products displaying"**
   - Run scraping first: Click "Scrape All Vendors"
   - Check database connection
   - Verify scrapers are working

3. **"Connection timeout"**
   - Check Railway database status
   - Verify environment variables
   - Test with local SQLite first

### Local Development

1. **SQLite database** is created automatically at `data/products.db`
2. **No external dependencies** required for local development
3. **Test database functionality** with `npm run test:db`

## 📚 Documentation

- [Railway Database Setup](./RAILWAY_DATABASE_SETUP.md) - Complete Railway deployment guide
- [Railway Deployment](./RAILWAY_DEPLOYMENT.md) - General Railway deployment
- [Usage Guide](./USAGE.md) - Detailed usage instructions
- [Cloudflare Guide](./CLOUDFLARE_GUIDE.md) - Anti-detection techniques

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run test:db`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy Scraping! 🏆**

*Built with ❤️ using Playwright, Express.js, and PostgreSQL* 