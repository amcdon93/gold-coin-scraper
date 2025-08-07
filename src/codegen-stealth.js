import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Stealth Codegen with Manual Cloudflare Handling
 * 
 * This uses the working Playwright codegen but provides better
 * instructions for handling Cloudflare challenges manually.
 * 
 * Usage:
 * node src/codegen-stealth.js
 */

async function runStealthCodegen() {
  console.log('🚀 Launching Stealth Codegen...');
  console.log('📝 Uses working Playwright codegen with manual Cloudflare handling');
  console.log('');
  
  try {
    console.log('💡 CLOUDFLARE HANDLING STRATEGY:');
    console.log('   1. When you see Cloudflare challenges, complete them MANUALLY');
    console.log('   2. Wait for the page to fully load after completing challenges');
    console.log('   3. Then start interacting with the page for codegen');
    console.log('   4. The codegen will record your actions AFTER you pass Cloudflare');
    console.log('');
    console.log('💡 STEP-BY-STEP PROCESS:');
    console.log('   1. Two windows will open (browser + codegen)');
    console.log('   2. Navigate to your target website');
    console.log('   3. Complete any Cloudflare challenges manually');
    console.log('   4. Wait for the page to fully load');
    console.log('   5. Start clicking/interacting with the page');
    console.log('   6. Watch the codegen window generate code');
    console.log('   7. Copy the generated code when done');
    console.log('');
    console.log('💡 CLOUDFLARE BYPASS TIPS:');
    console.log('   • Complete challenges manually (don\'t let automation handle them)');
    console.log('   • Wait 5-10 seconds after completing challenges');
    console.log('   • Move your mouse naturally');
    console.log('   • Scroll the page occasionally');
    console.log('   • Don\'t click too rapidly');
    console.log('   • If blocked, wait 30 seconds before retrying');
    console.log('');
    
    // Launch Playwright codegen with the working command
    const command = 'npx playwright codegen --target=javascript';
    
    console.log('🔧 Running command:', command);
    console.log('⏳ Please wait for the browser to open...');
    console.log('');
    console.log('⚠️  IMPORTANT: Complete Cloudflare challenges manually first!');
    console.log('');
    
    const { stdout, stderr } = await execAsync(command, { 
      stdio: 'inherit'
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    
  } catch (error) {
    console.error('❌ Error running codegen:', error.message);
    console.log('');
    console.log('💡 Try the manual approach:');
    console.log('   npx playwright codegen --target=javascript');
  }
}

// Run the codegen
runStealthCodegen().catch(console.error); 