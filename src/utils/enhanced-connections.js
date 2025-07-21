const LinkedInConnections = require('./linkedin-connections');
const fs = require('fs');
const path = require('path');

class EnhancedLinkedInConnections extends LinkedInConnections {
  constructor() {
    super();
    this.targetingConfig = this.loadTargetingConfig();
    this.connectionTemplates = this.loadConnectionTemplates();
  }

  loadTargetingConfig() {
    try {
      if (fs.existsSync('targeting-config.json')) {
        return JSON.parse(fs.readFileSync('targeting-config.json', 'utf8'));
      }
    } catch (error) {
      console.error('Error loading targeting config:', error);
    }
    
    return {
      preferredTitles: [
        'CEO', 'CTO', 'CFO', 'COO', 'VP', 'Director', 'Manager',
        'Founder', 'Co-Founder', 'Partner', 'Principal', 'Associate',
        'Analyst', 'Consultant', 'Advisor', 'Board Member'
      ],
      preferredIndustries: [
        'Financial Services', 'Technology', 'Consulting', 'Private Equity',
        'Venture Capital', 'Investment Banking', 'Fintech', 'Software',
        'Healthcare', 'Real Estate', 'Manufacturing', 'Retail'
      ],
      companySizes: ['51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10001+'],
      excludeTitles: ['Intern', 'Student', 'Freelancer'],
      maxConnectionsPerCompany: 50,
      connectionDelay: {
        min: 3000,
        max: 8000
      },
      dailyTarget: 100,
      weeklyTarget: 500
    };
  }

  loadConnectionTemplates() {
    return {
      default: "Hi {firstName}! I'm interested in connecting with {company} professionals. Would love to learn more about your work in {industry}!",
      fintech: "Hi {firstName}! I'm passionate about fintech innovation and would love to connect with {company} professionals. Your work in {industry} is fascinating!",
      consulting: "Hi {firstName}! I'm building connections in the consulting space and would love to learn from your experience at {company}. Your insights would be valuable!",
      executive: "Hi {firstName}! I'm connecting with industry leaders and would love to learn from your experience as {title} at {company}. Your perspective would be invaluable!",
      personalized: "Hi {firstName}! I noticed your work at {company} in {industry} and would love to connect. Your experience in {title} is exactly what I'm looking to learn more about!"
    };
  }

  saveTargetingConfig() {
    try {
      fs.writeFileSync('targeting-config.json', JSON.stringify(this.targetingConfig, null, 2));
    } catch (error) {
      console.error('Error saving targeting config:', error);
    }
  }

