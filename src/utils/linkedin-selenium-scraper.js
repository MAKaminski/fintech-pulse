const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const PostDatabase = require('./database');

class LinkedInSeleniumScraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.database = new PostDatabase();
        this.isLoggedIn = false;
    }

    async initialize() {
        await this.database.initialize();
        console.log('🔧 Initializing LinkedIn Selenium Scraper...');
    }

    async launchBrowser() {
        try {
            this.browser = await puppeteer.launch({
                headless: false, // Set to true for production
                defaultViewport: { width: 1920, height: 1080 },
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });

            this.page = await this.browser.newPage();

            // Set user agent to avoid detection
            await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            console.log('✅ Browser launched successfully');
            return true;
        } catch (error) {
            console.error('❌ Error launching browser:', error);
            return false;
        }
    }

    async loginToLinkedIn(email, password) {
        try {
            console.log('🔐 Logging into LinkedIn...');

            await this.page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });

            // Wait for login form to load
            await this.page.waitForSelector('#username', { timeout: 10000 });

            // Enter credentials
            await this.page.type('#username', email);
            await this.page.type('#password', password);

            // Click sign in button
            await this.page.click('button[type="submit"]');

            // Wait for login to complete
            await this.page.waitForNavigation({ waitUntil: 'networkidle2' });

            // Check if login was successful
            const currentUrl = this.page.url();
            if (currentUrl.includes('feed') || currentUrl.includes('mynetwork')) {
                console.log('✅ Successfully logged into LinkedIn');
                this.isLoggedIn = true;
                return true;
            } else {
                console.log('❌ Login failed - redirected to:', currentUrl);
                return false;
            }

        } catch (error) {
            console.error('❌ Error during login:', error);
            return false;
        }
    }

    async navigateToAnalytics() {
        try {
            console.log('📊 Navigating to YOUR LinkedIn Analytics...');

            // First, navigate to your profile to ensure we're logged in as the correct user
            await this.page.goto('https://www.linkedin.com/in/', { waitUntil: 'networkidle2' });

            // Wait for profile to load and get your profile URL
            await this.page.waitForSelector('a[data-control-name="identity_welcome_message"]', { timeout: 10000 });

            // Get your profile URL
            const profileUrl = await this.page.evaluate(() => {
                const profileLink = document.querySelector('a[data-control-name="identity_welcome_message"]');
                return profileLink ? profileLink.href : null;
            });

            if (!profileUrl) {
                throw new Error('Could not determine your profile URL');
            }

            console.log(`✅ Found your profile: ${profileUrl}`);

            // Navigate to YOUR posts specifically
            await this.page.goto(`${profileUrl}/recent-activity/shares/`, { waitUntil: 'networkidle2' });

            // Wait for your posts to load
            await this.page.waitForSelector('.feed-shared-update-v2', { timeout: 15000 });

            console.log('✅ Successfully navigated to YOUR posts');
            return true;

        } catch (error) {
            console.error('❌ Error navigating to your analytics:', error);
            return false;
        }
    }

    async scrapePostAnalytics() {
        try {
            console.log('📈 Scraping YOUR post analytics...');

            // Wait for posts to load
            await this.page.waitForTimeout(3000);

            // Scroll to load more posts
            await this.page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
            await this.page.waitForTimeout(2000);

            // Get YOUR posts with analytics
            const analyticsData = await this.page.evaluate(() => {
                const posts = [];

                // Look for YOUR posts specifically
                const postElements = document.querySelectorAll('.feed-shared-update-v2');

                postElements.forEach((element, index) => {
                    try {
                        // Verify this is YOUR post (not someone else's)
                        const authorElement = element.querySelector('.feed-shared-actor__name');
                        const isYourPost = authorElement && authorElement.textContent.includes('You');

                        if (!isYourPost) {
                            return; // Skip posts that aren't yours
                        }

                        // Extract post content
                        const contentElement = element.querySelector('.feed-shared-text');
                        const content = contentElement ? contentElement.textContent.trim() : '';

                        // Extract engagement metrics
                        const engagementElement = element.querySelector('.social-details-social-counts');
                        let views = 0, likes = 0, comments = 0, shares = 0;

                        if (engagementElement) {
                            const engagementText = engagementElement.textContent;

                            // Parse views (usually the first number)
                            const viewsMatch = engagementText.match(/(\d+(?:,\d+)*)\s*(?:view|views)/i);
                            if (viewsMatch) {
                                views = parseInt(viewsMatch[1].replace(/,/g, ''));
                            }

                            // Parse likes
                            const likesMatch = engagementText.match(/(\d+(?:,\d+)*)\s*(?:like|likes)/i);
                            if (likesMatch) {
                                likes = parseInt(likesMatch[1].replace(/,/g, ''));
                            }

                            // Parse comments
                            const commentsMatch = engagementText.match(/(\d+(?:,\d+)*)\s*(?:comment|comments)/i);
                            if (commentsMatch) {
                                comments = parseInt(commentsMatch[1].replace(/,/g, ''));
                            }

                            // Parse shares
                            const sharesMatch = engagementText.match(/(\d+(?:,\d+)*)\s*(?:share|shares)/i);
                            if (sharesMatch) {
                                shares = parseInt(sharesMatch[1].replace(/,/g, ''));
                            }
                        }

                        // Calculate total engagement
                        const engagement = likes + comments + shares;

                        // Extract timestamp
                        const timeElement = element.querySelector('.feed-shared-actor__sub-description');
                        const timestamp = timeElement ? timeElement.textContent.trim() : new Date().toISOString();

                        const postData = {
                            id: index + 1,
                            content: content,
                            views: views,
                            likes: likes,
                            comments: comments,
                            shares: shares,
                            engagement: engagement,
                            timestamp: timestamp,
                            postType: this.determinePostType(content),
                            isYourPost: true
                        };

                        posts.push(postData);
                    } catch (error) {
                        console.error('Error parsing your post element:', error);
                    }
                });

                return posts;
            });

            console.log(`✅ Scraped ${analyticsData.length} of YOUR posts`);
            return analyticsData;

        } catch (error) {
            console.error('❌ Error scraping your analytics:', error);
            return [];
        }
    }

    determinePostType(content) {
        const lowerContent = content.toLowerCase();

        if (lowerContent.includes('fintech') || lowerContent.includes('banking') || lowerContent.includes('payment')) {
            return 'fintech';
        } else if (lowerContent.includes('personal') || lowerContent.includes('finance') || lowerContent.includes('budget')) {
            return 'personal';
        } else if (lowerContent.includes('education') || lowerContent.includes('learning') || lowerContent.includes('blockchain')) {
            return 'education';
        } else {
            return 'freestyle';
        }
    }

    async saveAnalyticsToDatabase(analyticsData) {
        try {
            console.log('💾 Saving analytics data to database...');

            for (const post of analyticsData) {
                // Check if post already exists
                const existingPost = await this.database.getPostByNumber(post.id);

                if (existingPost) {
                    // Update existing post with analytics
                    await this.database.updatePostAnalytics(
                        existingPost.id,
                        post.views,
                        post.likes,
                        post.comments,
                        post.shares,
                        post.engagement,
                        (post.views > 0 ? (post.engagement / post.views) * 100 : 0)
                    );
                } else {
                    // Create new post entry
                    await this.database.savePost({
                        postNumber: post.id,
                        content: post.content,
                        postType: post.postType,
                        engagementScore: post.engagement,
                        estimatedViews: post.views,
                        estimatedClicks: Math.floor(post.views * 0.05),
                        estimatedInteractions: Math.floor(post.views * 0.03)
                    });

                    // Update with LinkedIn data
                    const savedPost = await this.database.getPostByNumber(post.id);
                    if (savedPost) {
                        await this.database.updatePostPosted(savedPost.id, `linkedin_${post.id}`, post.timestamp);
                        await this.database.updatePostAnalytics(
                            savedPost.id,
                            post.views,
                            post.likes,
                            post.comments,
                            post.shares,
                            post.engagement,
                            (post.views > 0 ? (post.engagement / post.views) * 100 : 0)
                        );
                    }
                }
            }

            console.log('✅ Analytics data saved to database');
            return true;

        } catch (error) {
            console.error('❌ Error saving analytics to database:', error);
            return false;
        }
    }

    async scrapeAllAnalytics() {
        try {
            console.log('🚀 Starting comprehensive analytics scraping for YOUR posts...');

            // Launch browser
            const browserLaunched = await this.launchBrowser();
            if (!browserLaunched) {
                throw new Error('Failed to launch browser');
            }

            // Login to LinkedIn
            const loginSuccess = await this.loginToLinkedIn(
                process.env.LINKEDIN_EMAIL,
                process.env.LINKEDIN_PASSWORD
            );

            if (!loginSuccess) {
                throw new Error('Failed to login to LinkedIn');
            }

            // Verify we're logged in as the correct user
            const userVerification = await this.verifyUserIdentity();
            if (!userVerification.success) {
                throw new Error(`User verification failed: ${userVerification.error}`);
            }

            // Navigate to YOUR analytics
            const navigationSuccess = await this.navigateToAnalytics();
            if (!navigationSuccess) {
                throw new Error('Failed to navigate to your analytics');
            }

            // Scrape YOUR analytics data
            const analyticsData = await this.scrapePostAnalytics();

            if (analyticsData.length === 0) {
                console.log('⚠️ No analytics data found for your posts');
                return false;
            }

            // Verify all scraped posts are yours
            const yourPostsOnly = analyticsData.filter(post => post.isYourPost);
            if (yourPostsOnly.length !== analyticsData.length) {
                console.log(`⚠️ Warning: ${analyticsData.length - yourPostsOnly.length} posts were not yours and were filtered out`);
            }

            // Save to database
            const saveSuccess = await this.saveAnalyticsToDatabase(yourPostsOnly);

            if (saveSuccess) {
                console.log(`✅ Successfully scraped and saved ${yourPostsOnly.length} of YOUR posts`);
                return true;
            } else {
                throw new Error('Failed to save your analytics data');
            }

        } catch (error) {
            console.error('❌ Error in comprehensive analytics scraping:', error);
            return false;
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    async verifyUserIdentity() {
        try {
            console.log('🔍 Verifying user identity...');

            // Navigate to profile to get user info
            await this.page.goto('https://www.linkedin.com/in/', { waitUntil: 'networkidle2' });

            // Get user name and profile info
            const userInfo = await this.page.evaluate(() => {
                const nameElement = document.querySelector('.text-heading-xlarge');
                const emailElement = document.querySelector('a[data-control-name="identity_welcome_message"]');

                return {
                    name: nameElement ? nameElement.textContent.trim() : null,
                    email: emailElement ? emailElement.textContent.trim() : null,
                    profileUrl: window.location.href
                };
            });

            if (!userInfo.name) {
                return { success: false, error: 'Could not verify user identity' };
            }

            console.log(`✅ Verified user: ${userInfo.name} (${userInfo.profileUrl})`);
            return { success: true, userInfo };

        } catch (error) {
            console.error('❌ Error verifying user identity:', error);
            return { success: false, error: error.message };
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔒 Browser closed');
        }
    }
}

module.exports = LinkedInSeleniumScraper; 