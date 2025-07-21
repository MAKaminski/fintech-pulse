const PostScheduler = require('./cli/scheduler');
const config = require('../config');

class FintechPulseAgent {
  constructor() {
    this.scheduler = new PostScheduler();
  }

  async start() {
    console.log('🎯 FintechPulse LinkedIn Agent');
    console.log('================================');
    console.log(`Agent: ${config.agent.name}`);
    console.log(`Purpose: ${config.agent.purpose}`);
    console.log(`Style: ${config.agent.style}`);
    console.log(`Audience: ${config.agent.audience}`);
    console.log('================================\n');

    // Initialize the scheduler
    const initialized = await this.scheduler.initialize();
    if (!initialized) {
      console.error('❌ Failed to initialize scheduler. Please check your LinkedIn credentials.');
      console.log('💡 Run "npm run auth" to re-authenticate with LinkedIn');
      process.exit(1);
    }

    // Start the scheduler
    this.scheduler.start();

    // Keep the process running
    console.log('\n🔄 Agent is running. Press Ctrl+C to stop.');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down FintechPulse agent...');
      this.scheduler.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down FintechPulse agent...');
      this.scheduler.stop();
      process.exit(0);
    });
  }

  // Manual post method for testing
  async manualPost() {
    console.log('🔧 Manual post requested...');
    await this.scheduler.manualPost();
    process.exit(0);
  }

  // Show status
  showStatus() {
    const status = this.scheduler.getStatus();
    console.log('📊 FintechPulse Agent Status');
    console.log('============================');
    console.log(`Running: ${status.isRunning ? '✅ Yes' : '❌ No'}`);
    console.log(`Timezone: ${status.timezone}`);
    console.log(`Morning Post: ${status.morningTime}`);
    console.log(`Evening Post: ${status.eveningTime}`);
    console.log(`Current Time: ${status.currentTime}`);
    console.log('============================');
  }
}

// Main execution
async function main() {
  const agent = new FintechPulseAgent();
  
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--manual-post')) {
    await agent.manualPost();
  } else if (args.includes('--status')) {
    agent.showStatus();
    process.exit(0);
  } else if (args.includes('--help')) {
    console.log('🎯 FintechPulse LinkedIn Agent Commands:');
    console.log('========================================');
    console.log('npm start              - Start the agent with scheduled posting');
    console.log('npm run auth           - Authenticate with LinkedIn');
    console.log('npm run test           - Test a single post');
    console.log('npm run preview        - Generate and preview a single post');
    console.log('npm run preview-multiple - Generate multiple post options');
    console.log('node src/index.js --manual-post  - Post immediately');
    console.log('node src/index.js --status       - Show agent status');
    console.log('node src/index.js --help         - Show this help');
    console.log('========================================');
    process.exit(0);
  } else {
    // Start the agent normally
    await agent.start();
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the application
main().catch(error => {
  console.error('❌ Failed to start FintechPulse agent:', error);
  process.exit(1);
}); 