const cron = require('node-cron');
const LinkedInSeleniumScraper = require('./linkedin-selenium-scraper');
const LinkedInAnalytics = require('./linkedin-analytics');
const PostDatabase = require('./database');

class AnalyticsScheduler {
    constructor() {
        this.scraper = new LinkedInSeleniumScraper();
        this.analytics = new LinkedInAnalytics();
        this.database = new PostDatabase();
        this.isRunning = false;
    }

    async initialize() {
        try {
            await this.database.initialize();
            await this.scraper.initialize();
            await this.analytics.initialize();
            console.log('✅ Analytics Scheduler initialized');
        } catch (error) {
            console.error('❌ Error initializing analytics scheduler:', error);
        }
    }

    async runAnalyticsCollection() {
        if (this.isRunning) {
            console.log('⚠️ Analytics collection already running, skipping...');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Starting daily analytics collection...');

        try {
            // First try LinkedIn API (if credentials are available)
            const apiSuccess = await this.tryLinkedInAPI();

            if (!apiSuccess) {
                console.log('📊 LinkedIn API failed, trying Selenium scraper...');
                const scraperSuccess = await this.scraper.scrapeAllAnalytics();

                if (scraperSuccess) {
                    console.log('✅ Analytics collected via Selenium scraper');
                } else {
                    console.log('❌ Both LinkedIn API and Selenium scraper failed');
                }
            } else {
                console.log('✅ Analytics collected via LinkedIn API');
            }

            // Generate analytics report
            await this.generateAnalyticsReport();

        } catch (error) {
            console.error('❌ Error in analytics collection:', error);
        } finally {
            this.isRunning = false;
        }
    }

    async tryLinkedInAPI() {
        try {
            console.log('🔍 Attempting LinkedIn API analytics collection...');

            // Check if we have valid credentials
            const accessToken = this.analytics.loadAccessToken();
            if (!accessToken) {
                console.log('⚠️ No LinkedIn access token found');
                return false;
            }

            // Get all posts from database
            const posts = await this.database.getPostsWithLinkedInIds();

            if (posts.length === 0) {
                console.log('⚠️ No posts with LinkedIn IDs found');
                return false;
            }

            let successCount = 0;

            for (const post of posts) {
                try {
                    if (post.linkedin_post_id) {
                        const analytics = await this.analytics.getPostAnalytics(post.linkedin_post_id);

                        if (!analytics.isMockData) {
                            // Update post with real analytics
                            await this.database.updatePostAnalytics(
                                post.id,
                                analytics.views,
                                analytics.likes,
                                analytics.comments,
                                analytics.shares,
                                analytics.clicks,
                                analytics.engagementRate
                            );
                            successCount++;
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error fetching analytics for post ${post.id}:`, error.message);
                }
            }

            console.log(`✅ Successfully updated ${successCount} posts with real analytics`);
            return successCount > 0;

        } catch (error) {
            console.error('❌ LinkedIn API analytics collection failed:', error);
            return false;
        }
    }

    async generateAnalyticsReport() {
        try {
            console.log('📊 Generating analytics report...');

            const report = await this.analytics.generateAnalyticsReport();

            // Save report to file
            const fs = require('fs');
            const reportPath = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

            console.log(`✅ Analytics report saved to ${reportPath}`);

        } catch (error) {
            console.error('❌ Error generating analytics report:', error);
        }
    }

    startDailySchedule() {
        console.log('📅 Starting daily analytics collection schedule...');

        // Run analytics collection daily at 2:00 AM
        cron.schedule('0 2 * * *', async () => {
            console.log('⏰ Daily analytics collection triggered');
            await this.runAnalyticsCollection();
        }, {
            scheduled: true,
            timezone: "America/New_York"
        });

        // Also run immediately if this is the first time
        this.runAnalyticsCollection();

        console.log('✅ Daily analytics schedule started (runs at 2:00 AM EST)');
    }

    startHourlySchedule() {
        console.log('📅 Starting hourly analytics collection schedule...');

        // Run analytics collection every hour
        cron.schedule('0 * * * *', async () => {
            console.log('⏰ Hourly analytics collection triggered');
            await this.runAnalyticsCollection();
        }, {
            scheduled: true,
            timezone: "America/New_York"
        });

        // Also run immediately
        this.runAnalyticsCollection();

        console.log('✅ Hourly analytics schedule started');
    }

    async runManualCollection() {
        console.log('🔧 Running manual analytics collection...');
        await this.runAnalyticsCollection();
    }

    stop() {
        console.log('🛑 Stopping analytics scheduler...');
        this.isRunning = false;
    }
}

module.exports = AnalyticsScheduler; 