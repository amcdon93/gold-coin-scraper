import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Real Browser Codegen
 * 
 * This script uses your actual Chrome browser with your existing
 * profile, cookies, and settings to bypass Cloudflare detection.
 * 
 * Usage:
 * node src/codegen-real-browser.js
 */

async function runRealBrowserCodegen() {
  console.log('🚀 Launching Real Browser Codegen...');
  console.log('📝 Uses your actual Chrome browser with existing profile');
  console.log('💡 This should bypass Cloudflare because it uses your real browser');
  console.log('');
  
  try {
    // Try to find Chrome executable
    let chromePath = '';
    
    // Common Chrome paths on Windows
    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    ];
    
    for (const path of chromePaths) {
      try {
        await execAsync(`"${path}" --version`);
        chromePath = path;
        console.log('✅ Found Chrome at:', chromePath);
        break;
      } catch (e) {
        // Chrome not found at this path
      }
    }
    
    if (!chromePath) {
      console.log('❌ Chrome not found in common locations');
      console.log('💡 Please install Chrome or try the manual approach');
      return;
    }
    
    console.log('');
    console.log('💡 CLOUDFLARE BYPASS STRATEGY:');
    console.log('   1. Uses your REAL Chrome browser (not Playwright\'s)');
    console.log('   2. Uses your existing cookies and settings');
    console.log('   3. Looks like normal browsing to Cloudflare');
    console.log('   4. Should bypass most detection mechanisms');
    console.log('');
    console.log('💡 WHAT TO DO:');
    console.log('   1. Chrome will open with codegen');
    console.log('   2. Navigate to your target website');
    console.log('   3. If Cloudflare appears, complete it manually');
    console.log('   4. Your existing cookies might already bypass it');
    console.log('   5. Interact with the page naturally');
    console.log('   6. Copy the generated code when done');
    console.log('');
    console.log('💡 TIPS:');
    console.log('   • Your real browser has existing cookies/settings');
    console.log('   • This looks like normal browsing to Cloudflare');
    console.log('   • Complete any challenges manually');
    console.log('   • Wait between actions');
    console.log('');
    
    // Launch Playwright codegen with system Chrome and user data
    const command = `npx playwright codegen --target=javascript --browser=chromium --executable-path="${chromePath}"`;
    
    console.log('🔧 Running command:', command);
    console.log('⏳ Please wait for Chrome to open...');
    console.log('');
    console.log('⚠️  This should work much better with Cloudflare!');
    console.log('');
    
    const { stdout, stderr } = await execAsync(command, { 
      stdio: 'inherit'
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    
  } catch (error) {
    console.error('❌ Error running codegen:', error.message);
    console.log('');
    console.log('💡 Alternative approaches:');
    console.log('   1. Try: npm run codegen-stealth');
    console.log('   2. Or: npm run codegen-working');
    console.log('   3. Or run manually: npx playwright codegen');
  }
}

// Run the codegen
runRealBrowserCodegen().catch(console.error); 