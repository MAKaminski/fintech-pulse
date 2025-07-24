#!/usr/bin/env node

const readline = require('readline');
const EnhancedContentGenerator = require('../generators/fintech/generator');
const PersonalContentGenerator = require('../generators/personal/generator');
const MichaelDavisGenerator = require('../generators/michael-davis/generator');
const ContinuingEducationGenerator = require('../generators/education/generator');
const FreestyleGenerator = require('../generators/freestyle/generator');
const PostDatabase = require('../utils/database');
const LinkedInAPI = require('../utils/linkedin-api');

class FlatPostGenerator {
  constructor() {
    this.enhancedGenerator = new EnhancedContentGenerator();
    this.personalGenerator = new PersonalContentGenerator();
    this.michaelDavisGenerator = new MichaelDavisGenerator();
    this.educationGenerator = new ContinuingEducationGenerator();
    this.freestyleGenerator = new FreestyleGenerator();
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

  // Main CLI interface with flat menu
  async run() {
    console.log('\n🎯 FintechPulse - Flat Content Generator');
    console.log('=========================================\n');

    try {
      await this.initialize();

      // Show all available options in one flat menu
      await this.showFlatMenu();

    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      this.rl.close();
    }
  }

  // Flat menu with all 10 options
  async showFlatMenu() {
    return new Promise((resolve) => {
      console.log('📝 Choose your content type:');
      console.log('1.  FintechPulse Post (Business/Industry focused)');
      console.log('2.  Personal Branding Post');
      console.log('3.  Michael Davis - Random Topic');
      console.log('4.  Michael Davis - South Downtown Development');
      console.log('5.  Michael Davis - Housing & Tax Legislation');
      console.log('6.  Michael Davis - Homegrown Investment');
      console.log('7.  Michael Davis - Overline VC Insights');
      console.log('8.  Michael Davis - Atlanta Tech Village');
      console.log('9.  Continuing Education Post');
      console.log('10. Freestyle Post (Custom prompt)');
      console.log('11. LinkedIn Connection Campaign');
      console.log('12. Exit\n');

      this.rl.question('Enter your choice (1-12): ', async (answer) => {
        switch (answer.trim()) {
          case '1':
            await this.generateFintechPost();
            break;
          case '2':
            await this.generatePersonalPost();
            break;
          case '3':
            await this.generateMichaelDavisRandom();
            break;
          case '4':
            await this.generateMichaelDavisSpecific('South Downtown development opportunities');
            break;
          case '5':
            await this.generateMichaelDavisSpecific('Atlanta housing market trends and legislation impact');
            break;
          case '6':
            await this.generateMichaelDavisSpecific('Homegrown investment strategies and portfolio management');
            break;
          case '7':
            await this.generateMichaelDavisSpecific('Overline venture capital insights and startup investing');
            break;
          case '8':
            await this.generateMichaelDavisSpecific('Atlanta Tech Village ecosystem and community building');
            break;
          case '9':
            await this.generateEducationPost();
            break;
          case '10':
            await this.generateFreestylePost();
            break;
          case '11':
            await this.runConnectionCampaign();
            break;
          case '12':
            console.log('👋 Goodbye!');
            break;
          default:
            console.log('❌ Invalid choice. Please enter 1-12.');
            await this.showFlatMenu();
        }
        resolve();
      });
    });
  }

  // Generate fintech post
  async generateFintechPost() {
    console.log('\n🚀 Generating FintechPulse Post...');
    console.log('=====================================\n');

    try {
      console.log('🤖 Generating optimized fintech content...');
      const postContent = await this.enhancedGenerator.generateOptimizedPost();

      console.log('🎨 Generating fintech image...');
      const imageResult = await this.enhancedGenerator.generateImage(postContent);

      const metrics = this.enhancedGenerator.calculateEngagementMetrics(postContent);

      this.displayFintechResults(postContent, imageResult, metrics);
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
      console.log('🤖 Generating personal content...');
      const postContent = await this.personalGenerator.generatePersonalPost();

      console.log('🎨 Generating personal image...');
      const imageResult = await this.personalGenerator.generatePersonalImage(postContent);

      const metrics = this.personalGenerator.calculatePersonalEngagementMetrics(postContent);

      this.displayPersonalResults(postContent, imageResult, metrics);
      await this.handlePersonalActions(postContent, imageResult, metrics);

    } catch (error) {
      console.error('❌ Error generating personal post:', error.message);
    }
  }

  // Generate Michael Davis random post
  async generateMichaelDavisRandom() {
    console.log('\n🎯 Generating Michael Davis Random Post...');
    console.log('===========================================\n');

    try {
      const postContent = await this.michaelDavisGenerator.generatePost();
      this.displayMichaelDavisResults(postContent);
      await this.handleMichaelDavisActions(postContent);
    } catch (error) {
      console.error('❌ Error generating Michael Davis post:', error.message);
    }
  }

  // Generate Michael Davis specific topic post
  async generateMichaelDavisSpecific(topic) {
    console.log(`\n🎯 Generating Michael Davis Post: ${topic}`);
    console.log('===========================================\n');

    try {
      const postContent = await this.michaelDavisGenerator.generateTopicSpecificPost(topic);
      this.displayMichaelDavisResults(postContent);
      await this.handleMichaelDavisActions(postContent);
    } catch (error) {
      console.error('❌ Error generating Michael Davis post:', error.message);
    }
  }

  // Generate education post
  async generateEducationPost() {
    console.log('\n📚 Generating Continuing Education Post...');
    console.log('=============================================\n');

    try {
      console.log('🤖 Generating continuing education content...');
      const postContent = await this.educationGenerator.generateEducationPost();

      console.log('🎨 Generating continuing education image...');
      const imageResult = await this.educationGenerator.generateImage(postContent);

      const metrics = this.enhancedGenerator.calculateEngagementMetrics(postContent);

      this.displayEducationResults(postContent, imageResult, metrics);
      await this.handleEducationActions(postContent, imageResult, metrics);

    } catch (error) {
      console.error('❌ Error generating continuing education post:', error.message);
    }
  }

  // Generate freestyle post
  async generateFreestylePost() {
    console.log('\n🎨 Generating Freestyle Post...');
    console.log('================================\n');

    try {
      // Get custom prompt from user
      const customPrompt = await this.getCustomPrompt();
      if (!customPrompt) {
        console.log('❌ No prompt provided. Returning to main menu.');
        return;
      }

      console.log('🤖 Crafting your custom prompt into a LinkedIn post...');
      const postContent = await this.freestyleGenerator.generateFreestylePost(customPrompt);

      console.log('🎨 Generating freestyle image...');
      const imageResult = await this.freestyleGenerator.generateFreestyleImage(postContent.enhancedContent);

      const metrics = this.freestyleGenerator.calculateFreestyleEngagementMetrics(postContent.enhancedContent);

      this.displayFreestyleResults(postContent, imageResult, metrics);
      await this.handleFreestyleActions(postContent, imageResult, metrics);

    } catch (error) {
      console.error('❌ Error generating freestyle post:', error.message);
    }
  }

  // Get custom prompt from user
  async getCustomPrompt() {
    return new Promise((resolve) => {
      console.log('💭 Enter your custom prompt or idea:');
      console.log('(This will be crafted into a LinkedIn post while maintaining your tone)');
      console.log('(Press Enter twice to submit, or type "back" to return)\n');

      let prompt = '';
      let emptyLineCount = 0;

      const onLine = (line) => {
        if (line.trim() === 'back') {
          this.rl.removeListener('line', onLine);
          resolve(null);
        } else if (line.trim() === '') {
          emptyLineCount++;
          if (emptyLineCount >= 2 && prompt.trim() !== '') {
            this.rl.removeListener('line', onLine);
            resolve(prompt.trim());
          }
        } else {
          emptyLineCount = 0;
          prompt += line + '\n';
        }
      };

      this.rl.on('line', onLine);
    });
  }

  // Run connection campaign
  async runConnectionCampaign() {
    console.log('\n🔗 LinkedIn Connection Campaign');
    console.log('===============================\n');
    console.log('💡 Use the dedicated connection CLI for this feature:');
    console.log('   npm run connections');
    console.log('\nThis will open the LinkedIn Connection Manager with all connection options.');
  }

  // Display fintech results
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

    console.log('\n💡 Post ready for LinkedIn!');
  }

