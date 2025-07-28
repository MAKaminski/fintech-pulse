const LinkedInSeleniumScraper = require('./src/utils/linkedin-selenium-scraper');

async function collectLinkedInData() {
    console.log('🔍 Starting LinkedIn data collection for YOUR posts...');

    const scraper = new LinkedInSeleniumScraper();

    try {
        await scraper.initialize();
        const success = await scraper.scrapeAllAnalytics();

        if (success) {
            console.log('✅ Successfully collected your LinkedIn data!');
            console.log('📊 Your posts and analytics are now in the database');
        } else {
            console.log('❌ Failed to collect LinkedIn data');
        }
    } catch (error) {
        console.error('❌ Error collecting LinkedIn data:', error);
    } finally {
        await scraper.close();
    }
}

// Run the collection
collectLinkedInData().catch(console.error); 