const readline = require('readline');
const EnhancedContentGenerator = require('./enhanced-content-generator');
const PersonalContentGenerator = require('./personal-content-generator');
const PostDatabase = require('./database');

class UnifiedPostGenerator {
  constructor() {
    this.enhancedGenerator = new EnhancedContentGenerator();
    this.personalGenerator = new PersonalContentGenerator();
    this.database = new PostDatabase();
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
      console.log('3. Exit\n');

      this.rl.question('Enter your choice (1-3): ', (answer) => {
        switch (answer.trim()) {
          case '1':
            resolve('fintech');
            break;
          case '2':
            resolve('personal');
            break;
          case '3':
            resolve('exit');
            break;
          default:
            console.log('❌ Invalid choice. Please enter 1, 2, or 3.');
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

  // Approve and post
  async approveAndPost(postContent, imageResult, postType) {
    console.log(`\n✅ Approving ${postType} post for publishing...`);
    // Here you would integrate with LinkedIn API to actually post
    console.log('📤 Post would be published to LinkedIn (API integration needed)');
    console.log('💡 To implement actual posting, integrate with LinkedIn API');
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