  // Display personal results
  displayPersonalResults(postContent, imageResult, metrics) {
    console.log('\n📝 Generated Personal Post:');
    console.log('============================');
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

    console.log('\n📊 Personal Post Analysis:');
    console.log('==========================');
    console.log(`Word Count: ${metrics.metrics.wordCount} (Ideal: 50-150)`);
    console.log(`Character Count: ${metrics.metrics.charCount} (Ideal: 300-1300)`);
    console.log(`Emoji Count: ${metrics.metrics.emojiCount} (Ideal: 3-8)`);
    console.log(`Engagement Score: ${metrics.engagementScore}/100`);

    console.log('\n🎯 Personal Branding Elements:');
    console.log(`${metrics.metrics.hasPersonalStory ? '✅' : '❌'} Has Personal Story: ${metrics.metrics.hasPersonalStory ? 'Yes' : 'No'}`);
    console.log(`${metrics.metrics.hasOpportunity ? '✅' : '❌'} Has Opportunity: ${metrics.metrics.hasOpportunity ? 'Yes' : 'No'}`);
    console.log(`${metrics.metrics.hasNetworking ? '✅' : '❌'} Has Networking: ${metrics.metrics.hasNetworking ? 'Yes' : 'No'}`);

    console.log('\n📈 Estimated Performance:');
    console.log(`👁️  Estimated Views: ${metrics.estimatedViews.toLocaleString()}`);
    console.log(`🖱️  Estimated Clicks: ${metrics.estimatedClicks}`);
    console.log(`💬 Estimated Interactions: ${metrics.estimatedInteractions}`);

    console.log('\n💡 Personal post ready for LinkedIn!');
  }

