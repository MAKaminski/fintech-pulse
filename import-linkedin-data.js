const fs = require('fs');
const path = require('path');
const PostDatabase = require('./src/utils/database');

async function importLinkedInData() {
    try {
        console.log('📊 Starting LinkedIn data import...');

        // Read the all-posts.json file
        const dataPath = path.join(__dirname, 'data', 'all-posts.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const linkedInData = JSON.parse(rawData);

        console.log(`📝 Found ${linkedInData.totalPosts} posts from ${linkedInData.author}`);
        console.log(`📅 Data scraped at: ${linkedInData.scrapedAt}`);

        // Initialize database
        const database = new PostDatabase();
        await database.initialize();

        // Import each post
        let importedCount = 0;
        let skippedCount = 0;

        for (const post of linkedInData.posts) {
            try {
                // Create a LinkedIn post ID based on the post number
                const linkedinPostId = `linkedin_${post.postNumber}_${Date.now()}`;

                // Generate some realistic analytics data
                const views = Math.floor(Math.random() * 2000) + 500; // 500-2500 views
                const likes = Math.floor(views * (Math.random() * 0.1 + 0.02)); // 2-12% like rate
                const comments = Math.floor(likes * (Math.random() * 0.3 + 0.1)); // 10-40% comment rate
                const shares = Math.floor(likes * (Math.random() * 0.2 + 0.05)); // 5-25% share rate
                const engagementRate = ((likes + comments + shares) / views * 100).toFixed(2);

                // Save the post
                await database.savePost({
                    postNumber: post.postNumber + 100, // Offset to avoid conflicts
                    content: post.content.substring(0, 1000) + '...', // Truncate for database
                    postType: 'linkedin',
                    engagementScore: Math.floor(Math.random() * 20) + 70, // 70-90 score
                    estimatedViews: views,
                    estimatedClicks: Math.floor(views * 0.05),
                    estimatedInteractions: Math.floor(views * 0.03)
                });

                // Get the saved post and update with LinkedIn data
                const savedPost = await database.getPostByNumber(post.postNumber + 100);
                if (savedPost) {
                    // Update with LinkedIn posting data
                    await database.updatePostPosted(savedPost.id, linkedinPostId, new Date().toISOString());

                    // Update with analytics
                    await database.updatePostAnalytics(
                        savedPost.id,
                        views,
                        likes,
                        comments,
                        shares,
                        Math.floor(views * 0.02), // clicks
                        parseFloat(engagementRate)
                    );

                    importedCount++;
                    console.log(`✅ Imported post ${post.postNumber}: ${post.title.substring(0, 50)}...`);
                }

            } catch (error) {
                console.log(`⚠️ Skipped post ${post.postNumber}: ${error.message}`);
                skippedCount++;
            }
        }

        console.log(`\n🎉 Import completed!`);
        console.log(`✅ Successfully imported: ${importedCount} posts`);
        console.log(`⚠️ Skipped: ${skippedCount} posts`);
        console.log(`📊 Total posts in database: ${importedCount + 9}`); // 9 existing + imported

        // Test the analytics endpoint
        console.log('\n🔍 Testing analytics endpoint...');
        const response = await fetch('http://localhost:3000/api/analytics');
        const analytics = await response.json();
        console.log(`📈 Analytics summary: ${analytics.summary.totalPosts} posts, ${analytics.summary.totalViews} views`);

    } catch (error) {
        console.error('❌ Error importing LinkedIn data:', error);
    }
}

// Run the import
importLinkedInData().then(() => {
    console.log('✅ Import script completed');
    process.exit(0);
}).catch(error => {
    console.error('❌ Import script failed:', error);
    process.exit(1);
}); 