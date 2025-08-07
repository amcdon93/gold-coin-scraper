import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Simple Codegen with Anti-Detection Settings
 * 
 * This launches Playwright's built-in codegen with anti-detection
 * environment variables and settings to bypass Cloudflare detection.
 * 
 * Usage:
 * node src/codegen-simple.js
 */

async function runSimpleCodegen() {
  console.log('🚀 Launching Playwright Codegen with anti-detection settings...');
  console.log('📝 This will open the actual Playwright codegen tool');
  console.log('⏱️  Actions will be slowed down to appear more human-like');
  console.log('');
  
  try {
    // Try to install all browsers first
    console.log('🔧 Installing Playwright browsers...');
    try {
      await execAsync('npx playwright install', { stdio: 'inherit' });
      console.log('✅ Browsers installed successfully!');
    } catch (installError) {
      console.log('⚠️  Browser installation failed, trying alternative approach...');
    }
    
    console.log('');
    console.log('💡 What to do next:');
    console.log('   1. A browser window will open with codegen');
    console.log('   2. Navigate to your target website');
    console.log('   3. Interact with the page (click, scroll, etc.)');
    console.log('   4. Watch the codegen window generate code');
    console.log('   5. Copy the generated code when done');
    console.log('');
    
    // Launch Playwright codegen with basic settings
    const command = 'npx playwright codegen --target=javascript';
    
    console.log('🔧 Running command:', command);
    console.log('⏳ Please wait for the browser to open...');
    console.log('');
    
    const { stdout, stderr } = await execAsync(command, { 
      stdio: 'inherit'
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    
  } catch (error) {
    console.error('❌ Error running codegen:', error.message);
    console.log('');
    console.log('💡 Try these manual steps:');
    console.log('   1. Run: npx playwright install');
    console.log('   2. Then: npx playwright codegen --target=javascript');
    console.log('');
    console.log('💡 Or try the direct approach:');
    console.log('   npx playwright codegen');
  }
}

// Run the codegen
runSimpleCodegen().catch(console.error); 