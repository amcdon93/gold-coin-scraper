import express from 'express';
import { scrapeBullionByPostOptimized } from './bullionbypost-optimized.js';
import { scrapeChardsOptimized } from './chards-scraper-optimized.js';
import { initDatabase, closeDatabase } from './database/connection.js';
import { saveProducts, getAllProducts, searchProducts, getProductCount } from './database/operations.js';

const app = express();
const port = process.env.PORT || 3000;

// Initialize database on startup
let dbInitialized = false;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Initialize database
async function initializeApp() {
  try {
    await initDatabase();
    dbInitialized = true;
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    // Continue without database for now
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: dbInitialized ? 'connected' : 'disconnected',
    totalProducts: 0 // Will be updated below
  });
});

// API endpoint to get all scraped data
app.get('/api/products', async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Database not initialized'
      });
    }
    
    const products = await getAllProducts();
    const total = await getProductCount();
    
    res.json({
      products: products,
      total: total,
      lastScrape: products.length > 0 ? products[0].timestamp : null
    });
  } catch (error) {
    console.error('❌ Error getting products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to search/filter products
app.get('/api/search', async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Database not initialized'
      });
    }
    
    const { query, minPrice, maxPrice, sortBy, vendor } = req.query;
    
    const filters = {};
    if (vendor) filters.vendor = vendor;
    if (query) filters.query = query;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (sortBy) filters.sortBy = sortBy;
    
    const products = await searchProducts(filters);
    const total = await getProductCount();
    
    res.json({
      products: products,
      total: products.length,
      originalTotal: total
    });
  } catch (error) {
    console.error('❌ Error searching products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to trigger scraping
app.post('/api/scrape', async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Database not initialized'
      });
    }
    
    const { vendor } = req.body;
    console.log(`🚀 Starting scraping process for vendor: ${vendor || 'all'}`);
    
    let data = [];
    
    if (!vendor || vendor === 'all' || vendor === 'bullionbypost') {
      console.log('📊 Scraping BullionByPost (optimized)...');
      const bullionData = await scrapeBullionByPostOptimized();
      data.push(...bullionData);
    }
    
    if (!vendor || vendor === 'all' || vendor === 'chards') {
      console.log('📊 Scraping Chards (optimized)...');
      const chardsData = await scrapeChardsOptimized();
      data.push(...chardsData);
    }
    
    // Save to database
    if (data.length > 0) {
      console.log(`💾 Saving ${data.length} products to database...`);
      await saveProducts(data);
    }
    
    res.json({
      success: true,
      message: `Successfully scraped and saved ${data.length} products from ${vendor || 'all vendors'}`,
      total: data.length,
      timestamp: new Date().toISOString(),
      vendors: vendor ? [vendor] : ['bullionbypost', 'chards']
    });
    
  } catch (error) {
    console.error('❌ Error during scraping:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to get database stats
app.get('/api/stats', async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Database not initialized'
      });
    }
    
    const totalProducts = await getProductCount();
    const products = await getAllProducts();
    
    const vendorStats = {};
    products.forEach(product => {
      if (!vendorStats[product.vendor]) {
        vendorStats[product.vendor] = 0;
      }
      vendorStats[product.vendor]++;
    });
    
    res.json({
      success: true,
      totalProducts,
      vendorStats,
      lastUpdate: products.length > 0 ? products[0].timestamp : null
    });
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Main page with UI
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gold Coin Scraper - Database Edition</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .controls {
            padding: 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
        }
        
        .search-filters {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
        }
        
        .form-group label {
            font-weight: 600;
            margin-bottom: 5px;
            color: #333;
        }
        
        .form-group input, .form-group select {
            padding: 10px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .button-group {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
        }
        
        .btn-success {
            background: #28a745;
            color: white;
        }
        
        .btn-success:hover {
            background: #218838;
        }
        
        .btn-info {
            background: #17a2b8;
            color: white;
        }
        
        .btn-info:hover {
            background: #138496;
        }
        
        .status {
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            font-weight: 600;
        }
        
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .status.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        
        .products {
            padding: 30px;
        }
        
        .products-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e9ecef;
        }
        
        .products-count {
            font-size: 1.1rem;
            color: #666;
        }
        
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin-top: 30px;
        }
        
        .pagination button {
            padding: 8px 12px;
            border: 1px solid #e9ecef;
            background: white;
            color: #667eea;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .pagination button:hover {
            background: #667eea;
            color: white;
        }
        
        .pagination button.active {
            background: #667eea;
            color: white;
        }
        
        .pagination button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .product-card {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .product-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
            line-height: 1.4;
            height: 3.4rem;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        .product-vendor {
            font-size: 0.9rem;
            font-weight: 500;
            color: #667eea;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .product-price {
            font-size: 1.5rem;
            font-weight: 700;
            color: #28a745;
            margin-bottom: 10px;
        }
        
        .product-card-content {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        
        .product-card-main {
            flex-grow: 1;
        }
        
        .product-card-footer {
            margin-top: auto;
            padding-top: 15px;
        }
        
        .product-url {
            color: #667eea;
            text-decoration: none;
            font-size: 0.9rem;
            word-break: break-all;
        }
        
        .product-url:hover {
            text-decoration: underline;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .stats-panel {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        
        .stat-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #667eea;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #666;
            margin-top: 5px;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .search-filters {
                grid-template-columns: 1fr;
            }
            
            .button-group {
                flex-direction: column;
            }
            
            .products-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 Gold Coin Scraper</h1>
            <p>Database-powered scraping from BullionByPost & Chards - Sovereign Gold Coins</p>
        </div>
        
        <div class="controls">
            <div class="search-filters">
                <div class="form-group">
                    <label for="search">Search Products</label>
                    <input type="text" id="search" placeholder="Search by product name...">
                </div>
                
                <div class="form-group">
                    <label for="vendorFilter">Vendor</label>
                    <select id="vendorFilter">
                        <option value="">All Vendors</option>
                        <option value="bullionbypost">BullionByPost</option>
                        <option value="chards">Chards</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="minPrice">Min Price (£)</label>
                    <input type="number" id="minPrice" placeholder="0">
                </div>
                
                <div class="form-group">
                    <label for="maxPrice">Max Price (£)</label>
                    <input type="number" id="maxPrice" placeholder="1000">
                </div>
                
                <div class="form-group">
                    <label for="sortBy">Sort By</label>
                    <select id="sortBy">
                        <option value="">No Sorting</option>
                        <option value="price-low">Price: Lowest to Highest</option>
                        <option value="price-high">Price: Highest to Lowest</option>
                    </select>
                </div>
            </div>
            
            <div class="button-group">
                <button class="btn btn-primary" onclick="searchProducts()">🔍 Search & Filter</button>
                <button class="btn btn-secondary" onclick="clearFilters()">🔄 Clear Filters</button>
                <button class="btn btn-success" onclick="startScraping()">🚀 Scrape All Vendors</button>
                <button class="btn btn-success" onclick="startScraping('bullionbypost')">📊 Scrape BullionByPost</button>
                <button class="btn btn-success" onclick="startScraping('chards')">🏪 Scrape Chards</button>
            </div>
            
            <div id="status"></div>
        </div>
        
        <div class="products">
            <div class="products-header">
                <h2>📦 Products</h2>
                <div class="products-count" id="productCount">Loading...</div>
            </div>
            

            
            <div id="productsContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading products...</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentData = [];
        let currentPage = 1;
        const productsPerPage = 12;
        
        // Load data on page load
        window.onload = function() {
            loadProducts();
        };
        
        async function loadProducts() {
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                
                if (data.success === false) {
                    updateStatus('Database not available: ' + data.error, 'error');
                    return;
                }
                
                currentData = data.products;
                displayProducts(currentData);
                updateStatus('Data loaded successfully', 'success');
            } catch (error) {
                updateStatus('Error loading data: ' + error.message, 'error');
            }
        }
        

        
        async function searchProducts() {
            const searchQuery = document.getElementById('search').value;
            const vendorFilter = document.getElementById('vendorFilter').value;
            const minPrice = document.getElementById('minPrice').value;
            const maxPrice = document.getElementById('maxPrice').value;
            const sortBy = document.getElementById('sortBy').value;
            
            const params = new URLSearchParams();
            if (searchQuery) params.append('query', searchQuery);
            if (vendorFilter) params.append('vendor', vendorFilter);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (sortBy) params.append('sortBy', sortBy);
            
            try {
                const response = await fetch('/api/search?' + params.toString());
                const data = await response.json();
                
                if (data.success === false) {
                    updateStatus('Error searching: ' + data.error, 'error');
                    return;
                }
                
                currentPage = 1; // Reset to first page when searching
                displayProducts(data.products);
                updateStatus(\`Found \${data.total} products\`, 'info');
            } catch (error) {
                updateStatus('Error searching: ' + error.message, 'error');
            }
        }
        
        function clearFilters() {
            document.getElementById('search').value = '';
            document.getElementById('vendorFilter').value = '';
            document.getElementById('minPrice').value = '';
            document.getElementById('maxPrice').value = '';
            document.getElementById('sortBy').value = '';
            currentPage = 1;
            displayProducts(currentData);
            updateStatus('Filters cleared', 'info');
        }
        
        async function startScraping(vendor = null) {
            const statusDiv = document.getElementById('status');
            const vendorText = vendor ? \` for \${vendor}\` : '';
            statusDiv.innerHTML = \`<div class="status info">🚀 Starting scraping process\${vendorText}... This may take a few minutes.</div>\`;
            
            try {
                const response = await fetch('/api/scrape', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ vendor: vendor })
                });
                const data = await response.json();
                
                if (data.success) {
                    updateStatus(\`✅ \${data.message}\`, 'success');
                    await loadProducts(); // Reload data
                } else {
                    updateStatus('❌ Error: ' + data.error, 'error');
                }
            } catch (error) {
                updateStatus('❌ Error: ' + error.message, 'error');
            }
        }
        
        function displayProducts(products) {
            const container = document.getElementById('productsContainer');
            const countDiv = document.getElementById('productCount');
            
            // Apply sorting if specified
            const sortBy = document.getElementById('sortBy').value;
            if (sortBy) {
                products = sortProducts(products, sortBy);
            }
            
            countDiv.textContent = \`\${products.length} products\`;
            
            if (products.length === 0) {
                container.innerHTML = '<div class="loading"><p>No products found</p></div>';
                return;
            }
            
            // Calculate pagination
            const totalPages = Math.ceil(products.length / productsPerPage);
            const startIndex = (currentPage - 1) * productsPerPage;
            const endIndex = startIndex + productsPerPage;
            const currentProducts = products.slice(startIndex, endIndex);
            
            const productsHTML = currentProducts.map(product => \`
                <div class="product-card">
                    <div class="product-card-content">
                        <div class="product-card-main">
                            <div class="product-title">\${product.title || 'No title'}</div>
                            <div class="product-vendor">\${product.vendor || 'Unknown Vendor'}</div>
                            <div class="product-price">\${product.price || 'Price not available'}</div>
                        </div>
                        <div class="product-card-footer">
                            <a href="\${product.url}" target="_blank" class="product-url">View Product →</a>
                        </div>
                    </div>
                </div>
            \`).join('');
            
            // Create pagination HTML
            let paginationHTML = '';
            if (totalPages > 1) {
                paginationHTML = createPaginationHTML(currentPage, totalPages);
            }
            
            container.innerHTML = \`<div class="products-grid">\${productsHTML}</div>\${paginationHTML}\`;
        }
        
        function sortProducts(products, sortBy) {
            const sortedProducts = [...products];
            
            switch (sortBy) {
                case 'price-low':
                    return sortedProducts.sort((a, b) => {
                        const priceA = extractPrice(a.price);
                        const priceB = extractPrice(b.price);
                        return priceA - priceB;
                    });
                case 'price-high':
                    return sortedProducts.sort((a, b) => {
                        const priceA = extractPrice(a.price);
                        const priceB = extractPrice(b.price);
                        return priceB - priceA;
                    });
                default:
                    return sortedProducts;
            }
        }
        
        function extractPrice(priceString) {
            if (!priceString) return 0;
            const match = priceString.match(/[£$]?([0-9,]+\.?[0-9]*)/);
            if (match) {
                return parseFloat(match[1].replace(/,/g, ''));
            }
            return 0;
        }
        
        function createPaginationHTML(currentPage, totalPages) {
            let paginationHTML = '<div class="pagination">';
            
            // Previous button
            paginationHTML += \`<button onclick="changePage(\${currentPage - 1})" \${currentPage <= 1 ? 'disabled' : ''}>Previous</button>\`;
            
            // Page numbers
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);
            
            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += \`<button onclick="changePage(\${i})" class="\${i === currentPage ? 'active' : ''}">\${i}</button>\`;
            }
            
            // Next button
            paginationHTML += \`<button onclick="changePage(\${currentPage + 1})" \${currentPage >= totalPages ? 'disabled' : ''}>Next</button>\`;
            
            paginationHTML += '</div>';
            return paginationHTML;
        }
        
        function changePage(page) {
            currentPage = page;
            displayProducts(currentData);
        }
        
        function updateStatus(message, type) {
            const statusDiv = document.getElementById('status');
            statusDiv.innerHTML = \`<div class="status \${type}">\${message}</div>\`;
            
            // Auto-hide success messages after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    statusDiv.innerHTML = '';
                }, 5000);
            }
        }
    </script>
</body>
</html>
  `);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Error:', error);
  res.status(500).json({
    success: false,
    error: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

// Start server
async function startServer() {
  await initializeApp();
  
  app.listen(port, () => {
    console.log(`🚀 Gold Coin Scraper server running on port ${port}`);
    console.log(`📊 Web UI available at: http://localhost:${port}`);
    console.log(`🔍 API endpoints:`);
    console.log(`   GET  /health - Health check`);
    console.log(`   GET  /api/products - Get all products`);
    console.log(`   GET  /api/search - Search/filter products`);
    console.log(`   POST /api/scrape - Trigger scraping`);
    console.log(`   GET  /api/stats - Get database statistics`);
  });
}

startServer().catch(console.error);

export default app; 