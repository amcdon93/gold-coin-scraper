import { getDatabase, getDatabaseType } from './connection.js';

// Save products to database
export async function saveProducts(products) {
  const db = getDatabase();
  const dbType = getDatabaseType();
  
  if (dbType === 'postgres') {
    return saveProductsPostgres(db, products);
  } else {
    return saveProductsSQLite(db, products);
  }
}

// Save products to PostgreSQL
async function saveProductsPostgres(client, products) {
  const insertQuery = `
    INSERT INTO products (title, price, stock, url, vendor, timestamp, original_title, page_number, error)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (url) DO UPDATE SET
      title = EXCLUDED.title,
      price = EXCLUDED.price,
      stock = EXCLUDED.stock,
      timestamp = EXCLUDED.timestamp,
      original_title = EXCLUDED.original_title,
      page_number = EXCLUDED.page_number,
      error = EXCLUDED.error
  `;
  
  try {
    // Clear old data for this vendor if it's a fresh scrape
    const vendors = [...new Set(products.map(p => p.vendor))];
    for (const vendor of vendors) {
      await client.query('DELETE FROM products WHERE vendor = $1', [vendor]);
    }
    
    // Insert new products
    for (const product of products) {
      await client.query(insertQuery, [
        product.title || '',
        product.price || '',
        product.stock || '',
        product.url || '',
        product.vendor || '',
        product.timestamp || new Date().toISOString(),
        product.originalTitle || '',
        product.pageNumber || null,
        product.error || null
      ]);
    }
    
    console.log(`✅ Saved ${products.length} products to PostgreSQL database`);
    return products.length;
  } catch (error) {
    console.error('❌ Error saving products to PostgreSQL:', error);
    throw error;
  }
}

// Save products to SQLite
async function saveProductsSQLite(db, products) {
  const insertQuery = `
    INSERT OR REPLACE INTO products (title, price, stock, url, vendor, timestamp, original_title, page_number, error)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // Clear old data for this vendor if it's a fresh scrape
      const vendors = [...new Set(products.map(p => p.vendor))];
      const clearStmt = db.prepare('DELETE FROM products WHERE vendor = ?');
      
      vendors.forEach(vendor => {
        clearStmt.run([vendor]);
      });
      clearStmt.finalize();
      
      // Insert new products
      const insertStmt = db.prepare(insertQuery);
      
      products.forEach(product => {
        insertStmt.run([
          product.title || '',
          product.price || '',
          product.stock || '',
          product.url || '',
          product.vendor || '',
          product.timestamp || new Date().toISOString(),
          product.originalTitle || '',
          product.pageNumber || null,
          product.error || null
        ]);
      });
      
      insertStmt.finalize();
      
      db.run('COMMIT', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`✅ Saved ${products.length} products to SQLite database`);
          resolve(products.length);
        }
      });
    });
  });
}

// Get all products from database
export async function getAllProducts() {
  const db = getDatabase();
  const dbType = getDatabaseType();
  
  if (dbType === 'postgres') {
    return getAllProductsPostgres(db);
  } else {
    return getAllProductsSQLite(db);
  }
}

// Get all products from PostgreSQL
async function getAllProductsPostgres(client) {
  try {
    const result = await client.query(`
      SELECT * FROM products 
      ORDER BY timestamp DESC
    `);
    
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      price: row.price,
      stock: row.stock,
      url: row.url,
      vendor: row.vendor,
      timestamp: row.timestamp,
      originalTitle: row.original_title,
      pageNumber: row.page_number,
      error: row.error
    }));
  } catch (error) {
    console.error('❌ Error getting products from PostgreSQL:', error);
    throw error;
  }
}

// Get all products from SQLite
async function getAllProductsSQLite(db) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM products 
      ORDER BY timestamp DESC
    `, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(row => ({
          id: row.id,
          title: row.title,
          price: row.price,
          stock: row.stock,
          url: row.url,
          vendor: row.vendor,
          timestamp: row.timestamp,
          originalTitle: row.original_title,
          pageNumber: row.page_number,
          error: row.error
        })));
      }
    });
  });
}

