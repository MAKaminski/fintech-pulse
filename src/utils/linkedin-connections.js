const axios = require('axios');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const config = require('../config');

class LinkedInConnections {
  constructor() {
    this.accessToken = this.loadAccessToken();
    this.baseURL = 'https://api.linkedin.com/v2';
    this.connectionLogPath = 'connection_log.json';
    this.rateLimitDelay = 5000; // 5 seconds between requests
    this.maxConnectionsPerDay = 100; // LinkedIn's recommended limit
    this.maxConnectionsPerWeek = 500;
    this.connectionHistory = this.loadConnectionHistory();
  }

  loadAccessToken() {
    try {
      if (fs.existsSync('access_token.txt')) {
        return fs.readFileSync('access_token.txt', 'utf8').trim();
      }
      return null;
    } catch (error) {
      console.error('Error loading access token:', error);
      return null;
    }
  }

  loadConnectionHistory() {
    try {
      if (fs.existsSync(this.connectionLogPath)) {
        return JSON.parse(fs.readFileSync(this.connectionLogPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading connection history:', error);
    }
    return {
      connections: [],
      dailyCount: {},
      weeklyCount: {},
      lastReset: new Date().toISOString().split('T')[0]
    };
  }

  saveConnectionHistory() {
    try {
      fs.writeFileSync(this.connectionLogPath, JSON.stringify(this.connectionHistory, null, 2));
    } catch (error) {
      console.error('Error saving connection history:', error);
    }
  }

  getToday() {
    return new Date().toISOString().split('T')[0];
  }

  getWeekStart() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  canSendConnection() {
    const today = this.getToday();
    const weekStart = this.getWeekStart();

    // Reset counters if it's a new day/week
    if (this.connectionHistory.lastReset !== today) {
      this.connectionHistory.dailyCount[today] = 0;
      this.connectionHistory.lastReset = today;
    }

    if (!this.connectionHistory.weeklyCount[weekStart]) {
      this.connectionHistory.weeklyCount[weekStart] = 0;
    }

    const dailyCount = this.connectionHistory.dailyCount[today] || 0;
    const weeklyCount = this.connectionHistory.weeklyCount[weekStart] || 0;

    return dailyCount < this.maxConnectionsPerDay && weeklyCount < this.maxConnectionsPerWeek;
  }

  async searchPeopleByCompany(companyName, limit = 50) {
    try {
      console.log(`🔍 Searching for people at ${companyName}...`);
      
      // LinkedIn API endpoint for people search
      const searchQuery = encodeURIComponent(`"${companyName}"`);
      const url = `${this.baseURL}/people/search?q=people&keywords=${searchQuery}&count=${limit}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      return response.data.elements || [];
    } catch (error) {
      console.error(`❌ Error searching for people at ${companyName}:`, error.response?.data || error.message);
      return [];
    }
  }

  async sendConnectionRequest(personId, message = null) {
    try {
      if (!this.canSendConnection()) {
        console.log('⚠️  Daily/weekly connection limit reached');
        return false;
      }

      console.log(`📤 Sending connection request to ${personId}...`);

      const invitationData = {
        invitee: {
          'com.linkedin.voyager.growth.invitation.InviteeProfile': {
            profileId: personId
          }
        },
        message: message || "Hi! I'd love to connect and learn more about your work in the industry.",
        trackingId: `invitation_${Date.now()}`
      };

      const response = await axios.post(`${this.baseURL}/invitations`, invitationData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      // Update connection history
      const today = this.getToday();
      const weekStart = this.getWeekStart();
      
      this.connectionHistory.dailyCount[today] = (this.connectionHistory.dailyCount[today] || 0) + 1;
      this.connectionHistory.weeklyCount[weekStart] = (this.connectionHistory.weeklyCount[weekStart] || 0) + 1;
      
      this.connectionHistory.connections.push({
        personId,
        timestamp: new Date().toISOString(),
        status: 'sent'
      });

      this.saveConnectionHistory();

      console.log(`✅ Connection request sent to ${personId}`);
      return true;

    } catch (error) {
      console.error(`❌ Error sending connection request to ${personId}:`, error.response?.data || error.message);
      return false;
    }
  }

  async searchAndConnectViaBrowser(companyName, maxConnections = 20) {
    console.log(`🌐 Using browser automation to connect with ${companyName} employees...`);
    
    let browser;
    try {
      // Launch browser with more robust settings
      browser = await puppeteer.launch({
        headless: false, // Set to true for production
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        timeout: 60000,
        protocolTimeout: 60000
      });

      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Set viewport
      await page.setViewport({ width: 1280, height: 720 });
      
      // Enable request interception to handle potential issues
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
          request.abort();
        } else {
          request.continue();
        }
      });

      // Navigate to LinkedIn with error handling
      console.log('🔗 Navigating to LinkedIn...');
      await page.goto('https://www.linkedin.com/login', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait for user to login manually (for security)
      console.log('🔐 Please login to LinkedIn in the browser window...');
      console.log('   You have 5 minutes to complete the login...');
      
      try {
        await page.waitForSelector('.global-nav', { timeout: 300000 }); // 5 minutes timeout
        console.log('✅ Login detected, proceeding with search...');
      } catch (error) {
        console.log('⚠️  Login timeout or not detected. Please ensure you are logged in.');
        console.log('   Continuing anyway...');
      }

      // Search for company employees with better error handling
      const searchUrl = `https://www.linkedin.com/search/results/people/?keywords="${encodeURIComponent(companyName)}"&origin=GLOBAL_SEARCH_HEADER`;
      console.log(`🔍 Searching for ${companyName} employees...`);
      
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait for search results with multiple selector attempts
      let searchResultsSelector = null;
      const possibleSelectors = [
        '.search-results-container',
        '.search-results',
        '[data-test-search-results]',
        '.artdeco-list'
      ];
      
      for (const selector of possibleSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 10000 });
          searchResultsSelector = selector;
          console.log(`✅ Found search results using selector: ${selector}`);
          break;
        } catch (error) {
          console.log(`⚠️  Selector ${selector} not found, trying next...`);
        }
      }
      
      if (!searchResultsSelector) {
        console.log('❌ Could not find search results. LinkedIn may have changed their layout.');
        return;
      }
      
      let connectionsSent = 0;
      const processedProfiles = new Set();
      let pageNumber = 1;

      while (connectionsSent < maxConnections && pageNumber <= 5) { // Limit to 5 pages
        console.log(`📄 Processing page ${pageNumber}...`);
        
        // Wait for page to load
        await page.waitForTimeout(3000);
        
        // Get all profile cards with multiple selector attempts
        let profileCards = [];
        const cardSelectors = [
          '.search-result__info',
          '.search-result',
          '[data-test-search-result]',
          '.artdeco-entity-lockup'
        ];
        
        for (const selector of cardSelectors) {
          try {
            profileCards = await page.$$(selector);
            if (profileCards.length > 0) {
              console.log(`✅ Found ${profileCards.length} profile cards using selector: ${selector}`);
              break;
            }
          } catch (error) {
            console.log(`⚠️  Selector ${selector} failed, trying next...`);
          }
        }
        
        if (profileCards.length === 0) {
          console.log('❌ No profile cards found on this page');
          break;
        }
        
        for (const card of profileCards) {
          if (connectionsSent >= maxConnections) break;
          
          try {
            // Check if already connected or has connect button with multiple attempts
            let connectButton = null;
            const buttonSelectors = [
              'button[aria-label*="Connect"]',
              'button[aria-label*="connect"]',
              'button[data-control-name="connect"]',
              '.artdeco-button[aria-label*="Connect"]'
            ];
            
            for (const selector of buttonSelectors) {
              try {
                connectButton = await card.$(selector);
                if (connectButton) break;
              } catch (error) {
                continue;
              }
            }
            
            if (!connectButton) {
              console.log('   ⏭️  No connect button found, skipping...');
              continue;
            }

            // Get profile name for logging
            let name = 'Unknown';
            const nameSelectors = [
              '.search-result__title',
              '.search-result__title-link',
              'h3',
              '.artdeco-entity-lockup__title'
            ];
            
            for (const selector of nameSelectors) {
              try {
                const nameElement = await card.$(selector);
                if (nameElement) {
                  name = await nameElement.evaluate(el => el.textContent.trim());
                  break;
                }
              } catch (error) {
                continue;
              }
            }
            
            // Check if we've already processed this profile
            let profileId = null;
            try {
              profileId = await card.evaluate(el => 
                el.getAttribute('data-entity-urn') || 
                el.closest('[data-entity-urn]')?.getAttribute('data-entity-urn') ||
                el.getAttribute('data-test-search-result') ||
                Date.now().toString()
              );
            } catch (error) {
              profileId = Date.now().toString();
            }
            
            if (processedProfiles.has(profileId)) {
              console.log(`   ⏭️  Already processed ${name}, skipping...`);
              continue;
            }
            
            processedProfiles.add(profileId);

            console.log(`   📤 Attempting to connect with ${name}...`);

            // Click connect button
            await connectButton.click();
            await page.waitForTimeout(2000);

            // Check if a modal appears for custom message
            const modalSelectors = [
              '.artdeco-modal',
              '.modal',
              '[role="dialog"]',
              '.artdeco-modal__content'
            ];
            
            let modal = null;
            for (const selector of modalSelectors) {
              try {
                modal = await page.$(selector);
                if (modal) break;
              } catch (error) {
                continue;
              }
            }
            
            if (modal) {
              // Add a note if possible
              const noteButtonSelectors = [
                'button[aria-label="Add a note"]',
                'button[aria-label="add a note"]',
                'button[data-control-name="add_note"]'
              ];
              
              for (const selector of noteButtonSelectors) {
                try {
                  const noteButton = await page.$(selector);
                  if (noteButton) {
                    await noteButton.click();
                    await page.waitForTimeout(1000);
                    break;
                  }
                } catch (error) {
                  continue;
                }
              }
              
              // Find and fill message textarea
              const messageSelectors = [
                'textarea[name="message"]',
                'textarea[placeholder*="message"]',
                'textarea[aria-label*="message"]'
              ];
              
              for (const selector of messageSelectors) {
                try {
                  const noteInput = await page.$(selector);
                  if (noteInput) {
                    const message = `Hi! I'm interested in connecting with ${companyName} professionals. Would love to learn more about your work!`;
                    await noteInput.type(message);
                    await page.waitForTimeout(1000);
                    break;
                  }
                } catch (error) {
                  continue;
                }
              }

              // Send the invitation
              const sendButtonSelectors = [
                'button[aria-label="Send now"]',
                'button[aria-label="send now"]',
                'button[data-control-name="send_invite"]',
                '.artdeco-button--primary'
              ];
              
              for (const selector of sendButtonSelectors) {
                try {
                  const sendButton = await page.$(selector);
                  if (sendButton) {
                    await sendButton.click();
                    connectionsSent++;
                    console.log(`   ✅ Sent connection request to ${name} at ${companyName}`);
                    
                    // Update connection history
                    const today = this.getToday();
                    const weekStart = this.getWeekStart();
                    
                    this.connectionHistory.dailyCount[today] = (this.connectionHistory.dailyCount[today] || 0) + 1;
                    this.connectionHistory.weeklyCount[weekStart] = (this.connectionHistory.weeklyCount[weekStart] || 0) + 1;
                    
                    this.connectionHistory.connections.push({
                      name,
                      company: companyName,
                      timestamp: new Date().toISOString(),
                      status: 'sent'
                    });

                    this.saveConnectionHistory();
                    break;
                  }
                } catch (error) {
                  continue;
                }
              }
            }

            // Rate limiting
            const delay = Math.random() * (this.rateLimitDelay - 2000) + 2000;
            console.log(`   ⏳ Waiting ${Math.round(delay/1000)} seconds...`);
            await page.waitForTimeout(delay);

          } catch (error) {
            console.error(`   ❌ Error processing profile:`, error.message);
            continue;
          }
        }

        // Try to go to next page if available
        const nextButtonSelectors = [
          'button[aria-label="Next"]',
          'button[aria-label="next"]',
          '.artdeco-pagination__button--next',
          '[data-test-pagination-next-btn]'
        ];
        
        let nextButton = null;
        for (const selector of nextButtonSelectors) {
          try {
            nextButton = await page.$(selector);
            if (nextButton) break;
          } catch (error) {
            continue;
          }
        }
        
        if (nextButton) {
          console.log('   ➡️  Moving to next page...');
          await nextButton.click();
          await page.waitForTimeout(3000);
          pageNumber++;
        } else {
          console.log('   📄 No more pages available');
          break;
        }
      }

      console.log(`🎉 Successfully sent ${connectionsSent} connection requests to ${companyName} employees`);

    } catch (error) {
      console.error('❌ Error during browser automation:', error);
      console.error('   This might be due to LinkedIn changes or network issues.');
      console.error('   Try running the API-based method instead.');
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (error) {
          console.log('⚠️  Error closing browser:', error.message);
        }
      }
    }
  }

  async connectWithCompanyEmployees(companyName, maxConnections = 20, useBrowser = true) {
    console.log(`🚀 Starting connection campaign for ${companyName}`);
    
    if (!this.canSendConnection()) {
      console.log('⚠️  Connection limits reached for today/week');
      return;
    }

    if (useBrowser) {
      try {
        await this.searchAndConnectViaBrowser(companyName, maxConnections);
      } catch (error) {
        console.log('⚠️  Browser automation failed, falling back to API method...');
        console.log('   Note: API method has limited functionality but is more reliable.');
        
        // Fallback to API method
        const people = await this.searchPeopleByCompany(companyName, maxConnections);
        
        if (people.length === 0) {
          console.log('❌ No people found via API method either');
          return;
        }
        
        console.log(`📊 Found ${people.length} people via API, attempting connections...`);
        
        let connectionsSent = 0;
        for (const person of people) {
          if (!this.canSendConnection()) {
            console.log('⚠️  Connection limits reached');
            break;
          }

          try {
            const success = await this.sendConnectionRequest(person.id);
            if (success) {
              connectionsSent++;
              console.log(`✅ Sent connection request to ${person.firstName || 'Unknown'} ${person.lastName || ''}`);
              await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            }
          } catch (error) {
            console.error(`❌ Error connecting with ${person.firstName || 'Unknown'}:`, error.message);
          }
        }
        
        console.log(`🎉 API fallback completed: ${connectionsSent} connections sent`);
      }
    } else {
      // API-based approach (limited functionality)
      const people = await this.searchPeopleByCompany(companyName, maxConnections);
      
      for (const person of people) {
        if (!this.canSendConnection()) {
          console.log('⚠️  Connection limits reached');
          break;
        }

        const success = await this.sendConnectionRequest(person.id);
        if (success) {
          await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        }
      }
    }
  }

  async runMultiCompanyCampaign(companies, maxConnectionsPerCompany = 20) {
    console.log('🎯 Starting multi-company connection campaign...');
    
    for (const company of companies) {
      console.log(`\n📋 Processing ${company}...`);
      
      if (!this.canSendConnection()) {
        console.log('⚠️  Connection limits reached, stopping campaign');
        break;
      }

      await this.connectWithCompanyEmployees(company, maxConnectionsPerCompany);
      
      // Wait between companies to avoid being flagged
      console.log('⏳ Waiting 10 minutes before next company...');
      await new Promise(resolve => setTimeout(resolve, 600000));
    }
    
    console.log('✅ Multi-company campaign completed');
  }

  getConnectionStats() {
    const today = this.getToday();
    const weekStart = this.getWeekStart();
    
    const dailyCount = this.connectionHistory.dailyCount[today] || 0;
    const weeklyCount = this.connectionHistory.weeklyCount[weekStart] || 0;
    const totalConnections = this.connectionHistory.connections.length;
    
    return {
      dailyCount,
      weeklyCount,
      totalConnections,
      dailyLimit: this.maxConnectionsPerDay,
      weeklyLimit: this.maxConnectionsPerWeek,
      canSendMore: this.canSendConnection()
    };
  }

  async scheduleConnectionCampaign(companies, schedule = 'daily') {
    console.log(`📅 Scheduling connection campaign for: ${companies.join(', ')}`);
    
    const cron = require('node-cron');
    
    // Schedule based on preference
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
      default:
        cronExpression = '0 9 * * *'; // Default to daily
    }

    cron.schedule(cronExpression, async () => {
      console.log('🕐 Running scheduled connection campaign...');
      await this.runMultiCompanyCampaign(companies);
    });

    console.log(`✅ Connection campaign scheduled for ${schedule} execution`);
  }
}

module.exports = LinkedInConnections; 