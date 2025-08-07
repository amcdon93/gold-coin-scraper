console.log('🚀 Debug test starting...');

import { chromium } from 'playwright';

console.log('✅ Import successful');

async function debugTest() {
  console.log('🔧 Starting debug test...');
  
  try {
    console.log('🔧 Launching browser...');
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✅ Browser launched');
    
    const page = await browser.newPage();
    console.log('✅ Page created');
    
    await page.goto('https://httpbin.org/user-agent');
    console.log('✅ Navigated to test page');
    
    const title = await page.title();
    console.log('✅ Page title:', title);
    
    await browser.close();
    console.log('✅ Browser closed');
    
    console.log('🎉 Debug test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in debug test:', error);
  }
}

debugTest().catch(console.error); 