# Gold Coin Scraper Usage Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   npm run install-browsers
   ```

2. **Run the scraper:**
   ```bash
   npm start
   ```

3. **Test individual vendors:**
   ```bash
   node src/index.js bullionbypost
   node src/index.js chards
   ```

## Using Playwright Codegen

Playwright Codegen is a powerful tool that automatically generates interaction code by watching your browser actions. Here's how to use it:

### Step 1: Start Codegen
```bash
npm run codegen
```

This opens a browser window and a code generator panel.

### Step 2: Navigate to the Target Website
1. In the browser window, navigate to the vendor's sovereign page
2. For example: `https://www.bullionbypost.co.uk/gold-coins/full-sovereign-gold-coin/`

### Step 3: Interact with the Page
Perform the actions you want to automate:
- Accept cookies if prompted
- Wait for products to load
- Scroll down to load more products (if lazy loading)
- Click on product cards to see details
- Navigate through pagination if needed

### Step 4: Copy Generated Code
The code generator panel will show JavaScript code like:
```javascript
// Navigate to the website
await page.goto('https://www.bullionbypost.co.uk/gold-coins/full-sovereign-gold-coin/');

// Wait for cookie consent
await page.waitForSelector('#onetrust-accept-btn-handler');
await page.click('#onetrust-accept-btn-handler');

// Wait for product grid
await page.waitForSelector('.product-grid');

// Scroll to load more products
await page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight);
});

// Click on a product
await page.click('.product-card:first-child');
```

### Step 5: Integrate into Scraper
Copy the relevant parts into your scraper function:

```javascript
export async function scrapeNewVendor(browser) {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const results = [];
  
  try {
    // Use the generated navigation code
    await page.goto('https://newvendor.com/sovereign-coins');
    
    // Use the generated cookie handling
    await page.waitForSelector('#cookie-accept');
    await page.click('#cookie-accept');
    
    // Use the generated product grid waiting
    await page.waitForSelector('.product-grid');
    
    // Extract products using the discovered selectors
    const productCards = await page.$$('.product-card');
    
    for (const card of productCards) {
      const productData = await extractProductData(card, page);
      if (productData && isValidSovereign(productData.title)) {
        results.push({
          ...productData,
          vendor: 'NewVendor'
        });
      }
    }
    
  } finally {
    await context.close();
  }
  
  return results;
}
```

## Adding a New Vendor

### 1. Create Scraper File
Create `src/scrapers/newvendor.js`:

```javascript
export async function scrapeNewVendor(browser) {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const results = [];
  
  try {
    // Navigate to vendor page
    await page.goto('https://newvendor.com/sovereign-coins', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Handle cookie consent
    await handleCookieConsent(page);
    
    // Wait for product grid
    await page.waitForSelector('.product-grid', { timeout: 10000 });
    
    // Extract products
    const productCards = await page.$$('.product-card');
    
    for (const card of productCards) {
      const productData = await extractProductData(card, page);
      if (productData && isValidSovereign(productData.title)) {
        results.push({
          ...productData,
          vendor: 'NewVendor'
        });
      }
    }
    
  } finally {
    await context.close();
  }
  
  return results;
}

// Helper functions (copy from existing scrapers)
async function extractProductData(card, page) {
  // Extract title, price, URL
  const titleElement = await card.$('.product-title');
  const title = titleElement ? await titleElement.textContent() : null;
  
  const priceElement = await card.$('.product-price');
  let price = null;
  if (priceElement) {
    const priceText = await priceElement.textContent();
    price = extractPrice(priceText);
  }
  
  const linkElement = await card.$('a');
  const url = linkElement ? await linkElement.getAttribute('href') : null;
  
  return {
    title: title?.trim(),
    price,
    url: url ? (url.startsWith('http') ? url : `https://newvendor.com${url}`) : null
  };
}

function extractPrice(priceText) {
  if (!priceText) return null;
  const cleaned = priceText.replace(/[£$€,]/g, '').trim();
  const match = cleaned.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}

function isValidSovereign(title) {
  if (!title) return false;
  const lowerTitle = title.toLowerCase();
  return lowerTitle.includes('sovereign') && 
         !lowerTitle.includes('bar') && 
         !lowerTitle.includes('ingot');
}

async function handleCookieConsent(page) {
  try {
    const cookieSelectors = [
      '#onetrust-accept-btn-handler',
      '.accept-cookies',
      '.cookie-accept'
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
    // Cookie consent might not exist
  }
}
```

### 2. Update Main Index
Add to `src/index.js`:

```javascript
import { scrapeNewVendor } from './scrapers/newvendor.js';

// Add to scrapeAllVendors function:
const newVendorResults = await scrapeNewVendor(browser);
results.push(...newVendorResults);

// Add to scrapeVendor function:
case 'newvendor':
  return await scrapeNewVendor(browser);
```

### 3. Test the New Scraper
```bash
node src/index.js newvendor
```

## Common Issues and Solutions

### Issue: No products found
**Solution:** Check if the website structure has changed
1. Use Codegen to inspect the current selectors
2. Update the selectors in your scraper
3. Test with a simple page load first

### Issue: Timeout errors
**Solution:** Increase timeout values
```javascript
await page.waitForSelector('.product-grid', { timeout: 20000 }); // Increase from 10000
```

### Issue: Cloudflare blocking
**Solution:** The scraper includes user agent spoofing, but you might need to:
1. Add more realistic browser behavior
2. Add delays between requests
3. Use proxy rotation (advanced)

### Issue: Price not extracted
**Solution:** Check the price format and update extraction logic
```javascript
// Add new price format handling
const newFormatMatch = cleaned.match(/new-format-([\d.]+)/);
if (newFormatMatch) {
  return parseFloat(newFormatMatch[1]);
}
```

## Debug Mode

To see what's happening in the browser:

```javascript
const browser = await chromium.launch({ 
  headless: false, // Set to false for debugging
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

## Deployment on Railway

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add scraper"
   git push
   ```

2. **Deploy on Railway:**
   - Connect your GitHub repository
   - Set start command: `npm start`
   - Deploy

3. **Monitor logs:**
   - Check Railway logs for any errors
   - Verify the scraper is running in headless mode

## Best Practices

1. **Always use `waitForSelector`** before interacting with elements
2. **Handle cookie consent** automatically
3. **Use multiple selectors** for robustness
4. **Add error handling** for individual products
5. **Test with small samples** first
6. **Use realistic user agents** to avoid detection
7. **Add delays** between requests if needed
8. **Validate extracted data** before returning

## Example Output

```json
[
  {
    "title": "2023 Full Sovereign",
    "price": 625.10,
    "url": "https://www.bullionbypost.co.uk/gold-coins/full-sovereign-gold-coin/2023-full-sovereign",
    "vendor": "BullionByPost"
  },
  {
    "title": "2022 Half Sovereign",
    "price": 312.50,
    "url": "https://www.chards.co.uk/gold-coins/half-sovereign-gold-coins/2022-half-sovereign",
    "vendor": "Chards"
  }
]
``` 