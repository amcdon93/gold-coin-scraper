# Railway Database Setup Guide

This guide will help you set up a PostgreSQL database on Railway and configure your Gold Coin Scraper to use it.

## 🚀 Quick Setup

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub
- Create a new project

### 2. Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New Service" → "Database" → "PostgreSQL"
3. Wait for the database to be provisioned
4. Copy the connection string from the "Connect" tab

### 3. Configure Environment Variables
1. In your Railway project, go to "Variables" tab
2. Add the following environment variables:

```bash
DATABASE_URL=postgres://username:password@host:port/database
NODE_ENV=production
PORT=3000
```

Replace the `DATABASE_URL` with the actual connection string from your PostgreSQL service.

### 4. Deploy Your Application
1. Connect your GitHub repository to Railway
2. Railway will automatically detect it's a Node.js app
3. Deploy the application

## 📊 Database Features

### Automatic Database Initialization
- Tables are created automatically on first run
- No manual database setup required
- Supports both PostgreSQL (Railway) and SQLite (local development)

### Database Schema
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  price VARCHAR(100),
  stock VARCHAR(100),
  url TEXT NOT NULL,
  vendor VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  original_title VARCHAR(500),
  page_number INTEGER,
  error TEXT
);
```

### Indexes for Performance
- `idx_products_vendor` - Fast vendor filtering
- `idx_products_timestamp` - Fast date sorting
- `idx_products_price` - Fast price filtering

## 🔧 Local Development

### SQLite Setup (Default)
The application automatically uses SQLite for local development:

```bash
# Install dependencies
npm install

# Start the application
npm start
```

The SQLite database will be created at `data/products.db`

### PostgreSQL Setup (Local)
If you want to use PostgreSQL locally:

1. Install PostgreSQL
2. Create a database
3. Set environment variable:
```bash
DATABASE_URL=postgres://username:password@localhost:5432/gold_scraper
```

## 📈 Database Operations

### Saving Products
- Products are automatically saved to database after scraping
- Old data for the same vendor is cleared before new data is inserted
- Supports both PostgreSQL and SQLite

### Retrieving Products
- All products are fetched from database
- Supports filtering by vendor, price, stock status
- Results are sorted by timestamp (newest first)

### Search and Filter
- Text search in product titles
- Price range filtering
- Vendor filtering
- Stock status filtering

## 🛠️ API Endpoints

### Get All Products
```http
GET /api/products
```

### Search Products
```http
GET /api/search?query=sovereign&vendor=bullionbypost&minPrice=300&maxPrice=500&inStock=true
```

### Get Database Statistics
```http
GET /api/stats
```

### Trigger Scraping
```http
POST /api/scrape
Content-Type: application/json

{
  "vendor": "bullionbypost"
}
```

## 🔍 Monitoring

### Health Check
```http
GET /health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "connected",
  "totalProducts": 150
}
```

### Database Statistics
```json
{
  "success": true,
  "totalProducts": 150,
  "vendorStats": {
    "BullionByPost": 75,
    "Chards": 75
  },
  "lastUpdate": "2024-01-01T12:00:00.000Z"
}
```

## 🚨 Troubleshooting

### Database Connection Issues
1. Check your `DATABASE_URL` environment variable
2. Ensure the database service is running on Railway
3. Verify SSL settings for production

### Common Errors
- **"Database not initialized"**: Check database connection
- **"Connection timeout"**: Verify Railway database is active
- **"Permission denied"**: Check database credentials

### Local Development Issues
1. Ensure `data/` directory exists
2. Check file permissions for SQLite database
3. Verify Node.js version (>=18.0.0)

## 📊 Performance Tips

### Database Optimization
- Indexes are automatically created for common queries
- Connection pooling is used for PostgreSQL
- Transactions are used for bulk operations

### Railway Specific
- Use connection pooling for better performance
- Monitor database usage in Railway dashboard
- Set up alerts for high usage

## 🔐 Security

### Environment Variables
- Never commit database credentials to Git
- Use Railway's environment variable system
- Rotate database passwords regularly

### Database Security
- Use SSL connections in production
- Implement proper access controls
- Regular database backups

## 📝 Migration Guide

### From In-Memory to Database
The application now automatically:
1. Initializes database on startup
2. Saves scraped data to database
3. Retrieves data from database instead of memory
4. Provides persistent storage across restarts

### Data Migration
If you have existing data:
1. Export data from old system
2. Import into new database
3. Verify data integrity

## 🎯 Next Steps

1. **Deploy to Railway** with PostgreSQL
2. **Set up monitoring** for database performance
3. **Configure backups** for data safety
4. **Add more vendors** to the scraper
5. **Implement data analytics** dashboard

## 📞 Support

If you encounter issues:
1. Check Railway logs in dashboard
2. Verify database connection string
3. Test with local SQLite first
4. Check environment variables

---

**Happy Scraping! 🏆** 