  async searchWithAdvancedFilters(companyName, filters = {}) {
    console.log(`🔍 Advanced search for ${companyName} with filters...`);
    
    const searchParams = new URLSearchParams({
      q: 'people',
      keywords: `"${companyName}"`,
      count: filters.limit || 100
    });

    // Add title filters
    if (filters.titles && filters.titles.length > 0) {
      searchParams.append('title', filters.titles.join(' OR '));
    }

    // Add industry filters
    if (filters.industries && filters.industries.length > 0) {
      searchParams.append('industry', filters.industries.join(' OR '));
    }

    try {
      const url = `${this.baseURL}/people/search?${searchParams.toString()}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      let results = response.data.elements || [];
      
      // Apply additional client-side filtering
      if (filters.excludeTitles) {
        results = results.filter(person => {
          const title = person.title?.toLowerCase() || '';
          return !filters.excludeTitles.some(exclude => 
            title.includes(exclude.toLowerCase())
          );
        });
      }

      if (filters.minConnections) {
        results = results.filter(person => 
          (person.numConnections || 0) >= filters.minConnections
        );
      }

      console.log(`✅ Found ${results.length} filtered results for ${companyName}`);
      return results;

    } catch (error) {
      console.error(`❌ Error in advanced search for ${companyName}:`, error.response?.data || error.message);
      return [];
    }
  }

  generatePersonalizedMessage(person, companyName, template = 'personalized') {
    const templateText = this.connectionTemplates[template] || this.connectionTemplates.default;
    
    return templateText
      .replace('{firstName}', person.firstName || 'there')
      .replace('{company}', companyName)
      .replace('{industry}', person.industry || 'the industry')
      .replace('{title}', person.title || 'your role');
  }

  async smartConnectionCampaign(companyName, options = {}) {
    console.log(`🧠 Starting smart connection campaign for ${companyName}...`);
    
    const {
      maxConnections = 30,
      targetTitles = this.targetingConfig.preferredTitles,
      targetIndustries = this.targetingConfig.preferredIndustries,
      excludeTitles = this.targetingConfig.excludeTitles,
      minConnections = 50,
      messageTemplate = 'personalized',
      useBrowser = true
    } = options;

    // Search with advanced filters
    const people = await this.searchWithAdvancedFilters(companyName, {
      limit: maxConnections * 2, // Get more results to filter from
      titles: targetTitles,
      industries: targetIndustries,
      excludeTitles,
      minConnections
    });

    if (people.length === 0) {
      console.log(`⚠️  No suitable candidates found for ${companyName}`);
      return;
    }

    // Sort by relevance (title match, connection count, etc.)
    const sortedPeople = this.sortByRelevance(people, targetTitles);
    
    console.log(`📊 Found ${sortedPeople.length} potential connections for ${companyName}`);
    console.log(`🎯 Targeting: ${targetTitles.slice(0, 3).join(', ')}...`);

    let connectionsSent = 0;
    const maxAttempts = Math.min(maxConnections, sortedPeople.length);

    for (let i = 0; i < maxAttempts && connectionsSent < maxConnections; i++) {
      const person = sortedPeople[i];
      
      if (!this.canSendConnection()) {
        console.log('⚠️  Connection limits reached');
        break;
      }

      try {
        const message = this.generatePersonalizedMessage(person, companyName, messageTemplate);
        const success = await this.sendConnectionRequest(person.id, message);
        
        if (success) {
          connectionsSent++;
          console.log(`✅ Sent personalized request to ${person.firstName} ${person.lastName} (${person.title})`);
          
          // Random delay between connections
          const delay = Math.random() * 
            (this.targetingConfig.connectionDelay.max - this.targetingConfig.connectionDelay.min) + 
            this.targetingConfig.connectionDelay.min;
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`❌ Error connecting with ${person.firstName} ${person.lastName}:`, error.message);
      }
    }

    console.log(`🎉 Smart campaign completed: ${connectionsSent} connections sent to ${companyName}`);
  }

  sortByRelevance(people, targetTitles) {
    return people.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, targetTitles);
      const bScore = this.calculateRelevanceScore(b, targetTitles);
      return bScore - aScore;
    });
  }

  calculateRelevanceScore(person, targetTitles) {
    let score = 0;
    const title = person.title?.toLowerCase() || '';
    const connections = person.numConnections || 0;

    // Title relevance
    targetTitles.forEach(targetTitle => {
      if (title.includes(targetTitle.toLowerCase())) {
        score += 10;
      }
    });

    // Connection count (prefer people with more connections)
    if (connections > 500) score += 5;
    else if (connections > 200) score += 3;
    else if (connections > 100) score += 1;

    // Premium indicators
    if (person.premium) score += 2;
    if (person.influencer) score += 3;

    return score;
  }

  async runTargetedMultiCompanyCampaign(companies, options = {}) {
    console.log('🎯 Starting targeted multi-company campaign...');
    
    const {
      maxConnectionsPerCompany = 30,
      targetTitles = this.targetingConfig.preferredTitles,
      targetIndustries = this.targetingConfig.preferredIndustries,
      messageTemplate = 'personalized',
      useBrowser = true
    } = options;

    const results = {
      totalConnections: 0,
      companiesProcessed: 0,
      companiesSkipped: 0,
      errors: []
    };

    for (const company of companies) {
      console.log(`\n📋 Processing ${company}...`);
      
      if (!this.canSendConnection()) {
        console.log('⚠️  Connection limits reached, stopping campaign');
        break;
      }

      try {
        await this.smartConnectionCampaign(company, {
          maxConnections: maxConnectionsPerCompany,
          targetTitles,
          targetIndustries,
          messageTemplate,
          useBrowser
        });
        
        results.companiesProcessed++;
        results.totalConnections += maxConnectionsPerCompany;
        
        // Wait between companies
        console.log('⏳ Waiting 15 minutes before next company...');
        await new Promise(resolve => setTimeout(resolve, 900000));
        
      } catch (error) {
        console.error(`❌ Error processing ${company}:`, error.message);
        results.errors.push({ company, error: error.message });
        results.companiesSkipped++;
      }
    }

    console.log('\n📊 Campaign Summary:');
    console.log(`   Companies processed: ${results.companiesProcessed}`);
    console.log(`   Companies skipped: ${results.companiesSkipped}`);
    console.log(`   Total connections attempted: ${results.totalConnections}`);
    
    if (results.errors.length > 0) {
      console.log('   Errors:');
      results.errors.forEach(error => {
        console.log(`     - ${error.company}: ${error.error}`);
      });
    }

    return results;
  }

  async scheduleSmartCampaign(companies, schedule = 'daily', options = {}) {
    console.log(`📅 Scheduling smart campaign for: ${companies.join(', ')}`);
    
    const cron = require('node-cron');
    
    let cronExpression;
    switch (schedule) {
      case 'daily':
        cronExpression = '0 9 * * *'; // 9 AM daily
        break;
      case 'weekly':
        cronExpression = '0 9 * * 1'; // 9 AM every Monday
        break;
      case 'biweekly':
        cronExpression = '0 9 1,15 * *'; // 9 AM on 1st and 15th
        break;
      case 'business-days':
        cronExpression = '0 9 * * 1-5'; // 9 AM Monday-Friday
        break;
      default:
        cronExpression = '0 9 * * *';
    }

    cron.schedule(cronExpression, async () => {
      console.log('🕐 Running scheduled smart campaign...');
      await this.runTargetedMultiCompanyCampaign(companies, options);
    });

    console.log(`✅ Smart campaign scheduled for ${schedule} execution`);
  }

  getAdvancedStats() {
    const baseStats = this.getConnectionStats();
    const history = this.connectionHistory;
    
    // Calculate additional metrics
    const companyStats = {};
    const titleStats = {};
    
    history.connections.forEach(conn => {
      if (conn.company) {
        companyStats[conn.company] = (companyStats[conn.company] || 0) + 1;
      }
      if (conn.title) {
        titleStats[conn.title] = (titleStats[conn.title] || 0) + 1;
      }
    });

    return {
      ...baseStats,
      companyBreakdown: companyStats,
      titleBreakdown: titleStats,
      averageConnectionsPerDay: this.calculateAverageConnectionsPerDay(),
      successRate: this.calculateSuccessRate()
    };
  }

  calculateAverageConnectionsPerDay() {
    const history = this.connectionHistory;
    const days = Object.keys(history.dailyCount).length;
    return days > 0 ? Math.round(history.connections.length / days) : 0;
  }

  calculateSuccessRate() {
    // This would need to be enhanced with actual acceptance tracking
    // For now, we'll assume a conservative estimate
    return 0.15; // 15% acceptance rate estimate
  }
}

module.exports = EnhancedLinkedInConnections; 