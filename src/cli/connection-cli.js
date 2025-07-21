#!/usr/bin/env node

const LinkedInConnections = require('./linkedin-connections');
const readline = require('readline');

class ConnectionCLI {
  constructor() {
    this.connections = new LinkedInConnections();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('🔗 LinkedIn Connection Manager');
    console.log('=============================\n');

    const stats = this.connections.getConnectionStats();
    console.log('📊 Current Stats:');
    console.log(`   Daily connections: ${stats.dailyCount}/${stats.dailyLimit}`);
    console.log(`   Weekly connections: ${stats.weeklyCount}/${stats.weeklyLimit}`);
    console.log(`   Total connections: ${stats.totalConnections}`);
    console.log(`   Can send more: ${stats.canSendMore ? '✅ Yes' : '❌ No'}\n`);

    await this.showMenu();
  }

  async showMenu() {
    console.log('Choose an option:');
    console.log('1. Connect with single company');
    console.log('2. Run multi-company campaign');
    console.log('3. Schedule recurring campaign');
    console.log('4. View connection history');
    console.log('5. Test connection limits');
    console.log('6. Exit');

    const choice = await this.question('\nEnter your choice (1-6): ');

    switch (choice) {
      case '1':
        await this.singleCompanyCampaign();
        break;
      case '2':
        await this.multiCompanyCampaign();
        break;
      case '3':
        await this.scheduleCampaign();
        break;
      case '4':
        await this.viewHistory();
        break;
      case '5':
        await this.testLimits();
        break;
      case '6':
        console.log('👋 Goodbye!');
        this.rl.close();
        return;
      default:
        console.log('❌ Invalid choice. Please try again.\n');
        await this.showMenu();
    }
  }

  async singleCompanyCampaign() {
    console.log('\n🏢 Single Company Connection Campaign');
    console.log('====================================');

    const companyName = await this.question('Enter company name: ');
    const maxConnections = parseInt(await this.question('Max connections to send (default 20): ')) || 20;
    const useBrowser = (await this.question('Use browser automation? (y/n, default y): ')).toLowerCase() !== 'n';

    console.log(`\n🚀 Starting campaign for ${companyName}...`);
    console.log(`   Max connections: ${maxConnections}`);
    console.log(`   Method: ${useBrowser ? 'Browser automation' : 'API'}`);

    const confirm = await this.question('\nProceed? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Campaign cancelled.\n');
      await this.showMenu();
      return;
    }

    try {
      await this.connections.connectWithCompanyEmployees(companyName, maxConnections, useBrowser);
    } catch (error) {
      console.error('❌ Campaign failed:', error.message);
    }