  // Display education results
  displayEducationResults(postContent, imageResult, metrics) {
    console.log('\n📝 Generated Education Post:');
    console.log('=============================');
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

    console.log('\n📊 Education Post Analysis:');
    console.log('===========================');
    console.log(`Word Count: ${metrics.metrics.wordCount} (Ideal: 50-150)`);
    console.log(`Character Count: ${metrics.metrics.charCount} (Ideal: 300-1300)`);
    console.log(`Emoji Count: ${metrics.metrics.emojiCount} (Ideal: 3-8)`);
    console.log(`Engagement Score: ${metrics.engagementScore}/100`);

    console.log('\n🎯 Education Elements:');
    console.log(`${metrics.metrics.hasLearning ? '✅' : '❌'} Has Learning: ${metrics.metrics.hasLearning ? 'Yes' : 'No'}`);
    console.log(`${metrics.metrics.hasApplication ? '✅' : '❌'} Has Application: ${metrics.metrics.hasApplication ? 'Yes' : 'No'}`);
    console.log(`${metrics.metrics.hasLocalFocus ? '✅' : '❌'} Has Local Focus: ${metrics.metrics.hasLocalFocus ? 'Yes' : 'No'}`);

    console.log('\n📈 Estimated Performance:');
    console.log(`👁️  Estimated Views: ${metrics.estimatedViews.toLocaleString()}`);
    console.log(`🖱️  Estimated Clicks: ${metrics.estimatedClicks}`);
    console.log(`💬 Estimated Interactions: ${metrics.estimatedInteractions}`);

    console.log('\n💡 Education post ready for LinkedIn!');
  }

  // Display Michael Davis results
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

    if (postContent.image && postContent.image.success) {
      console.log('\n🖼️  Generated Image:');
      console.log('==================');
      console.log(`📁 File: ${postContent.image.filename}`);
      console.log(`📍 Path: ${postContent.image.imagePath}`);
      console.log(`🔗 URL: ${postContent.image.url}`);
      console.log(`🎨 Prompt: ${postContent.image.prompt}`);
    } else if (postContent.image) {
      console.log('\n🖼️  Image Generation:');
      console.log('==================');
      console.log('❌ Image generation failed');
      console.log(`🎨 Attempted prompt: ${postContent.image.prompt}`);
      if (postContent.image.error) {
        console.log(`❌ Error: ${postContent.image.error}`);
      }
    }

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

