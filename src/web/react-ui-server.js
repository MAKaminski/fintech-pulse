const express = require('express');
const path = require('path');
const fs = require('fs');
const UnifiedPostGenerator = require('../cli/unified-post-generator');
const PostDatabase = require('../utils/database');
const LinkedInAPI = require('../utils/linkedin-api');
const LinkedInAnalytics = require('../utils/linkedin-analytics');

class ReactUIServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.unifiedGenerator = new UnifiedPostGenerator();
        this.database = new PostDatabase();
        this.linkedinAPI = new LinkedInAPI();
        this.analytics = new LinkedInAnalytics();

        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Add CORS headers
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });

        // Serve static files from the dist directory (built React app)
        this.app.use(express.static(path.join(__dirname, '../../dist')));

        // Serve images from the images directory
        this.app.use('/api/images', express.static(path.join(__dirname, '../../images')));
    }

    setupRoutes() {
        // API Routes
        this.app.post('/api/generate-post', async (req, res) => {
            try {
                const { type, customPrompt } = req.body;

                console.log(`Generating ${type} post with prompt: ${customPrompt || 'default'}`);

                let result;

                switch (type) {
                    case 'fintech':
                        result = await this.generateFintechPost();
                        break;
                    case 'personal':
                        result = await this.generatePersonalPost();
                        break;
                    case 'michael-davis':
                        result = await this.generateMichaelDavisPost();
                        break;
                    case 'education':
                        result = await this.generateEducationPost();
                        break;
                    case 'qed':
                        result = await this.generateQEDPost();
                        break;
                    case 'freestyle':
                        result = await this.generateFreestylePost(customPrompt);
                        break;
                    default:
                        throw new Error('Invalid post type');
                }

                res.json(result);
            } catch (error) {
                console.error('Error generating post:', error);
                res.status(500).json({
                    error: error.message,
                    success: false
                });
            }
        });

        this.app.post('/api/post-to-linkedin', async (req, res) => {
            try {
                const { content, image } = req.body;

                console.log('Posting to LinkedIn...');

                // Here you would integrate with your LinkedIn API
                // For now, we'll simulate a successful post
                const result = await this.linkedinAPI.postContent(content, image);

                res.json({
                    success: true,
                    message: 'Post published successfully',
                    postId: Date.now().toString()
                });
            } catch (error) {
                console.error('Error posting to LinkedIn:', error);
                res.status(500).json({
                    error: error.message,
                    success: false
                });
            }
        });

        this.app.post('/api/save-post', async (req, res) => {
            try {
                const postData = req.body;

                console.log('Saving post to database...');

                // Save to database
                await this.database.savePost({
                    content: postData.content,
                    type: postData.type,
                    image: postData.image,
                    metrics: postData.metrics,
                    timestamp: new Date().toISOString()
                });

                res.json({
                    success: true,
                    message: 'Post saved successfully'
                });
            } catch (error) {
                console.error('Error saving post:', error);
                res.status(500).json({
                    error: error.message,
                    success: false
                });
            }
        });

        this.app.get('/api/stats', async (req, res) => {
            try {
                const stats = await this.database.getPostStats();
                res.json(stats);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/recent-posts', async (req, res) => {
            try {
                const posts = await this.database.getRecentPosts(10);
                res.json(posts);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Sample data endpoint for testing
        this.app.post('/api/sample-data', async (req, res) => {
            try {
                console.log('📊 Creating sample analytics data...');

                // Ensure database is initialized
                if (!this.database.db) {
                    await this.database.initialize();
                }

                // Create sample posts with analytics data
                const samplePosts = [
                    {
                        post_number: 1,
                        content: "🚀 The fintech revolution is accelerating faster than ever! Digital payments grew 23% YoY, with mobile wallets leading the charge. What's your take on the future of banking? #Fintech #DigitalPayments #Innovation",
                        post_type: 'fintech',
                        linkedin_post_id: 'sample_1',
                        engagement_score: 85,
                        estimated_views: 1500,
                        actual_views: 1800,
                        actual_likes: 45,
                        actual_comments: 12,
                        actual_shares: 8,
                        actual_engagement_rate: 3.61,
                        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
                    },
                    {
                        post_number: 2,
                        content: "💡 Just finished reading about how AI is transforming customer service in banking. The numbers are staggering - 67% reduction in response times! What's your experience with AI-powered banking? #AI #Banking #CustomerService",
                        post_type: 'fintech',
                        linkedin_post_id: 'sample_2',
                        engagement_score: 92,
                        estimated_views: 2000,
                        actual_views: 2400,
                        actual_likes: 72,
                        actual_comments: 18,
                        actual_shares: 15,
                        actual_engagement_rate: 4.38,
                        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
                    },
                    {
                        post_number: 3,
                        content: "🎯 Personal finance tip: Start with the 50/30/20 rule - 50% needs, 30% wants, 20% savings. It's simple but effective! What's your favorite budgeting strategy? #PersonalFinance #Budgeting #FinancialFreedom",
                        post_type: 'personal',
                        linkedin_post_id: 'sample_3',
                        engagement_score: 78,
                        estimated_views: 1200,
                        actual_views: 1100,
                        actual_likes: 33,
                        actual_comments: 8,
                        actual_shares: 5,
                        actual_engagement_rate: 4.18,
                        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
                    },
                    {
                        post_number: 4,
                        content: "📚 Learning about blockchain technology today. The potential for decentralized finance is incredible! Anyone else excited about DeFi? #Blockchain #DeFi #Cryptocurrency",
                        post_type: 'education',
                        linkedin_post_id: 'sample_4',
                        engagement_score: 88,
                        estimated_views: 1800,
                        actual_views: 2200,
                        actual_likes: 66,
                        actual_comments: 14,
                        actual_shares: 12,
                        actual_engagement_rate: 4.18,
                        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
                    },
                    {
                        post_number: 5,
                        content: "🔥 The future of work is here! Remote-first companies are seeing 25% higher productivity. How has remote work changed your professional life? #RemoteWork #FutureOfWork #Productivity",
                        post_type: 'personal',
                        linkedin_post_id: 'sample_5',
                        engagement_score: 95,
                        estimated_views: 2500,
                        actual_views: 3200,
                        actual_likes: 96,
                        actual_comments: 24,
                        actual_shares: 20,
                        actual_engagement_rate: 4.38,
                        timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() // 12 days ago
                    }
                ];

                // Insert sample posts
                for (const post of samplePosts) {
                    await this.database.savePost({
                        postNumber: post.post_number,
                        content: post.content,
                        postType: post.post_type,
                        engagementScore: post.engagement_score,
                        estimatedViews: post.estimated_views,
                        estimatedClicks: Math.floor(post.estimated_views * 0.05),
                        estimatedInteractions: Math.floor(post.estimated_views * 0.03)
                    });

                    // Update with LinkedIn data
                    const savedPost = await this.database.getPostByNumber(post.post_number);
                    if (savedPost) {
                        await this.database.updatePostPosted(savedPost.id, post.linkedin_post_id, post.timestamp);
                        await this.database.updatePostAnalytics(
                            savedPost.id,
                            post.actual_views,
                            post.actual_likes,
                            post.actual_comments,
                            post.actual_shares,
                            Math.floor(post.actual_views * 0.02),
                            post.actual_engagement_rate
                        );
                    }
                }

                console.log('✅ Sample data created successfully');
                res.json({ success: true, message: 'Sample data created successfully' });

            } catch (error) {
                console.error('❌ Error creating sample data:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Debug endpoint to test database queries
        this.app.get('/api/debug-posts', async (req, res) => {
            try {
                console.log('🔍 Debugging posts query...');

                // Ensure database is initialized
                if (!this.database.db) {
                    await this.database.initialize();
                }

                // Test different queries
                const allPosts = await this.database.getRecentPosts(10);
                const linkedInPosts = await this.database.getPostsWithLinkedInIds();

                res.json({
                    allPostsCount: allPosts.length,
                    linkedInPostsCount: linkedInPosts.length,
                    allPosts: allPosts.map(p => ({
                        id: p.id,
                        post_number: p.post_number,
                        linkedin_post_id: p.linkedin_post_id,
                        post_decision: p.post_decision,
                        actual_views: p.actual_views
                    })),
                    linkedInPosts: linkedInPosts.map(p => ({
                        id: p.id,
                        post_number: p.post_number,
                        linkedin_post_id: p.linkedin_post_id,
                        post_decision: p.post_decision,
                        actual_views: p.actual_views
                    }))
                });

            } catch (error) {
                console.error('❌ Error in debug endpoint:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Analytics endpoint - simplified version
        this.app.get('/api/analytics', async (req, res) => {
            try {
                const { timeRange = '30d' } = req.query;
                console.log(`📊 Fetching analytics data for time range: ${timeRange}`);

                // Ensure database is initialized
                if (!this.database.db) {
                    console.log('🔄 Initializing database...');
                    await this.database.initialize();
                }

                // Use the same approach as the working debug endpoint
                console.log('🔍 Getting all posts...');
                const allPosts = await this.database.getRecentPosts(20);
                console.log(`📊 Found ${allPosts.length} total posts`);

                // Filter for posts with LinkedIn IDs and posted status
                const posts = allPosts.filter(p => p.linkedin_post_id && p.post_decision === 'posted');
                console.log(`📊 Filtered to ${posts.length} posts with LinkedIn IDs`);

                if (!posts || posts.length === 0) {
                    console.log('📝 No posts with LinkedIn IDs found, returning empty analytics');
                    return res.json({
                        summary: {
                            totalPosts: 0,
                            totalViews: 0,
                            totalLikes: 0,
                            totalComments: 0,
                            totalShares: 0,
                            avgEngagementRate: 0
                        },
                        performanceByType: {},
                        dayOfWeekPerformance: {},
                        timeOfDayPerformance: {},
                        topPosts: [],
                        recommendations: [{
                            title: 'Start Posting Content',
                            description: 'Begin creating and posting content to generate analytics data and insights.'
                        }]
                    });
                }

                // Filter posts by time range
                const filteredPosts = this.filterPostsByTimeRange(posts, timeRange);
                console.log(`📊 After time filtering: ${filteredPosts.length} posts`);

                // Calculate summary statistics
                const summary = this.calculateSummaryStats(filteredPosts);

                // Calculate performance by post type
                const performanceByType = this.calculatePerformanceByType(filteredPosts);

                // Calculate day of week performance
                const dayOfWeekPerformance = this.calculateDayOfWeekPerformance(filteredPosts);

                // Calculate time of day performance
                const timeOfDayPerformance = this.calculateTimeOfDayPerformance(filteredPosts);

                // Get top performing posts
                const topPosts = this.getTopPerformingPosts(filteredPosts, 5);

                // Generate recommendations
                const recommendations = this.generateRecommendations(filteredPosts, summary);

                const analyticsData = {
                    summary,
                    performanceByType,
                    dayOfWeekPerformance,
                    timeOfDayPerformance,
                    topPosts,
                    recommendations
                };

                res.json(analyticsData);

            } catch (error) {
                console.error('❌ Error fetching analytics:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Serve React app for all other routes
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../../dist/index.html'));
        });
    }

    async generateFintechPost() {
        const content = await this.unifiedGenerator.enhancedGenerator.generateOptimizedPost();
        const image = await this.unifiedGenerator.enhancedGenerator.generateImage(content);
        const metrics = this.unifiedGenerator.enhancedGenerator.calculateEngagementMetrics(content);

        return { content, image, metrics };
    }

    async generatePersonalPost() {
        const content = await this.unifiedGenerator.personalGenerator.generatePersonalPost();
        const image = await this.unifiedGenerator.personalGenerator.generatePersonalImage(content);
        const metrics = this.unifiedGenerator.personalGenerator.calculatePersonalEngagementMetrics(content);

        return { content, image, metrics };
    }

    async generateMichaelDavisPost() {
        const content = await this.unifiedGenerator.michaelDavisGenerator.generatePost();
        const image = await this.unifiedGenerator.michaelDavisGenerator.generateImage(content);
        const metrics = this.unifiedGenerator.enhancedGenerator.calculateEngagementMetrics(content);

        return { content, image, metrics };
    }

    async generateEducationPost() {
        const content = await this.unifiedGenerator.educationGenerator.generateEducationPost();
        const image = await this.unifiedGenerator.educationGenerator.generateImage(content);
        const metrics = this.unifiedGenerator.enhancedGenerator.calculateEngagementMetrics(content);

        return { content, image, metrics };
    }

    async generateQEDPost() {
        const content = await this.unifiedGenerator.qedGenerator.generateQEDPost();
        const image = await this.unifiedGenerator.qedGenerator.generateImage(content);
        const metrics = this.unifiedGenerator.enhancedGenerator.calculateEngagementMetrics(content);

        return { content, image, metrics };
    }

    async generateFreestylePost(customPrompt) {
        // For freestyle, we'll use the fintech generator with custom prompt
        const content = await this.unifiedGenerator.enhancedGenerator.generateOptimizedPost(customPrompt);
        const image = await this.unifiedGenerator.enhancedGenerator.generateImage(content);
        const metrics = this.unifiedGenerator.enhancedGenerator.calculateEngagementMetrics(content);

        return { content, image, metrics };
    }

    // Analytics helper methods
    filterPostsByTimeRange(posts, timeRange) {
        const now = new Date();
        let cutoffDate;

        switch (timeRange) {
            case '7d':
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        return posts.filter(post => {
            const postDate = new Date(post.posted_at || post.created_at);
            return postDate >= cutoffDate;
        });
    }

    calculateSummaryStats(posts) {
        if (posts.length === 0) {
            return {
                totalPosts: 0,
                totalViews: 0,
                totalLikes: 0,
                totalComments: 0,
                totalShares: 0,
                avgEngagementRate: 0
            };
        }

        const totalViews = posts.reduce((sum, post) => sum + (post.actual_views || 0), 0);
        const totalLikes = posts.reduce((sum, post) => sum + (post.actual_likes || 0), 0);
        const totalComments = posts.reduce((sum, post) => sum + (post.actual_comments || 0), 0);
        const totalShares = posts.reduce((sum, post) => sum + (post.actual_shares || 0), 0);

        const totalEngagement = totalLikes + totalComments + totalShares;
        const avgEngagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;

        return {
            totalPosts: posts.length,
            totalViews,
            totalLikes,
            totalComments,
            totalShares,
            avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2))
        };
    }

    calculatePerformanceByType(posts) {
        const typeStats = {};

        posts.forEach(post => {
            const type = post.post_type || 'fintech';
            if (!typeStats[type]) {
                typeStats[type] = {
                    posts: [],
                    totalViews: 0,
                    totalEngagement: 0
                };
            }

            const views = post.actual_views || 0;
            const engagement = (post.actual_likes || 0) + (post.actual_comments || 0) + (post.actual_shares || 0);

            typeStats[type].posts.push(post);
            typeStats[type].totalViews += views;
            typeStats[type].totalEngagement += engagement;
        });

        const performanceByType = {};
        Object.entries(typeStats).forEach(([type, stats]) => {
            const avgEngagement = stats.totalViews > 0 ? (stats.totalEngagement / stats.totalViews) * 100 : 0;
            performanceByType[type] = {
                avgEngagement: parseFloat(avgEngagement.toFixed(2)),
                postCount: stats.posts.length,
                totalViews: stats.totalViews
            };
        });

        return performanceByType;
    }

    calculateDayOfWeekPerformance(posts) {
        const dayStats = {
            'Monday': { posts: [], totalEngagement: 0, totalViews: 0 },
            'Tuesday': { posts: [], totalEngagement: 0, totalViews: 0 },
            'Wednesday': { posts: [], totalEngagement: 0, totalViews: 0 },
            'Thursday': { posts: [], totalEngagement: 0, totalViews: 0 },
            'Friday': { posts: [], totalEngagement: 0, totalViews: 0 },
            'Saturday': { posts: [], totalEngagement: 0, totalViews: 0 },
            'Sunday': { posts: [], totalEngagement: 0, totalViews: 0 }
        };

        posts.forEach(post => {
            const postDate = new Date(post.posted_at || post.created_at);
            const dayName = postDate.toLocaleDateString('en-US', { weekday: 'long' });

            if (dayStats[dayName]) {
                const views = post.actual_views || 0;
                const engagement = (post.actual_likes || 0) + (post.actual_comments || 0) + (post.actual_shares || 0);

                dayStats[dayName].posts.push(post);
                dayStats[dayName].totalViews += views;
                dayStats[dayName].totalEngagement += engagement;
            }
        });

        const dayOfWeekPerformance = {};
        Object.entries(dayStats).forEach(([day, stats]) => {
            const avgEngagement = stats.totalViews > 0 ? (stats.totalEngagement / stats.totalViews) * 100 : 0;
            dayOfWeekPerformance[day] = {
                avgEngagement: parseFloat(avgEngagement.toFixed(1)),
                postCount: stats.posts.length
            };
        });

        return dayOfWeekPerformance;
    }

    calculateTimeOfDayPerformance(posts) {
        const timeStats = {
            'Morning (6AM-12PM)': { posts: [], totalEngagement: 0, totalViews: 0 },
            'Afternoon (12PM-6PM)': { posts: [], totalEngagement: 0, totalViews: 0 },
            'Evening (6PM-12AM)': { posts: [], totalEngagement: 0, totalViews: 0 },
            'Night (12AM-6AM)': { posts: [], totalEngagement: 0, totalViews: 0 }
        };

        posts.forEach(post => {
            const postDate = new Date(post.posted_at || post.created_at);
            const hour = postDate.getHours();

            let timeSlot;
            if (hour >= 6 && hour < 12) timeSlot = 'Morning (6AM-12PM)';
            else if (hour >= 12 && hour < 18) timeSlot = 'Afternoon (12PM-6PM)';
            else if (hour >= 18 && hour < 24) timeSlot = 'Evening (6PM-12AM)';
            else timeSlot = 'Night (12AM-6AM)';

            const views = post.actual_views || 0;
            const engagement = (post.actual_likes || 0) + (post.actual_comments || 0) + (post.actual_shares || 0);

            timeStats[timeSlot].posts.push(post);
            timeStats[timeSlot].totalViews += views;
            timeStats[timeSlot].totalEngagement += engagement;
        });

        const timeOfDayPerformance = {};
        Object.entries(timeStats).forEach(([timeSlot, stats]) => {
            const avgEngagement = stats.totalViews > 0 ? (stats.totalEngagement / stats.totalViews) * 100 : 0;
            timeOfDayPerformance[timeSlot] = {
                avgEngagement: parseFloat(avgEngagement.toFixed(1)),
                postCount: stats.posts.length
            };
        });

        return timeOfDayPerformance;
    }

    getTopPerformingPosts(posts, limit = 5) {
        return posts
            .map(post => ({
                id: post.id,
                content: post.content,
                type: post.post_type || 'fintech',
                timestamp: post.posted_at || post.created_at,
                views: post.actual_views || 0,
                likes: post.actual_likes || 0,
                comments: post.actual_comments || 0,
                shares: post.actual_shares || 0,
                engagementRate: post.actual_engagement_rate || 0
            }))
            .sort((a, b) => b.engagementRate - a.engagementRate)
            .slice(0, limit);
    }

    generateRecommendations(posts, summary) {
        const recommendations = [];

        if (posts.length === 0) {
            recommendations.push({
                title: 'Start Posting Content',
                description: 'Begin creating and posting content to generate analytics data and insights.'
            });
            return recommendations;
        }

        // Analyze engagement patterns
        const highEngagementPosts = posts.filter(post =>
            (post.actual_engagement_rate || 0) > 5
        );
        const lowEngagementPosts = posts.filter(post =>
            (post.actual_engagement_rate || 0) < 2
        );

        if (highEngagementPosts.length > 0) {
            const avgHighEngagement = highEngagementPosts.reduce((sum, post) =>
                sum + (post.actual_engagement_rate || 0), 0) / highEngagementPosts.length;

            recommendations.push({
                title: 'Replicate High-Performing Content',
                description: `${highEngagementPosts.length} posts achieved >5% engagement (avg: ${avgHighEngagement.toFixed(1)}%). Analyze these posts for common patterns.`
            });
        }

        if (lowEngagementPosts.length > 0) {
            recommendations.push({
                title: 'Optimize Low-Performing Content',
                description: `${lowEngagementPosts.length} posts achieved <2% engagement. Consider adjusting content strategy for these posts.`
            });
        }

        // Time-based recommendations
        const dayPerformance = this.calculateDayOfWeekPerformance(posts);
        const bestDay = Object.entries(dayPerformance).reduce((best, [day, stats]) =>
            stats.avgEngagement > best.avgEngagement ? { day, ...stats } : best,
            { day: 'Unknown', avgEngagement: 0 }
        );

        if (bestDay.avgEngagement > 0) {
            recommendations.push({
                title: 'Optimize Posting Schedule',
                description: `${bestDay.day} shows the highest engagement rate (${bestDay.avgEngagement}%). Consider posting more content on this day.`
            });
        }

        // Content type recommendations
        const typePerformance = this.calculatePerformanceByType(posts);
        const bestType = Object.entries(typePerformance).reduce((best, [type, stats]) =>
            stats.avgEngagement > best.avgEngagement ? { type, ...stats } : best,
            { type: 'Unknown', avgEngagement: 0 }
        );

        if (bestType.avgEngagement > 0) {
            recommendations.push({
                title: 'Focus on High-Performing Content Types',
                description: `${bestType.type} content shows the highest engagement rate (${bestType.avgEngagement}%). Consider creating more ${bestType.type} content.`
            });
        }

        return recommendations;
    }

    async start() {
        try {
            // Initialize the generators and analytics
            await this.unifiedGenerator.initialize();
            await this.analytics.initialize();

            this.app.listen(this.port, () => {
                console.log(`🎯 FintechPulse React UI Server running on port ${this.port}`);
                console.log(`📱 Open your browser and navigate to: http://localhost:${this.port}`);
                console.log(`🔧 API endpoints available at: http://localhost:${this.port}/api/*`);
            });
        } catch (error) {
            console.error('❌ Failed to start React UI server:', error);
            process.exit(1);
        }
    }
}

// Start the server if this file is run directly
if (require.main === module) {
    const server = new ReactUIServer();
    server.start().catch(console.error);
}

module.exports = ReactUIServer; 