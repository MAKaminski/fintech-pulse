#!/usr/bin/env node

const AnalyticsScheduler = require('../utils/analytics-scheduler');
const LinkedInSeleniumScraper = require('../utils/linkedin-selenium-scraper');
const LinkedInAnalytics = require('../utils/linkedin-analytics');
const PostDatabase = require('../utils/database');

class AnalyticsCollectorCLI {
    constructor() {
        this.scheduler = new AnalyticsScheduler();
        this.scraper = new LinkedInSeleniumScraper();
        this.analytics = new LinkedInAnalytics();
        this.database = new PostDatabase();
    }

    async initialize() {
        await this.database.initialize();
        await this.scraper.initialize();
        await this.analytics.initialize();
        console.log('✅ Analytics Collector CLI initialized');
    }

    async showMenu() {
        console.log('\n📊 YOUR LinkedIn Analytics Collector');
        console.log('=====================================');
        console.log('1. Run LinkedIn API Analytics Collection (YOUR posts)');
        console.log('2. Run Selenium Analytics Scraper (YOUR posts)');
        console.log('3. Run Full Analytics Collection (YOUR posts)');
        console.log('4. Start Daily Analytics Scheduler (YOUR posts)');
        console.log('5. Start Hourly Analytics Scheduler (YOUR posts)');
        console.log('6. View Current Analytics Data (YOUR posts)');
        console.log('7. Generate Analytics Report (YOUR posts)');
        console.log('8. Setup LinkedIn Credentials');
        console.log('9. Exit');
        console.log('=====================================');
    }

    async runLinkedInAPI() {
        console.log('\n🔍 Running LinkedIn API Analytics Collection for YOUR posts...');

        try {
            const success = await this.scheduler.tryLinkedInAPI();

            if (success) {
                console.log('✅ LinkedIn API analytics collection for YOUR posts completed successfully');
            } else {
                console.log('❌ LinkedIn API analytics collection for YOUR posts failed');
            }
        } catch (error) {
            console.error('❌ Error running LinkedIn API collection for YOUR posts:', error);
        }
    }

    async runSeleniumScraper() {
        console.log('\n🤖 Running Selenium Analytics Scraper for YOUR posts...');

        try {
            const success = await this.scraper.scrapeAllAnalytics();

            if (success) {
                console.log('✅ Selenium analytics scraping for YOUR posts completed successfully');
            } else {
                console.log('❌ Selenium analytics scraping for YOUR posts failed');
            }
        } catch (error) {
            console.error('❌ Error running Selenium scraper for YOUR posts:', error);
        }
    }

    async runFullCollection() {
        console.log('\n🚀 Running Full Analytics Collection...');

        try {
            await this.scheduler.runAnalyticsCollection();
            console.log('✅ Full analytics collection completed');
        } catch (error) {
            console.error('❌ Error running full analytics collection:', error);
        }
    }

    async startDailyScheduler() {
        console.log('\n📅 Starting Daily Analytics Scheduler...');

        try {
            await this.scheduler.initialize();
            this.scheduler.startDailySchedule();
            console.log('✅ Daily scheduler started (runs at 2:00 AM EST)');
            console.log('Press Ctrl+C to stop the scheduler');

            // Keep the process running
            process.on('SIGINT', () => {
                console.log('\n🛑 Stopping scheduler...');
                this.scheduler.stop();
                process.exit(0);
            });

        } catch (error) {
            console.error('❌ Error starting daily scheduler:', error);
        }
    }

    async startHourlyScheduler() {
        console.log('\n📅 Starting Hourly Analytics Scheduler...');

        try {
            await this.scheduler.initialize();
            this.scheduler.startHourlySchedule();
            console.log('✅ Hourly scheduler started (runs every hour)');
            console.log('Press Ctrl+C to stop the scheduler');

            // Keep the process running
            process.on('SIGINT', () => {
                console.log('\n🛑 Stopping scheduler...');
                this.scheduler.stop();
                process.exit(0);
            });

        } catch (error) {
            console.error('❌ Error starting hourly scheduler:', error);
        }
    }

    async viewCurrentAnalytics() {
        console.log('\n📊 Current Analytics Data:');
        console.log('==========================');

        try {
            const posts = await this.database.getPostsWithLinkedInIds();

            if (posts.length === 0) {
                console.log('No posts with LinkedIn analytics found');
                return;
            }

            console.log(`Found ${posts.length} posts with LinkedIn analytics:\n`);

            posts.forEach((post, index) => {
                console.log(`${index + 1}. Post ID: ${post.id}`);
                console.log(`   Content: ${post.content?.substring(0, 100)}...`);
                console.log(`   Views: ${post.actual_views || 0}`);
                console.log(`   Likes: ${post.actual_likes || 0}`);
                console.log(`   Comments: ${post.actual_comments || 0}`);
                console.log(`   Shares: ${post.actual_shares || 0}`);
                console.log(`   Engagement Rate: ${post.actual_engagement_rate || 0}%`);
                console.log(`   Posted: ${post.posted_at || 'Not posted'}`);
                console.log('');
            });

        } catch (error) {
            console.error('❌ Error viewing analytics data:', error);
        }
    }

    async generateReport() {
        console.log('\n📊 Generating Analytics Report...');

        try {
            await this.scheduler.generateAnalyticsReport();
            console.log('✅ Analytics report generated successfully');
        } catch (error) {
            console.error('❌ Error generating analytics report:', error);
        }
    }

    async setupCredentials() {
        console.log('\n🔐 LinkedIn Credentials Setup');
        console.log('============================');
        console.log('To use LinkedIn API, you need to:');
        console.log('1. Create a LinkedIn App at https://www.linkedin.com/developers/');
        console.log('2. Get your Client ID and Client Secret');
        console.log('3. Set up environment variables:');
        console.log('   - LINKEDIN_CLIENT_ID');
        console.log('   - LINKEDIN_CLIENT_SECRET');
        console.log('   - LINKEDIN_EMAIL');
        console.log('   - LINKEDIN_PASSWORD');
        console.log('');
        console.log('For Selenium scraper, you only need:');
        console.log('   - LINKEDIN_EMAIL');
        console.log('   - LINKEDIN_PASSWORD');
        console.log('');
        console.log('Run: npm run auth to set up LinkedIn API authentication');
    }

    async run() {
        await this.initialize();

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askQuestion = (question) => {
            return new Promise((resolve) => {
                rl.question(question, resolve);
            });
        };

        while (true) {
            await this.showMenu();

            const choice = await askQuestion('\nEnter your choice (1-9): ');

            switch (choice.trim()) {
                case '1':
                    await this.runLinkedInAPI();
                    break;
                case '2':
                    await this.runSeleniumScraper();
                    break;
                case '3':
                    await this.runFullCollection();
                    break;
                case '4':
                    await this.startDailyScheduler();
                    break;
                case '5':
                    await this.startHourlyScheduler();
                    break;
                case '6':
                    await this.viewCurrentAnalytics();
                    break;
                case '7':
                    await this.generateReport();
                    break;
                case '8':
                    await this.setupCredentials();
                    break;
                case '9':
                    console.log('👋 Goodbye!');
                    rl.close();
                    process.exit(0);
                    break;
                default:
                    console.log('❌ Invalid choice. Please try again.');
            }

            await askQuestion('\nPress Enter to continue...');
        }
    }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
    const cli = new AnalyticsCollectorCLI();
    cli.run().catch(console.error);
}

module.exports = AnalyticsCollectorCLI; 