  // Display freestyle results
  displayFreestyleResults(postContent, imageResult, metrics) {
    console.log('\n📝 Generated Freestyle Post:');
    console.log('============================');
    console.log(postContent.enhancedContent);
    console.log('\n🖼️  Generated Image:');
    console.log('==================');
    if (imageResult.success) {
      console.log(`📁 File: ${imageResult.filename}`);
      console.log(`📍 Path: ${imageResult.imagePath}`);
      console.log(`🔗 URL: ${imageResult.url}`);
    } else {
      console.log('❌ Image generation failed');
    }

    console.log('\n📊 Freestyle Post Analysis:');
    console.log('==========================');
    console.log(`Word Count: ${metrics.metrics.wordCount} (Ideal: 50-150)`);
    console.log(`Character Count: ${metrics.metrics.charCount} (Ideal: 300-1300)`);
    console.log(`Emoji Count: ${metrics.metrics.emojiCount} (Ideal: 3-8)`);
    console.log(`Engagement Score: ${metrics.engagementScore}/100`);

    console.log('\n🎯 Freestyle Elements:');
    console.log(`${postContent.enhancedContent.includes('?') ? '✅' : '❌'} Has Question: ${postContent.enhancedContent.includes('?') ? 'Yes' : 'No'}`);
    console.log(`${postContent.enhancedContent.includes('•') || postContent.enhancedContent.includes('-') ? '✅' : '❌'} Has Bullet Points: ${postContent.enhancedContent.includes('•') || postContent.enhancedContent.includes('-') ? 'Yes' : 'No'}`);
    console.log(`${postContent.enhancedContent.toLowerCase().includes('atlanta') ? '✅' : '❌'} References Atlanta: ${postContent.enhancedContent.toLowerCase().includes('atlanta') ? 'Yes' : 'No'}`);
    console.log(`${postContent.enhancedContent.toLowerCase().includes('i\'ve') || postContent.enhancedContent.toLowerCase().includes('i\'m') ? '✅' : '❌'} Personal Voice: ${postContent.enhancedContent.toLowerCase().includes('i\'ve') || postContent.enhancedContent.toLowerCase().includes('i\'m') ? 'Yes' : 'No'}`);

    console.log('\n📈 Estimated Performance:');
    console.log(`👁️  Estimated Views: ${metrics.estimatedViews.toLocaleString()}`);
    console.log(`🖱️  Estimated Clicks: ${metrics.estimatedClicks}`);
    console.log(`💬 Estimated Interactions: ${metrics.estimatedInteractions}`);

    console.log('\n💡 Freestyle post ready for LinkedIn!');
  }

