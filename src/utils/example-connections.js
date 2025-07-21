#!/usr/bin/env node

const EnhancedLinkedInConnections = require('./enhanced-connections');

async function runExample() {
  console.log('🔗 LinkedIn Connection Manager - Example Usage');
  console.log('==============================================\n');

  const connections = new EnhancedLinkedInConnections();

  // Example 1: Basic single company connection
  console.log('📋 Example 1: Basic Home Depot Connection Campaign');
  console.log('--------------------------------------------------');
  
  try {
    await connections.smartConnectionCampaign('Home Depot', {
      maxConnections: 20,
      targetTitles: ['VP', 'Director', 'Manager', 'Senior Manager'],
      targetIndustries: ['Retail', 'Financial Services', 'Operations'],
      messageTemplate: 'personalized',
      useBrowser: true
    });
  } catch (error) {
    console.error('❌ Example 1 failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 2: Multi-company campaign with targeting
  console.log('📋 Example 2: Multi-Company Campaign (Home Depot, Bain, BCG)');
  console.log('------------------------------------------------------------');
  
  const targetCompanies = ['Home Depot', 'Bain', 'BCG'];
  
  try {
    await connections.runTargetedMultiCompanyCampaign(targetCompanies, {
      maxConnectionsPerCompany: 25,
      targetTitles: [
        'Partner', 'Principal', 'VP', 'Director', 'Senior Manager',
        'Associate', 'Consultant', 'Analyst'
      ],
      targetIndustries: [
        'Consulting', 'Financial Services', 'Private Equity',
        'Venture Capital', 'Investment Banking'
      ],
      messageTemplate: 'consulting',
      useBrowser: true
    });
  } catch (error) {
    console.error('❌ Example 2 failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 3: Advanced targeting for specific roles
  console.log('📋 Example 3: Executive-Level Targeting');
  console.log('----------------------------------------');
  
  try {
    await connections.smartConnectionCampaign('Bain', {
      maxConnections: 15,
      targetTitles: ['Partner', 'Principal', 'Senior Partner'],
      targetIndustries: ['Consulting', 'Private Equity'],
      messageTemplate: 'executive',
      useBrowser: true
    });
  } catch (error) {
    console.error('❌ Example 3 failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 4: Show statistics
  console.log('📋 Example 4: Connection Statistics');
  console.log('-----------------------------------');
  
  const stats = connections.getAdvancedStats();
  console.log('📊 Current Connection Statistics:');
  console.log(`   Daily connections: ${stats.dailyCount}/${stats.dailyLimit}`);
  console.log(`   Weekly connections: ${stats.weeklyCount}/${stats.weeklyLimit}`);
  console.log(`   Total connections: ${stats.totalConnections}`);
  console.log(`   Average per day: ${stats.averageConnectionsPerDay}`);
  console.log(`   Estimated success rate: ${(stats.successRate * 100).toFixed(1)}%`);
  
  if (stats.companyBreakdown && Object.keys(stats.companyBreakdown).length > 0) {
    console.log('\n   Company breakdown:');
    Object.entries(stats.companyBreakdown)
      .sort(([,a], [,b]) => b - a)
      .forEach(([company, count]) => {
        console.log(`     ${company}: ${count} connections`);
      });
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 5: Schedule a recurring campaign
  console.log('📋 Example 5: Schedule Recurring Campaign');
  console.log('-----------------------------------------');
  
  console.log('💡 This would schedule a weekly campaign for the target companies.');
  console.log('   Uncomment the code below to enable scheduling.');
  
  /*
  try {
    await connections.scheduleSmartCampaign(targetCompanies, 'weekly', {
      maxConnectionsPerCompany: 20,
      targetTitles: ['VP', 'Director', 'Manager'],
      messageTemplate: 'personalized'
    });
    console.log('✅ Campaign scheduled successfully!');
  } catch (error) {
    console.error('❌ Scheduling failed:', error.message);
  }
  */

  console.log('\n🎉 Examples completed!');
  console.log('\n💡 Tips for success:');
  console.log('   - Start with smaller numbers (10-20 per company)');
  console.log('   - Monitor your connection history regularly');
  console.log('   - Adjust targeting based on acceptance rates');
  console.log('   - Use personalized messages for better results');
  console.log('   - Respect LinkedIn\'s rate limits and best practices');
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.length > 0) {
  switch (args[0]) {
    case 'homedepot':
      console.log('🏠 Running Home Depot example...');
      const connections = new EnhancedLinkedInConnections();
      connections.smartConnectionCampaign('Home Depot', {
        maxConnections: parseInt(args[1]) || 20,
        targetTitles: ['VP', 'Director', 'Manager'],
        messageTemplate: 'personalized'
      });
      break;
      
    case 'bain':
      console.log('💼 Running Bain example...');
      const connections2 = new EnhancedLinkedInConnections();
      connections2.smartConnectionCampaign('Bain', {
        maxConnections: parseInt(args[1]) || 20,
        targetTitles: ['Partner', 'Principal', 'Associate'],
        messageTemplate: 'consulting'
      });
      break;
      
    case 'bcg':
      console.log('🏢 Running BCG example...');
      const connections3 = new EnhancedLinkedInConnections();
      connections3.smartConnectionCampaign('BCG', {
        maxConnections: parseInt(args[1]) || 20,
        targetTitles: ['Partner', 'Principal', 'Associate'],
        messageTemplate: 'consulting'
      });
      break;
      
    case 'all':
      runExample();
      break;
      
    default:
      console.log('Available examples:');
      console.log('  homedepot [count] - Connect with Home Depot employees');
      console.log('  bain [count]      - Connect with Bain employees');
      console.log('  bcg [count]       - Connect with BCG employees');
      console.log('  all               - Run all examples');
      process.exit(1);
  }
} else {
  runExample();
} 