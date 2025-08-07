import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * System Chrome Codegen
 * 
 * This script uses your system's existing Chrome browser instead of
 * Playwright's browsers to avoid Cloudflare detection issues.
 * 
 * Usage:
 * node src/codegen-system-chrome.js
 */

async function runSystemChromeCodegen() {
  console.log('🚀 Launching System Chrome Codegen...');
  console.log('📝 Uses your existing Chrome browser to avoid Cloudflare issues');
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
    console.log('💡 What to do next:');
    console.log('   1. Chrome will open with codegen');
    console.log('   2. Navigate to your target website');
    console.log('   3. Complete any Cloudflare challenges manually');
    console.log('   4. Interact with the page naturally');
    console.log('   5. Copy the generated code when done');
    console.log('');
    console.log('💡 Cloudflare bypass tips:');
    console.log('   • Use your real Chrome browser (less detectable)');
    console.log('   • Complete challenges manually');
    console.log('   • Wait between actions');
    console.log('   • Move mouse naturally');
    console.log('');
    
    // Launch Playwright codegen with system Chrome
    const command = `npx playwright codegen --target=javascript --browser=chromium --executable-path="${chromePath}"`;
    
    console.log('🔧 Running command:', command);
    console.log('⏳ Please wait for Chrome to open...');
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
    console.log('   1. Try: npm run codegen-cloudflare');
    console.log('   2. Or: npm run codegen-working');
    console.log('   3. Or run manually: npx playwright codegen');
  }
}

// Run the codegen
runSystemChromeCodegen().catch(console.error); 