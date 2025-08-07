import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Working Codegen Script
 * 
 * This script uses the proven approach that works with the installed browsers.
 * 
 * Usage:
 * node src/codegen-working.js
 */

async function runWorkingCodegen() {
  console.log('🚀 Launching Working Playwright Codegen...');
  console.log('📝 This uses the proven approach that works!');
  console.log('');
  
  try {
    // Launch Playwright codegen with the working command
    const command = 'npx playwright codegen --target=javascript';
    
    console.log('🔧 Running command:', command);
    console.log('⏳ Please wait for the browser to open...');
    console.log('');
    console.log('💡 What to do next:');
    console.log('   1. Two windows will open');
    console.log('   2. Browser window: Navigate to your target website');
    console.log('   3. Codegen window: Shows generated code in real-time');
    console.log('   4. Interact with the page (click, scroll, etc.)');
    console.log('   5. Copy the generated code when done');
    console.log('');
    console.log('💡 Tips for Cloudflare:');
    console.log('   • Complete any challenges manually');
    console.log('   • Wait between actions');
    console.log('   • Move mouse naturally');
    console.log('   • Scroll occasionally');
    console.log('');
    
    const { stdout, stderr } = await execAsync(command, { 
      stdio: 'inherit'
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    
  } catch (error) {
    console.error('❌ Error running codegen:', error.message);
    console.log('');
    console.log('💡 Try installing browsers first:');
    console.log('   npx playwright install --force');
    console.log('');
    console.log('💡 Then run manually:');
    console.log('   npx playwright codegen --target=javascript');
  }
}

// Run the codegen
runWorkingCodegen().catch(console.error); 