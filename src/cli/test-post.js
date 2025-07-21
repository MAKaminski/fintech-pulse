const ContentGenerator = require('./content-generator');
const LinkedInAPI = require('./linkedin-api');

async function testPost() {
  console.log('🧪 Testing FintechPulse LinkedIn Posting');
  console.log('========================================\n');

  try {
    // Test LinkedIn connection
    console.log('1️⃣ Testing LinkedIn API connection...');
    const linkedinAPI = new LinkedInAPI();
    const connectionTest = await linkedinAPI.testConnection();
    
    if (!connectionTest) {
      console.error('❌ LinkedIn connection failed. Please run "npm run auth" first.');
      process.exit(1);
    }
    
    console.log('✅ LinkedIn connection successful!\n');

    // Test content generation
    console.log('2️⃣ Testing content generation...');
    const contentGenerator = new ContentGenerator();
    
    let postContent;
    try {
      postContent = await contentGenerator.generatePost();
      console.log('✅ OpenAI content generation successful!');
    } catch (error) {
      console.log('⚠️  OpenAI failed, using fallback content...');
      postContent = contentGenerator.generateFallbackPost();
      console.log('✅ Fallback content generation successful!');
    }

    console.log('\n📝 Generated content preview:');
    console.log('----------------------------');
    console.log(postContent.substring(0, 200) + '...');
    console.log('----------------------------\n');

    // Ask for confirmation before posting
    console.log('🤔 Do you want to post this content to LinkedIn? (y/N)');
    
    // For automated testing, we'll skip the confirmation
    // In a real scenario, you'd want to add readline for user input
    const shouldPost = process.argv.includes('--auto-post');
    
    if (shouldPost) {
      console.log('🚀 Posting to LinkedIn...');
      await linkedinAPI.createPost(postContent, imageResult.success ? imageResult.imagePath : null);
      console.log('✅ Test post completed successfully!');
    } else {
      console.log('⏭️  Skipping actual post (use --auto-post to post automatically)');
      console.log('📝 Content was generated successfully and ready for posting.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testPost().then(() => {
  console.log('\n🎉 Test completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 