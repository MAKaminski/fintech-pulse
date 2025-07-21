const readline = require('readline');
const EnhancedContentGenerator = require('../generators/fintech/generator');
const PersonalContentGenerator = require('../generators/personal/generator');
const MichaelDavisGenerator = require('../generators/michael-davis/generator');
const ContinuingEducationGenerator = require('../generators/education/generator');
const PostDatabase = require('../utils/database');
const LinkedInAPI = require('../utils/linkedin-api');

class UnifiedPostGenerator {
  constructor() {
    this.enhancedGenerator = new EnhancedContentGenerator();
    this.personalGenerator = new PersonalContentGenerator();
    this.michaelDavisGenerator = new MichaelDavisGenerator();
    this.educationGenerator = new ContinuingEducationGenerator();
    this.database = new PostDatabase();
    this.linkedinAPI = new LinkedInAPI();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async initialize() {
    await this.database.initialize();
  }

  // Main CLI interface
  async run() {
    console.log('\n🎯 Unified LinkedIn Post Generator');
    console.log('=====================================\n');

    try {
      await this.initialize();
      
      const postType = await this.selectPostType();
      
      if (postType === 'fintech') {
        await this.generateFintechPost();
      } else if (postType === 'personal') {
        await this.generatePersonalPost();
      } else if (postType === 'michael-davis') {
        await this.generateMichaelDavisPost();
      } else if (postType === 'education') {
        await this.generateEducationPost();
      } else {
        console.log('❌ Invalid selection. Exiting...');
        process.exit(0);
      }

    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      this.rl.close();
    }
  }

  // Select post type via CLI
  async selectPostType() {
    return new Promise((resolve) => {
      console.log('📝 What type of post would you like to generate?');
      console.log('1. FintechPulse Post (Business/Industry focused)');
      console.log('2. Personal Post (Personal branding/opportunities)');
      console.log('3. Michael Davis Post (Exonomist style)');
      console.log('4. Continuing Education Post (Course recommendations)');
      console.log('5. Exit\n');

      this.rl.question('Enter your choice (1-5): ', (answer) => {
        switch (answer.trim()) {
          case '1':
            resolve('fintech');
            break;
          case '2':
            resolve('personal');
            break;
          case '3':
            resolve('michael-davis');
            break;
          case '4':
            resolve('education');
            break;
          case '5':
            resolve('exit');
            break;
          default:
            console.log('❌ Invalid choice. Please enter 1, 2, 3, 4, or 5.');
            resolve(this.selectPostType());
        }
      });
    });
  }

  // Generate fintech post
  async generateFintechPost() {
    console.log('\n🚀 Generating FintechPulse Post...');
    console.log('=====================================\n');

    try {
      // Generate content
      console.log('🤖 Generating optimized fintech content...');
      const postContent = await this.enhancedGenerator.generateOptimizedPost();
      
      // Generate image
      console.log('🎨 Generating fintech image...');
      const imageResult = await this.enhancedGenerator.generateImage(postContent);
      
      // Calculate metrics
      const metrics = this.enhancedGenerator.calculateEngagementMetrics(postContent);
      
      // Display results
      this.displayFintechResults(postContent, imageResult, metrics);
      
      // Handle user actions
      await this.handleFintechActions(postContent, imageResult, metrics);

    } catch (error) {
      console.error('❌ Error generating fintech post:', error.message);
    }
  }

  // Generate personal post
  async generatePersonalPost() {
    console.log('\n👤 Generating Personal Post...');
    console.log('================================\n');

    try {
      // Generate content
      console.log('🤖 Generating personal content...');
      const postContent = await this.personalGenerator.generatePersonalPost();
      
      // Generate image
      console.log('🎨 Generating personal image...');
      const imageResult = await this.personalGenerator.generatePersonalImage(postContent);
      
      // Calculate metrics
      const metrics = this.personalGenerator.calculatePersonalEngagementMetrics(postContent);
      
      // Display results
      this.displayPersonalResults(postContent, imageResult, metrics);
      
      // Handle user actions
      await this.handlePersonalActions(postContent, imageResult, metrics);

    } catch (error) {
      console.error('❌ Error generating personal post:', error.message);
    }
  }

  // Generate Michael Davis post
  async generateMichaelDavisPost() {
    console.log('\n🎯 Generating Michael Davis Post...');
    console.log('=====================================\n');

    try {
      const topicType = await this.selectMichaelDavisTopic();
      
      if (topicType === 'back') {
        return;
      }
      
      let postContent;
      if (topicType === 'specific') {
        const specificTopic = await this.selectSpecificTopic();
        if (specificTopic === 'back') {
          return this.generateMichaelDavisPost();
        }
        postContent = await this.michaelDavisGenerator.generateTopicSpecificPost(specificTopic);
      } else {
        postContent = await this.michaelDavisGenerator.generatePost();
      }
      
      // Display results
      this.displayMichaelDavisResults(postContent);
      
      // Handle user actions
      await this.handleMichaelDavisActions(postContent);

    } catch (error) {
      console.error('❌ Error generating Michael Davis post:', error.message);
    }
  }

  // Generate Continuing Education Post
  async generateEducationPost() {
    console.log('\n📚 Generating Continuing Education Post...');
    console.log('=============================================\n');

    try {
      // Generate content
      console.log('🤖 Generating continuing education content...');
      const postContent = await this.educationGenerator.generateEducationPost();
      
      // Generate image
      console.log('🎨 Generating continuing education image...');
      const imageResult = await this.educationGenerator.generateImage(postContent);
      
      // Calculate metrics (reuse fintech metrics for now)
      const metrics = this.enhancedGenerator.calculateEngagementMetrics(postContent);
      
      // Display results
      this.displayEducationResults(postContent, imageResult, metrics);
      
      // Handle user actions
      await this.handleEducationActions(postContent, imageResult, metrics);

    } catch (error) {
      console.error('❌ Error generating continuing education post:', error.message);
    }
  }

  // Select Michael Davis topic type
  async selectMichaelDavisTopic() {
    return new Promise((resolve) => {
      console.log('📝 What type of Michael Davis post would you like?');
      console.log('1. Random topic (auto-generated)');
      console.log('2. Specific topic (South Downtown, Housing, etc.)');
      console.log('3. Back to main menu\n');

      this.rl.question('Enter your choice (1-3): ', (answer) => {
        switch (answer.trim()) {
          case '1':
            resolve('random');
            break;
          case '2':
            resolve('specific');
            break;
          case '3':
            resolve('back');
            break;
          default:
            console.log('❌ Invalid choice. Please enter 1, 2, or 3.');
            resolve(this.selectMichaelDavisTopic());
        }
      });
    });
  }

  // Select specific topic
  async selectSpecificTopic() {
    return new Promise((resolve) => {
      console.log('\n📝 Select a specific topic:');
      console.log('1. South Downtown development opportunities');
      console.log('2. Housing & Tax Legislation');
      console.log('3. Homegrown investment strategies');
      console.log('4. Overline venture capital insights');
      console.log('5. Atlanta Tech Village ecosystem');
      console.log('6. Back to topic selection\n');

      this.rl.question('Enter your choice (1-6): ', (answer) => {
        switch (answer.trim()) {
          case '1':
            resolve('South Downtown development opportunities');
            break;
          case '2':
            resolve('Atlanta housing market trends and legislation impact');
            break;
          case '3':
            resolve('Homegrown investment strategies and portfolio management');
            break;
          case '4':
            resolve('Overline venture capital insights and startup investing');
            break;
          case '5':
            resolve('Atlanta Tech Village ecosystem and community building');
            break;
          case '6':
            resolve('back');
            break;
          default:
            console.log('❌ Invalid choice. Please enter 1-6.');
            resolve(this.selectSpecificTopic());
        }
      });
    });
  }

  // Display fintech post results
  displayFintechResults(postContent, imageResult, metrics) {
    console.log('\n📝 Generated FintechPulse Post:');
    console.log('================================');
    console.log(postContent);
    console.log('\n🖼️  Generated Image:');
    console.log('==================');
    if (imageResult.success) {
      console.log(`📁 File: ${imageResult.filename}`);
      console.log(`📍 Path: ${imageResult.imagePath}`);
      console.log(`🔗 URL: ${imageResult.url}`);
    } else {
      console.log('❌ Image generation failed');
    }

    console.log('\n📊 Post Analysis:');
    console.log('=================');
    console.log(`Word Count: ${metrics.metrics.wordCount} (Ideal: 50-150)`);
    console.log(`Character Count: ${metrics.metrics.charCount} (Ideal: 300-1300)`);
    console.log(`Emoji Count: ${metrics.metrics.emojiCount} (Ideal: 5-12)`);
    console.log(`Engagement Score: ${metrics.engagementScore}/100`);

    console.log('\n🎯 Engagement Elements:');
    console.log(`${metrics.metrics.hasQuestion ? '✅' : '❌'} Has Question: ${metrics.metrics.hasQuestion ? 'Yes' : 'No'}`);
    console.log(`${metrics.metrics.hasCallToAction ? '✅' : '❌'} Has Call-to-Action: ${metrics.metrics.hasCallToAction ? 'Yes' : 'No'}`);
    console.log(`${metrics.metrics.hasStats ? '✅' : '❌'} Has Statistics: ${metrics.metrics.hasStats ? 'Yes' : 'No'}`);
    console.log(`${metrics.metrics.hasAttentionGrabber ? '✅' : '❌'} Has Attention Grabber: ${metrics.metrics.hasAttentionGrabber ? 'Yes' : 'No'}`);

    console.log('\n📈 Estimated Performance:');
    console.log(`👁️  Estimated Views: ${metrics.estimatedViews.toLocaleString()}`);
    console.log(`🖱️  Estimated Clicks: ${metrics.estimatedClicks}`);
    console.log(`💬 Estimated Interactions: ${metrics.estimatedInteractions}`);

    if (metrics.optimizationApplied) {
      console.log(`\n⚙️  Analytics Optimization Applied: ${metrics.analyticsMultiplier}x multiplier`);
    }
  }

  // Display personal post results
  displayPersonalResults(postContent, imageResult, metrics) {
    console.log('\n📝 Generated Personal Post:');
    console.log('===========================');
    console.log(postContent);
    console.log('\n🖼️  Generated Image:');
    console.log('==================');
    if (imageResult.success) {
      console.log(`📁 File: ${imageResult.filename}`);
      console.log(`📍 Path: ${imageResult.imagePath}`);
      console.log(`🔗 URL: ${imageResult.url}`);
    } else {
      console.log('❌ Image generation failed');
    }

    console.log('\n📊 Post Analysis:');
    console.log('=================');
    console.log(`Word Count: ${metrics.metrics.wordCount} (Ideal: 150-300)`);
    console.log(`Character Count: ${metrics.metrics.charCount} (Ideal: 800-1500)`);
    console.log(`Emoji Count: ${metrics.metrics.emojiCount} (Ideal: 8-15)`);
    console.log(`Engagement Score: ${metrics.engagementScore}/100`);

    console.log('\n🎯 Personal Post Elements:');
    console.log(`${metrics.metrics.hasPersonalHook ? '✅' : '❌'} Has Personal Hook: ${metrics.metrics.hasPersonalHook ? 'Yes' : 'No'}`);
    console.log(`${metrics.metrics.hasStructuredSections ? '✅' : '❌'} Has Structured Sections: ${metrics.metrics.hasStructuredSections ? 'Yes' : 'No'}`);
    console.log(`${metrics.metrics.hasCallToAction ? '✅' : '❌'} Has Call-to-Action: ${metrics.metrics.hasCallToAction ? 'Yes' : 'No'}`);
    console.log(`${metrics.metrics.hasQuestion ? '✅' : '❌'} Has Question: ${metrics.metrics.hasQuestion ? 'Yes' : 'No'}`);

    console.log('\n📈 Estimated Performance:');
    console.log(`👁️  Estimated Views: ${metrics.estimatedViews.toLocaleString()}`);
    console.log(`🖱️  Estimated Clicks: ${metrics.estimatedClicks}`);
    console.log(`💬 Estimated Interactions: ${metrics.estimatedInteractions}`);
  }

  // Display Continuing Education Post results
  displayEducationResults(postContent, imageResult, metrics) {
    console.log('\n📚 Generated Continuing Education Post:');
    console.log('============================================');
    console.log(postContent);
    console.log('\n🖼️  Generated Image:');
    console.log('==================');
    if (imageResult.success) {
      console.log(`📁 File: ${imageResult.filename}`);
      console.log(`📍 Path: ${imageResult.imagePath}`);
      console.log(`🔗 URL: ${imageResult.url}`);
    } else {
      console.log('❌ Image generation failed');
    }

    console.log('\n📊 Post Analysis:');
    console.log('=================');
    console.log(`Word Count: ${metrics.metrics.wordCount} (Ideal: 50-150)`);
    console.log(`Character Count: ${metrics.metrics.charCount} (Ideal: 300-1300)`);
    console.log(`Emoji Count: ${metrics.metrics.emojiCount} (Ideal: 5-12)`);
    console.log(`Engagement Score: ${metrics.engagementScore}/100`);

    console.log('\n🎯 Continuing Education Post Elements:');
    console.log(`${metrics.metrics.hasCourseRecommendation ? '✅' : '❌'} Has Course Recommendation: ${metrics.metrics.hasCourseRecommendation ? 'Yes' : 'No'}`);
    console.log(`${metrics.metrics.hasCallToAction ? '✅' : '❌'} Has Call-to-Action: ${metrics.metrics.hasCallToAction ? 'Yes' : 'No'}`);
    console.log(`${metrics.metrics.hasQuestion ? '✅' : '❌'} Has Question: ${metrics.metrics.hasQuestion ? 'Yes' : 'No'}`);

    console.log('\n📈 Estimated Performance:');
    console.log(`👁️  Estimated Views: ${metrics.estimatedViews.toLocaleString()}`);
    console.log(`🖱️  Estimated Clicks: ${metrics.estimatedClicks}`);
    console.log(`💬 Estimated Interactions: ${metrics.estimatedInteractions}`);
  }

  // Handle fintech post actions
  async handleFintechActions(postContent, imageResult, metrics) {
    return new Promise((resolve) => {
      console.log('\n🤔 What would you like to do?');
      console.log('1. Approve and post now');
      console.log('2. Regenerate content');
      console.log('3. Edit content manually');
      console.log('4. Save for later (not post)');
      console.log('5. Reject and regenerate');
      console.log('6. View analytics dashboard');
      console.log('7. Exit without saving\n');

      this.rl.question('Enter your choice (1-7): ', async (answer) => {
        switch (answer.trim()) {
          case '1':
            await this.approveAndPost(postContent, imageResult, 'fintech');
            break;
          case '2':
            await this.generateFintechPost();
            break;
          case '3':
            await this.editContent(postContent, 'fintech');
            break;
          case '4':
            await this.saveForLater(postContent, imageResult, 'fintech');
            break;
          case '5':
            await this.generateFintechPost();
            break;
          case '6':
            await this.viewAnalyticsDashboard();
            break;
          case '7':
            console.log('👋 Exiting without saving.');
            break;
          default:
            console.log('❌ Invalid choice. Please try again.');
            await this.handleFintechActions(postContent, imageResult, metrics);
        }
        resolve();
      });
    });
  }

  // Handle personal post actions
  async handlePersonalActions(postContent, imageResult, metrics) {
    return new Promise((resolve) => {
      console.log('\n🤔 What would you like to do?');
      console.log('1. Approve and post now');
      console.log('2. Regenerate content');
      console.log('3. Edit content manually');
      console.log('4. Save for later (not post)');
      console.log('5. Reject and regenerate');
      console.log('6. Exit without saving\n');

      this.rl.question('Enter your choice (1-6): ', async (answer) => {
        switch (answer.trim()) {
          case '1':
            await this.approveAndPost(postContent, imageResult, 'personal');
            break;
          case '2':
            await this.generatePersonalPost();
            break;
          case '3':
            await this.editContent(postContent, 'personal');
            break;
          case '4':
            await this.saveForLater(postContent, imageResult, 'personal');
            break;
          case '5':
            await this.generatePersonalPost();
            break;
          case '6':
            console.log('👋 Exiting without saving.');
            break;
          default:
            console.log('❌ Invalid choice. Please try again.');
            await this.handlePersonalActions(postContent, imageResult, metrics);
        }
        resolve();
      });
    });
  }

  // Handle Continuing Education Post actions
  async handleEducationActions(postContent, imageResult, metrics) {
    return new Promise((resolve) => {
      console.log('\n🤔 What would you like to do?');
      console.log('1. Approve and post now');
      console.log('2. Regenerate content');
      console.log('3. Edit content manually');
      console.log('4. Save for later (not post)');
      console.log('5. Reject and regenerate');
      console.log('6. Exit without saving\n');

      this.rl.question('Enter your choice (1-6): ', async (answer) => {
        switch (answer.trim()) {
          case '1':
            await this.approveAndPost(postContent, imageResult, 'education');
            break;
          case '2':
            await this.generateEducationPost();
            break;
          case '3':
            await this.editContent(postContent, 'education');
            break;
          case '4':
            await this.saveForLater(postContent, imageResult, 'education');
            break;
          case '5':
            await this.generateEducationPost();
            break;
          case '6':
            console.log('👋 Exiting without saving.');
            break;
          default:
            console.log('❌ Invalid choice. Please try again.');
            await this.handleEducationActions(postContent, imageResult, metrics);
        }
        resolve();
      });
    });
  }

  // Display Michael Davis post results
  displayMichaelDavisResults(postContent) {
    console.log('\n📝 Generated Michael Davis Post:');
    console.log('=================================');
    console.log(`Topic: ${postContent.metadata.topic}`);
    console.log(`Category: ${postContent.metadata.category}`);
    console.log(`Style: ${postContent.metadata.style}`);
    console.log(`Timestamp: ${new Date(postContent.metadata.timestamp).toLocaleString()}`);
    console.log('\nContent:');
    console.log('--------');
    console.log(postContent.content);
    
    console.log('\n📊 Post Analysis:');
    console.log('=================');
    const wordCount = postContent.content.split(' ').length;
    const charCount = postContent.content.length;
    const emojiCount = (postContent.content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    
    console.log(`Word Count: ${wordCount} (Ideal: 100-300)`);
    console.log(`Character Count: ${charCount} (Ideal: 600-1500)`);
    console.log(`Emoji Count: ${emojiCount} (Ideal: 3-8)`);
    
    console.log('\n🎯 Michael Davis Style Elements:');
    console.log(`${postContent.content.includes('?') ? '✅' : '❌'} Has Question: ${postContent.content.includes('?') ? 'Yes' : 'No'}`);
    console.log(`${postContent.content.includes('•') || postContent.content.includes('-') ? '✅' : '❌'} Has Bullet Points: ${postContent.content.includes('•') || postContent.content.includes('-') ? 'Yes' : 'No'}`);
    console.log(`${postContent.content.toLowerCase().includes('atlanta') ? '✅' : '❌'} References Atlanta: ${postContent.content.toLowerCase().includes('atlanta') ? 'Yes' : 'No'}`);
    console.log(`${postContent.content.toLowerCase().includes('i\'ve') || postContent.content.toLowerCase().includes('i\'m') ? '✅' : '❌'} Personal Voice: ${postContent.content.toLowerCase().includes('i\'ve') || postContent.content.toLowerCase().includes('i\'m') ? 'Yes' : 'No'}`);
    
    console.log('\n💡 Post ready for LinkedIn!');
  }

  // Handle Michael Davis post actions
  async handleMichaelDavisActions(postContent) {
    return new Promise((resolve) => {
      console.log('\n🤔 What would you like to do?');
      console.log('1. Approve and post now');
      console.log('2. Regenerate content');
      console.log('3. Edit content manually');
      console.log('4. Save for later (not post)');
      console.log('5. Generate different topic');
      console.log('6. Exit without saving\n');

      this.rl.question('Enter your choice (1-6): ', async (answer) => {
        switch (answer.trim()) {
          case '1':
            await this.approveAndPost(postContent, null, 'michael-davis');
            break;
          case '2':
            await this.generateMichaelDavisPost();
            break;
          case '3':
            await this.editContent(postContent, 'michael-davis');
            break;
          case '4':
            await this.saveForLater(postContent, null, 'michael-davis');
            break;
          case '5':
            await this.generateMichaelDavisPost();
            break;
          case '6':
            console.log('👋 Exiting without saving.');
            break;
          default:
            console.log('❌ Invalid choice. Please try again.');
            await this.handleMichaelDavisActions(postContent);
        }
        resolve();
      });
    });
  }

  // Approve and post
  async approveAndPost(postContent, imageResult, postType) {
    console.log(`\n✅ Approving ${postType} post for publishing...`);
    try {
      // Test LinkedIn connection first
      console.log('🔗 Testing LinkedIn connection...');
      const isConnected = await this.linkedinAPI.testConnection();
      if (!isConnected) {
        console.log('❌ LinkedIn connection failed. Please authenticate first.');
        console.log('💡 Run: npm run auth');
        return;
      }
      // Confirm posting
      const confirmed = await this.confirmPosting(postContent, postType);
      if (!confirmed) {
        console.log('❌ Posting cancelled by user.');
        return;
      }
      // Post to LinkedIn
      let imagePathToUse = imageResult && imageResult.success ? imageResult.imagePath : null;
      if (process.env.LINKEDIN_NO_IMAGE) {
        console.log('DEBUG: LINKEDIN_NO_IMAGE is set, posting without image.');
        imagePathToUse = null;
      }
      const postText = typeof postContent === 'object' ? postContent.content : postContent;
      const postResult = await this.linkedinAPI.createPost(
        postText,
        imagePathToUse
      );
      console.log('LinkedIn API post result:', postResult);
      if (postResult && postResult.id) {
        console.log('🎉 Post published successfully!');
        console.log(`📊 Post ID: ${postResult.id}`);
        // Save to database
        await this.savePostToDatabase(postContent, imageResult, postType, postResult.id);
        console.log('💾 Post saved to database for analytics tracking.');
      } else {
        console.error('❌ LinkedIn post failed:', postResult);
      }
    } catch (error) {
      console.error('❌ Error posting to LinkedIn:', error.message);
      if (error.message && (error.message.includes('401') || error.message.includes('expired'))) {
        console.log('🔑 Access token may be expired. Please re-authenticate:');
        console.log('💡 Run: npm run auth');
      }
    }
  }

  // Confirm posting with user
  async confirmPosting(postContent, postType) {
    return new Promise((resolve) => {
      console.log('\n📝 Final Review:');
      console.log('================');
      console.log(postContent);
      console.log('\n🤔 Are you sure you want to post this to LinkedIn? (y/n): ');
      
      this.rl.question('', (answer) => {
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
  }

  // Save post to database
  async savePostToDatabase(postContent, imageResult, postType, linkedinPostId) {
    try {
      const postNumber = await this.database.getNextPostNumber();
      
      const postData = {
        postNumber,
        content: postContent,
        imagePath: imageResult.success ? imageResult.imagePath : null,
        postType: postType, // 'fintech', 'personal', 'michael-davis', or 'education'
        postDecision: 'posted',
        linkedinPostId,
        postedAt: new Date().toISOString(),
        // Calculate engagement metrics
        wordCount: postContent.split(/\s+/).length,
        characterCount: postContent.length,
        emojiCount: (postContent.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length,
        notes: `Generated via unified post generator - ${postType} post`
      };

      await this.database.savePost(postData);
      console.log('✅ Post saved to database successfully.');
      
    } catch (error) {
      console.error('❌ Error saving to database:', error.message);
    }
  }

  // Edit content manually
  async editContent(postContent, postType) {
    console.log('\n✏️  Manual editing not implemented yet.');
    console.log('💡 To implement manual editing, add text editor integration');
  }

  // Save for later
  async saveForLater(postContent, imageResult, postType) {
    console.log(`\n💾 Saving ${postType} post for later...`);
    // Here you would save to database
    console.log('📁 Post saved to database for later use');
  }

  // View analytics dashboard
  async viewAnalyticsDashboard() {
    console.log('\n📊 Analytics Dashboard');
    console.log('=====================');
    // Here you would show analytics
    console.log('📈 Analytics dashboard not implemented yet');
    console.log('💡 To implement, add analytics visualization');
  }
}

// CLI entry point
async function main() {
  const generator = new UnifiedPostGenerator();
  await generator.run();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = UnifiedPostGenerator; 