# 🚀 Playwright Codegen Guide

## ✅ Working Solution

The codegen is now working! Here's how to use it:

### Quick Start
```bash
npm run codegen-working
```

### Manual Command (if needed)
```bash
npx playwright codegen --target=javascript
```

## 📝 How to Use Codegen

1. **Run the command** - Two windows will open
2. **Browser window** - Navigate to your target website
3. **Codegen window** - Shows generated JavaScript code in real-time
4. **Interact with the page** - Click, scroll, type, etc.
5. **Copy the code** - From the codegen window when done

## 🛡️ Cloudflare Tips

When using codegen on sites with Cloudflare protection:

- ✅ **Complete challenges manually** - Don't let automation handle them
- ✅ **Wait between actions** - Give the page time to load
- ✅ **Move mouse naturally** - Don't make sudden movements
- ✅ **Scroll occasionally** - This makes you appear more human
- ✅ **Don't click too rapidly** - Space out your interactions

## 📋 Example Workflow

1. Run `npm run codegen-working`
2. Navigate to `https://example-vendor.com/gold-coins`
3. Complete any Cloudflare challenges manually
4. Click on a product to see details
5. Watch the codegen window generate code like:
   ```javascript
   await page.goto('https://example-vendor.com/gold-coins');
   await page.click('.product-link');
   await page.waitForSelector('.product-title');
   ```
6. Copy the generated code and use it in your scraper

## 🔧 Available Commands

- `npm run codegen-working` - **Recommended** (working solution)
- `npm run codegen-simple` - Alternative with browser install
- `npm run codegen-manual` - Shows manual instructions
- `npm run codegen` - Default Playwright codegen

## 🎯 Next Steps

1. Use codegen to generate scraping logic for your target websites
2. Copy the generated code into your scraper files
3. Modify the selectors and logic as needed
4. Test your scraper with the generated code

## 💡 Pro Tips

- **Save your work** - Copy code frequently as you generate it
- **Test selectors** - Make sure the generated selectors work reliably
- **Add waits** - The generated code includes `waitForSelector` which is good
- **Handle errors** - Add try-catch blocks around the generated code

---

**The codegen is now working perfectly! 🎉** 