// Search/filter products
export async function searchProducts(filters = {}) {
  const db = getDatabase();
  const dbType = getDatabaseType();
  
  if (dbType === 'postgres') {
    return searchProductsPostgres(db, filters);
  } else {
    return searchProductsSQLite(db, filters);
  }
}

// Search products in PostgreSQL
async function searchProductsPostgres(client, filters) {
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  let paramCount = 0;
  
  if (filters.vendor) {
    paramCount++;
    query += ` AND vendor ILIKE $${paramCount}`;
    params.push(`%${filters.vendor}%`);
  }
  
  if (filters.query) {
    paramCount++;
    query += ` AND title ILIKE $${paramCount}`;
    params.push(`%${filters.query}%`);
  }
  
  if (filters.minPrice || filters.maxPrice) {
    if (filters.minPrice) {
      paramCount++;
      query += ` AND CAST(REPLACE(REPLACE(price, '£', ''), ',', '') AS DECIMAL) >= $${paramCount}`;
      params.push(filters.minPrice);
    }
    if (filters.maxPrice) {
      paramCount++;
      query += ` AND CAST(REPLACE(REPLACE(price, '£', ''), ',', '') AS DECIMAL) <= $${paramCount}`;
      params.push(filters.maxPrice);
    }
  }
  
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-low':
        query += ' ORDER BY CAST(REPLACE(REPLACE(price, \'£\', \'\'), \',\', \'\') AS DECIMAL) ASC';
        break;
      case 'price-high':
        query += ' ORDER BY CAST(REPLACE(REPLACE(price, \'£\', \'\'), \',\', \'\') AS DECIMAL) DESC';
        break;
      default:
        query += ' ORDER BY timestamp DESC';
    }
  } else {
    query += ' ORDER BY timestamp DESC';
  }
  
  try {
    const result = await client.query(query, params);
    
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      price: row.price,
      stock: row.stock,
      url: row.url,
      vendor: row.vendor,
      timestamp: row.timestamp,
      originalTitle: row.original_title,
      pageNumber: row.page_number,
      error: row.error
    }));
  } catch (error) {
    console.error('❌ Error searching products in PostgreSQL:', error);
    throw error;
  }
}

// Search products in SQLite
async function searchProductsSQLite(db, filters) {
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  
  if (filters.vendor) {
    query += ' AND vendor LIKE ?';
    params.push(`%${filters.vendor}%`);
  }
  
  if (filters.query) {
    query += ' AND title LIKE ?';
    params.push(`%${filters.query}%`);
  }
  
  if (filters.minPrice || filters.maxPrice) {
    if (filters.minPrice) {
      query += ' AND CAST(REPLACE(REPLACE(price, "£", ""), ",", "") AS DECIMAL) >= ?';
      params.push(filters.minPrice);
    }
    if (filters.maxPrice) {
      query += ' AND CAST(REPLACE(REPLACE(price, "£", ""), ",", "") AS DECIMAL) <= ?';
      params.push(filters.maxPrice);
    }
  }
  
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-low':
        query += ' ORDER BY CAST(REPLACE(REPLACE(price, "£", ""), ",", "") AS DECIMAL) ASC';
        break;
      case 'price-high':
        query += ' ORDER BY CAST(REPLACE(REPLACE(price, "£", ""), ",", "") AS DECIMAL) DESC';
        break;
      default:
        query += ' ORDER BY timestamp DESC';
    }
  } else {
    query += ' ORDER BY timestamp DESC';
  }
  
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(row => ({
          id: row.id,
          title: row.title,
          price: row.price,
          stock: row.stock,
          url: row.url,
          vendor: row.vendor,
          timestamp: row.timestamp,
          originalTitle: row.original_title,
          pageNumber: row.page_number,
          error: row.error
        })));
      }
    });
  });
}

// Get product count
export async function getProductCount() {
  const db = getDatabase();
  const dbType = getDatabaseType();
  
  if (dbType === 'postgres') {
    const result = await db.query('SELECT COUNT(*) as count FROM products');
    return parseInt(result.rows[0].count);
  } else {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }
}

// Clear all products
export async function clearAllProducts() {
  const db = getDatabase();
  const dbType = getDatabaseType();
  
  if (dbType === 'postgres') {
    await db.query('DELETE FROM products');
  } else {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM products', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
} 