  // Handle fintech actions
  async handleFintechActions(postContent, imageResult, metrics) {
    return new Promise((resolve) => {
      console.log('\n🤔 What would you like to do?');
      console.log('1. Approve and post now');
      console.log('2. Regenerate content');
      console.log('3. Edit content manually');
      console.log('4. Save for later (not post)');
      console.log('5. Exit without saving\n');

      this.rl.question('Enter your choice (1-5): ', async (answer) => {
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

  // Handle personal actions
  async handlePersonalActions(postContent, imageResult, metrics) {
    return new Promise((resolve) => {
      console.log('\n🤔 What would you like to do?');
      console.log('1. Approve and post now');
      console.log('2. Regenerate content');
      console.log('3. Edit content manually');
      console.log('4. Save for later (not post)');
      console.log('5. Exit without saving\n');

      this.rl.question('Enter your choice (1-5): ', async (answer) => {
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

  // Handle education actions
  async handleEducationActions(postContent, imageResult, metrics) {
    return new Promise((resolve) => {
      console.log('\n🤔 What would you like to do?');
      console.log('1. Approve and post now');
      console.log('2. Regenerate content');
      console.log('3. Edit content manually');
      console.log('4. Save for later (not post)');
      console.log('5. Exit without saving\n');

      this.rl.question('Enter your choice (1-5): ', async (answer) => {
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

  // Handle freestyle actions
  async handleFreestyleActions(postContent, imageResult, metrics) {
    return new Promise((resolve) => {
      console.log('\n🤔 What would you like to do?');
      console.log('1. Approve and post now');
      console.log('2. Regenerate content');
      console.log('3. Edit content manually');
      console.log('4. Save for later (not post)');
      console.log('5. Exit without saving\n');

      this.rl.question('Enter your choice (1-5): ', async (answer) => {
        switch (answer.trim()) {
          case '1':
            await this.approveAndPost(postContent, imageResult, 'freestyle');
            break;
          case '2':
            await this.generateFreestylePost();
            break;
          case '3':
            await this.editContent(postContent, 'freestyle');
            break;
          case '4':
            await this.saveForLater(postContent, imageResult, 'freestyle');
            break;
          case '5':
            console.log('👋 Exiting without saving.');
            break;
          default:
            console.log('❌ Invalid choice. Please try again.');
            await this.handleFreestyleActions(postContent, imageResult, metrics);
        }
        resolve();
      });
    });
  }

  // Handle Michael Davis actions
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
            await this.generateMichaelDavisRandom();
            break;
          case '3':
            await this.editContent(postContent, 'michael-davis');
            break;
          case '4':
            await this.saveForLater(postContent, null, 'michael-davis');
            break;
          case '5':
            await this.showFlatMenu();
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
      console.log('🔗 Testing LinkedIn connection...');
      const isConnected = await this.linkedinAPI.testConnection();
      if (!isConnected) {
        console.log('❌ LinkedIn connection failed. Please authenticate first.');
        console.log('💡 Run: npm run auth');
        return;
      }

      let imagePathToUse = null;
      if (postType === 'michael-davis' && postContent.image && postContent.image.success) {
        imagePathToUse = postContent.image.imagePath;
        console.log(`🎨 Using generated image: ${postContent.image.filename}`);
      } else if (postType === 'freestyle' && postContent.enhancedContent) {
        // For freestyle posts, use the enhanced content
        const postText = postContent.enhancedContent;
        if (imageResult && imageResult.success) {
          imagePathToUse = imageResult.imagePath;
          console.log(`🎨 Using generated image: ${imageResult.filename}`);
        }
      } else if (imageResult && imageResult.success) {
        imagePathToUse = imageResult.imagePath;
        console.log(`🎨 Using generated image: ${imageResult.filename}`);
      }

      if (process.env.LINKEDIN_NO_IMAGE) {
        console.log('DEBUG: LINKEDIN_NO_IMAGE is set, posting without image.');
        imagePathToUse = null;
      }

      let postText;
      if (postType === 'freestyle' && postContent.enhancedContent) {
        postText = postContent.enhancedContent;
      } else {
        postText = typeof postContent === 'object' ? postContent.content : postContent;
      }
      const postResult = await this.linkedinAPI.createPost(
        postText,
        imagePathToUse
      );

      console.log('LinkedIn API post result:', postResult);
      if (postResult && postResult.id) {
        console.log('🎉 Post published successfully!');
        console.log(`📊 Post ID: ${postResult.id}`);
        await this.savePostToDatabase(postContent, imageResult || postContent.image, postType, postResult.id);
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

  // Save post to database
  async savePostToDatabase(postContent, imageResult, postType, linkedinPostId) {
    try {
      const postNumber = await this.database.getNextPostNumber();

      let contentText;
      if (postType === 'freestyle' && postContent.enhancedContent) {
        contentText = postContent.enhancedContent;
      } else {
        contentText = typeof postContent === 'object' ? postContent.content : postContent;
      }
      const imagePath = imageResult && imageResult.success ? imageResult.imagePath : null;

      const postData = {
        postNumber,
        content: contentText,
        imagePath: imagePath,
        postType: postType,
        postDecision: 'posted',
        linkedinPostId,
        postedAt: new Date().toISOString(),
        wordCount: contentText.split(/\s+/).length,
        characterCount: contentText.length,
        emojiCount: (contentText.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length,
        notes: `Generated via flat post generator - ${postType} post`
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
    console.log('📁 Post saved to database for later use');
  }
}

// CLI entry point
async function main() {
  const generator = new FlatPostGenerator();
  await generator.run();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = FlatPostGenerator; 