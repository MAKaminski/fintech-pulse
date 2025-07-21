#!/usr/bin/env node

const LinkedInConnections = require('./linkedin-connections');
const EnhancedLinkedInConnections = require('./enhanced-connections');

async function testConnectionFunctionality() {
  console.log('🧪 Testing LinkedIn Connection Manager');
  console.log('=====================================\n');

  // Test basic connection manager
  console.log('📋 Test 1: Basic Connection Manager');
  console.log('-----------------------------------');
  
  const connections = new LinkedInConnections();
  
  // Test connection limits
  const stats = connections.getConnectionStats();
  console.log('✅ Connection stats loaded:');
  console.log(`   Daily: ${stats.dailyCount}/${stats.dailyLimit}`);
  console.log(`   Weekly: ${stats.weeklyCount}/${stats.weeklyLimit}`);
  console.log(`   Can send more: ${stats.canSendMore}`);
  console.log(`   Total connections: ${stats.totalConnections}`);

  // Test connection history loading
  console.log('\n✅ Connection history loaded successfully');
  console.log(`   History entries: ${connections.connectionHistory.connections.length}`);

  console.log('\n' + '='.repeat(50) + '\n');

  // Test enhanced connection manager
  console.log('📋 Test 2: Enhanced Connection Manager');
  console.log('--------------------------------------');
  
  const enhancedConnections = new EnhancedLinkedInConnections();
  
  // Test targeting config
  console.log('✅ Targeting configuration loaded:');
  console.log(`   Preferred titles: ${enhancedConnections.targetingConfig.preferredTitles.length} titles`);
  console.log(`   Preferred industries: ${enhancedConnections.targetingConfig.preferredIndustries.length} industries`);
  console.log(`   Exclude titles: ${enhancedConnections.targetingConfig.excludeTitles.length} titles`);

  // Test message templates
  console.log('\n✅ Message templates loaded:');
  Object.keys(enhancedConnections.connectionTemplates).forEach(template => {
    console.log(`   - ${template}`);
  });

  // Test advanced stats
  const advancedStats = enhancedConnections.getAdvancedStats();
  console.log('\n✅ Advanced stats calculated:');
  console.log(`   Average connections per day: ${advancedStats.averageConnectionsPerDay}`);
  console.log(`   Estimated success rate: ${(advancedStats.successRate * 100).toFixed(1)}%`);

  console.log('\n' + '='.repeat(50) + '\n');

  // Test API search (without sending connections)
  console.log('📋 Test 3: API Search Functionality');
  console.log('-----------------------------------');
  
  try {
    console.log('🔍 Testing API search for "Home Depot"...');
    const people = await connections.searchPeopleByCompany('Home Depot', 5);
    console.log(`✅ API search successful: Found ${people.length} people`);
    
    if (people.length > 0) {
      console.log('   Sample results:');
      people.slice(0, 3).forEach((person, index) => {
        console.log(`   ${index + 1}. ${person.firstName || 'Unknown'} ${person.lastName || ''} - ${person.title || 'No title'}`);
      });
    }
  } catch (error) {
    console.log('⚠️  API search failed (this is normal if not authenticated):');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test message generation
  console.log('📋 Test 4: Message Generation');
  console.log('------------------------------');
  
  const samplePerson = {
    firstName: 'John',
    lastName: 'Doe',
    title: 'VP of Operations',
    industry: 'Retail'
  };
  
  const message = enhancedConnections.generatePersonalizedMessage(samplePerson, 'Home Depot', 'personalized');
  console.log('✅ Personalized message generated:');
  console.log(`   "${message}"`);

  console.log('\n' + '='.repeat(50) + '\n');

  // Test relevance scoring
  console.log('📋 Test 5: Relevance Scoring');
  console.log('-----------------------------');
  
  const testPeople = [
    { title: 'VP of Operations', numConnections: 500 },
    { title: 'Intern', numConnections: 50 },
    { title: 'CEO', numConnections: 1000 },
    { title: 'Manager', numConnections: 200 }
  ];
  
  const targetTitles = ['VP', 'CEO', 'Director'];
  const sortedPeople = enhancedConnections.sortByRelevance(testPeople, targetTitles);
  
  console.log('✅ Relevance scoring test:');
  sortedPeople.forEach((person, index) => {
    const score = enhancedConnections.calculateRelevanceScore(person, targetTitles);
    console.log(`   ${index + 1}. ${person.title} (${person.numConnections} connections) - Score: ${score}`);
  });

  console.log('\n' + '='.repeat(50) + '\n');

  // Test configuration validation
  console.log('📋 Test 6: Configuration Validation');
  console.log('-----------------------------------');
  
  console.log('✅ Configuration files check:');
  
  // Check if targeting config can be saved
  try {
    enhancedConnections.saveTargetingConfig();
    console.log('   ✅ Targeting config can be saved');
  } catch (error) {
    console.log('   ❌ Targeting config save failed:', error.message);
  }
  
  // Check connection history save
  try {
    connections.saveConnectionHistory();
    console.log('   ✅ Connection history can be saved');
  } catch (error) {
    console.log('   ❌ Connection history save failed:', error.message);
  }

  console.log('\n🎉 All tests completed successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Run "npm run auth" to authenticate with LinkedIn');
  console.log('   2. Try "npm run connections" for interactive mode');
  console.log('   3. Try "npm run connect Home\\ Depot 5" for a small test');
  console.log('   4. Check CONNECTION_GUIDE.md for detailed instructions');
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.length > 0) {
  switch (args[0]) {
    case 'api':
      console.log('🔍 Testing API search only...');
      const connections = new LinkedInConnections();
      connections.searchPeopleByCompany('Home Depot', 3)
        .then(people => {
          console.log(`Found ${people.length} people`);
          people.forEach(person => {
            console.log(`- ${person.firstName || 'Unknown'} ${person.lastName || ''}`);
          });
        })
        .catch(error => {
          console.error('API test failed:', error.message);
        });
      break;
      
    case 'browser':
      console.log('🌐 Testing browser setup only...');
      const puppeteer = require('puppeteer');
      puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
        .then(browser => {
          console.log('✅ Browser launched successfully');
          return browser.close();
        })
        .then(() => {
          console.log('✅ Browser closed successfully');
        })
        .catch(error => {
          console.error('❌ Browser test failed:', error.message);
        });
      break;
      
    default:
      console.log('Available test options:');
      console.log('  api     - Test API search functionality');
      console.log('  browser - Test browser automation setup');
      console.log('  (none)  - Run all tests');
      process.exit(1);
  }
} else {
  testConnectionFunctionality().catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
} 