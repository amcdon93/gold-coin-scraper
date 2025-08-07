/**
 * Scrape gold coins from Chards
 * @param {import('playwright').Browser} browser - Playwright browser instance
 * @returns {Promise<Array>} Array of scraped products
 */
export async function scrapeChards(browser) {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const results = [];
  
  try {
    // Navigate to the sovereign coins page
    console.log('Loading Chards sovereign page...');
    await page.goto('https://www.chards.co.uk/gold-coins/sovereign-gold-coins', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Handle cookie consent
    await handleCookieConsent(page);
    
    // Wait for product grid to load
    await page.waitForSelector('.product-grid, .products, .product-list, [data-testid="product-grid"]', { 
      timeout: 15000 
    });
    
    // Get all product cards
    const productCards = await page.$$('.product-item, .product-card, .product, [data-testid="product-card"]');
    
    console.log(`Found ${productCards.length} products on Chards`);
    
    for (let i = 0; i < productCards.length; i++) {
      try {
        const card = productCards[i];
        
        // Extract product data
        const productData = await extractProductData(card, page);
        
        if (productData && isValidSovereign(productData.title)) {
          results.push({
            ...productData,
            vendor: 'Chards'
          });
        }
        
      } catch (error) {
        console.warn(`Error processing Chards product ${i + 1}:`, error.message);
        continue;
      }
    }
    
    // Also check half sovereigns specifically
    console.log('Loading Chards half sovereign page...');
    await page.goto('https://www.chards.co.uk/gold-coins/half-sovereign-gold-coins', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await handleCookieConsent(page);
    
    await page.waitForSelector('.product-grid, .products, .product-list, [data-testid="product-grid"]', { 
      timeout: 15000 
    });
    
    const halfSovereignCards = await page.$$('.product-item, .product-card, .product, [data-testid="product-card"]');
    
    console.log(`Found ${halfSovereignCards.length} half sovereign products on Chards`);
    
    for (let i = 0; i < halfSovereignCards.length; i++) {
      try {
        const card = halfSovereignCards[i];
        const productData = await extractProductData(card, page);
        
        if (productData && isValidSovereign(productData.title)) {
          results.push({
            ...productData,
            vendor: 'Chards'
          });
        }
        
      } catch (error) {
        console.warn(`Error processing Chards half sovereign product ${i + 1}:`, error.message);
        continue;
      }
    }
    
  } catch (error) {
    console.error('Error scraping Chards:', error);
  } finally {
    await context.close();
  }
  
  console.log(`Chards: Scraped ${results.length} valid products`);
  return results;
}

/**
 * Extract product data from a product card
 * @param {import('playwright').ElementHandle} card - Product card element
 * @param {import('playwright').Page} page - Page instance
 * @returns {Promise<Object>} Product data object
 */
async function extractProductData(card, page) {
  // Extract title
  const titleElement = await card.$('h2, h3, .product-title, .title, .product-name, [data-testid="product-title"]');
  const title = titleElement ? await titleElement.textContent() : null;
  
  if (!title) return null;
  
  // Extract URL
  const linkElement = await card.$('a[href*="/gold-coins/"]');
  const url = linkElement ? await linkElement.getAttribute('href') : null;
  const fullUrl = url ? (url.startsWith('http') ? url : `https://www.chards.co.uk${url}`) : null;
  
  // Extract price
  const priceElement = await card.$('.price, .product-price, .current-price, [data-testid="price"], .price-current');
  let price = null;
  
  if (priceElement) {
    const priceText = await priceElement.textContent();
    price = extractPrice(priceText);
  }
  
  // If no price found in card, try to get it from the product page
  if (!price && fullUrl) {
    price = await getPriceFromProductPage(page, fullUrl);
  }
  
  return {
    title: title.trim(),
    price,
    url: fullUrl
  };
}

/**
 * Extract price from text, handling bulk pricing
 * @param {string} priceText - Raw price text
 * @returns {number|null} Extracted price
 */
function extractPrice(priceText) {
  if (!priceText) return null;
  
  // Remove currency symbols and clean up
  const cleaned = priceText.replace(/[£$€,]/g, '').trim();
  
  // Handle "Price from £X" format
  const fromMatch = cleaned.match(/from\s*([\d.]+)/i);
  if (fromMatch) {
    return parseFloat(fromMatch[1]);
  }
  
  // Handle "£X - £Y" format (take highest)
  const rangeMatch = cleaned.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (rangeMatch) {
    const price1 = parseFloat(rangeMatch[1]);
    const price2 = parseFloat(rangeMatch[2]);
    return Math.max(price1, price2);
  }
  
  // Handle "£X per coin" format
  const perCoinMatch = cleaned.match(/([\d.]+)\s*per\s*coin/i);
  if (perCoinMatch) {
    return parseFloat(perCoinMatch[1]);
  }
  
  // Handle simple price
  const simpleMatch = cleaned.match(/([\d.]+)/);
  if (simpleMatch) {
    return parseFloat(simpleMatch[1]);
  }
  
  return null;
}

/**
 * Get price from individual product page
 * @param {import('playwright').Page} page - Page instance
 * @param {string} url - Product URL
 * @returns {Promise<number|null>} Price or null
 */
async function getPriceFromProductPage(page, url) {
  try {
    const productPage = await page.context().newPage();
    await productPage.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    
    const priceSelectors = [
      '.price',
      '.product-price',
      '.current-price',
      '[data-testid="price"]',
      '.price-current',
      '.product-current-price'
    ];
    
    for (const selector of priceSelectors) {
      const priceElement = await productPage.$(selector);
      if (priceElement) {
        const priceText = await priceElement.textContent();
        const price = extractPrice(priceText);
        if (price) {
          await productPage.close();
          return price;
        }
      }
    }
    
    await productPage.close();
  } catch (error) {
    console.warn(`Error getting price from product page ${url}:`, error.message);
  }
  
  return null;
}

/**
 * Handle cookie consent popup
 * @param {import('playwright').Page} page - Page instance
 */
async function handleCookieConsent(page) {
  try {
    // Common cookie consent selectors
    const cookieSelectors = [
      '#onetrust-accept-btn-handler',
      '.accept-cookies',
      '.cookie-accept',
      '[data-testid="cookie-accept"]',
      '.btn-accept-cookies',
      '.cookie-banner-accept'
    ];
    
    for (const selector of cookieSelectors) {
      const button = await page.$(selector);
      if (button) {
        await button.click();
        await page.waitForTimeout(1000);
        break;
      }
    }
  } catch (error) {
    // Cookie consent might not exist, continue
  }
}

/**
 * Check if product is a valid sovereign coin
 * @param {string} title - Product title
 * @returns {boolean} True if valid sovereign
 */
function isValidSovereign(title) {
  if (!title) return false;
  
  const lowerTitle = title.toLowerCase();
  
  // Include sovereign-related keywords
  const sovereignKeywords = [
    'sovereign',
    'full sovereign',
    'half sovereign',
    'quarter sovereign'
  ];
  
  // Exclude non-sovereign products
  const excludeKeywords = [
    'bar',
    'ingot',
    'krugerrand',
    'eagle',
    'maple',
    'panda',
    'philharmonic',
    'britannia',
    'lunar',
    'kangaroo',
    'nugget',
    'proof',
    'uncirculated'
  ];
  
  const hasSovereignKeyword = sovereignKeywords.some(keyword => 
    lowerTitle.includes(keyword)
  );
  
  const hasExcludeKeyword = excludeKeywords.some(keyword => 
    lowerTitle.includes(keyword)
  );
  
  return hasSovereignKeyword && !hasExcludeKeyword;
} 