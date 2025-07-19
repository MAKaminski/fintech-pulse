const AnalyticsDashboard = require('./analytics-dashboard');

async function main() {
  const dashboard = new AnalyticsDashboard();
  
  try {
    await dashboard.initialize();
    await dashboard.showDashboard();
  } catch (error) {
    console.error('❌ Error starting analytics dashboard:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main }; 