    console.log('\n✅ Campaign completed!\n');
    await this.showMenu();
  }

  async multiCompanyCampaign() {
    console.log('\n🎯 Multi-Company Connection Campaign');
    console.log('===================================');

    const companiesInput = await this.question('Enter company names (comma-separated): ');
    const companies = companiesInput.split(',').map(c => c.trim()).filter(c => c);
    
    const maxConnectionsPerCompany = parseInt(await this.question('Max connections per company (default 20): ')) || 20;

    console.log('\n📋 Companies to process:');
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company}`);
    });
    console.log(`\n   Max connections per company: ${maxConnectionsPerCompany}`);

    const confirm = await this.question('\nProceed? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Campaign cancelled.\n');
      await this.showMenu();
      return;
    }

    try {
      await this.connections.runMultiCompanyCampaign(companies, maxConnectionsPerCompany);
    } catch (error) {
      console.error('❌ Campaign failed:', error.message);
    }

    console.log('\n✅ Campaign completed!\n');
    await this.showMenu();
  }

  async scheduleCampaign() {
    console.log('\n📅 Schedule Recurring Campaign');
    console.log('==============================');

    const companiesInput = await this.question('Enter company names (comma-separated): ');
    const companies = companiesInput.split(',').map(c => c.trim()).filter(c => c);
    
    console.log('\nSchedule options:');
    console.log('1. Daily (9 AM)');
    console.log('2. Weekly (Monday 9 AM)');
    console.log('3. Bi-weekly (1st & 15th, 9 AM)');
    
    const scheduleChoice = await this.question('\nChoose schedule (1-3): ');
    let schedule;
    switch (scheduleChoice) {
      case '1':
        schedule = 'daily';
        break;
      case '2':
        schedule = 'weekly';
        break;
      case '3':
        schedule = 'biweekly';
        break;
      default:
        console.log('❌ Invalid choice. Using daily schedule.');
        schedule = 'daily';
    }

    console.log(`\n📅 Scheduling ${schedule} campaign for:`);
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company}`);
    });

    const confirm = await this.question('\nProceed? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Scheduling cancelled.\n');
      await this.showMenu();
      return;
    }

    try {
      await this.connections.scheduleConnectionCampaign(companies, schedule);
      console.log('✅ Campaign scheduled successfully!');
      console.log('💡 The campaign will run automatically according to the schedule.');
      console.log('   To stop the campaign, restart the application.');
    } catch (error) {
      console.error('❌ Scheduling failed:', error.message);
    }

    console.log('\n');
    await this.showMenu();
  }

  async viewHistory() {
    console.log('\n📊 Connection History');
    console.log('====================');

    const history = this.connections.connectionHistory;
    
    if (history.connections.length === 0) {
      console.log('No connections sent yet.');
    } else {
      console.log(`Total connections sent: ${history.connections.length}\n`);
      
      // Show recent connections
      const recent = history.connections.slice(-10);
      console.log('Recent connections:');
      recent.forEach((conn, index) => {
        const date = new Date(conn.timestamp).toLocaleDateString();
        const name = conn.name || conn.personId || 'Unknown';
        const company = conn.company || 'N/A';
        console.log(`   ${index + 1}. ${name} (${company}) - ${date}`);
      });

      // Show daily stats
      console.log('\nDaily connection counts:');
      Object.entries(history.dailyCount)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 7)
        .forEach(([date, count]) => {
          console.log(`   ${date}: ${count} connections`);
        });
    }

    console.log('\n');
    await this.showMenu();
  }

  async testLimits() {
    console.log('\n🧪 Test Connection Limits');
    console.log('========================');

    const stats = this.connections.getConnectionStats();
    
    console.log('Current limits:');
    console.log(`   Daily limit: ${stats.dailyLimit}`);
    console.log(`   Weekly limit: ${stats.weeklyLimit}`);
    console.log(`   Current daily: ${stats.dailyCount}`);
    console.log(`   Current weekly: ${stats.weeklyCount}`);
    console.log(`   Can send more: ${stats.canSendMore ? '✅ Yes' : '❌ No'}`);

    if (stats.canSendMore) {
      const remainingDaily = stats.dailyLimit - stats.dailyCount;
      const remainingWeekly = stats.weeklyLimit - stats.weeklyCount;
      console.log(`\nRemaining capacity:`);
      console.log(`   Daily: ${remainingDaily} connections`);
      console.log(`   Weekly: ${remainingWeekly} connections`);
    }

    console.log('\n');
    await this.showMenu();
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.length > 0) {
  // Command line mode
  const connections = new LinkedInConnections();
  
  switch (args[0]) {
    case 'connect':
      if (args.length < 2) {
        console.log('Usage: node connection-cli.js connect <company_name> [max_connections]');
        process.exit(1);
      }
      const company = args[1];
      const maxConn = parseInt(args[2]) || 20;
      connections.connectWithCompanyEmployees(company, maxConn)
        .then(() => {
          console.log('✅ Connection campaign completed');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Campaign failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'campaign':
      if (args.length < 2) {
        console.log('Usage: node connection-cli.js campaign <company1,company2,...> [max_per_company]');
        process.exit(1);
      }
      const companies = args[1].split(',').map(c => c.trim());
      const maxPerCompany = parseInt(args[2]) || 20;
      connections.runMultiCompanyCampaign(companies, maxPerCompany)
        .then(() => {
          console.log('✅ Multi-company campaign completed');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Campaign failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'stats':
      const stats = connections.getConnectionStats();
      console.log('📊 Connection Statistics:');
      console.log(JSON.stringify(stats, null, 2));
      process.exit(0);
      break;
      
    default:
      console.log('Available commands:');
      console.log('  connect <company> [max_connections] - Connect with single company');
      console.log('  campaign <companies> [max_per_company] - Multi-company campaign');
      console.log('  stats - Show connection statistics');
      process.exit(1);
  }
} else {
  // Interactive mode
  const cli = new ConnectionCLI();
  cli.start().catch(error => {
    console.error('❌ CLI error:', error.message);
    process.exit(1);
  });
} 