const EnhancedContentGenerator = require('../generators/fintech/generator');
const PostDatabase = require('../utils/database');
const readline = require('readline');
const moment = require('moment-timezone');
const config = require('../../config.js');

class EnhancedPostPreview {
  constructor() {
    this.contentGenerator = new EnhancedContentGenerator();
    this.database = new PostDatabase();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async initialize() {
    await this.database.initialize();
  }

  async generateAndPreview() {
    console.log('🔍 Enhanced FintechPulse Post Preview');
    console.log('=====================================\n');

    try {
      // Initialize database
      await this.initialize();
      
      // Get next post number
      const postNumber = await this.database.getNextPostNumber();
      
      // Get previous posts for similarity analysis
      const previousPosts = await this.database.getPreviousPosts(5);
      
      // Generate optimized content
      console.log('🤖 Generating optimized content...');
      let postContent;
      
      try {
        postContent = await this.contentGenerator.generateOptimizedPost();
        console.log('✅ AI content generation successful!');
      } catch (error) {
        console.log('⚠️  OpenAI failed, using fallback content...');
        postContent = this.contentGenerator.generateFallbackOptimizedPost();
        console.log('✅ Fallback content generation successful!');
      }

      // Generate actual image
      console.log('🎨 Generating image with DALL-E...');
      let imageResult;
      try {
        imageResult = await this.contentGenerator.generateImage(postContent);
      } catch (error) {
        console.log('⚠️  Image generation failed, using fallback...');
        imageResult = {
          success: false,
          imagePath: null,
          filename: null,
          prompt: "Professional fintech dashboard with data visualization, modern office setting",
          error: error.message
        };
      }

      // Calculate engagement metrics
      const engagementMetrics = this.contentGenerator.calculateEngagementMetrics(postContent);
      
      // Analyze similarity
      const similarityAnalysis = await this.contentGenerator.analyzeSimilarity(postContent, previousPosts);

      // Display the post with full analysis
      this.displayPostAnalysis(postContent, imageResult, engagementMetrics, similarityAnalysis, postNumber);

      // Ask for user action
      await this.askUserAction(postContent, imageResult, engagementMetrics, similarityAnalysis, postNumber);

    } catch (error) {
      console.error('❌ Error generating preview:', error.message);
      process.exit(1);
    }
  }

  displayPostAnalysis(postContent, imageResult, engagementMetrics, similarityAnalysis, postNumber) {
    console.log('\n📝 Generated Post:');
    console.log('==================');
    console.log(postContent);
    console.log('==================');
    
    if (imageResult.success) {
      console.log('\n🖼️  Generated Image:');
      console.log('==================');
      console.log(`📁 File: ${imageResult.filename}`);
      console.log(`📍 Path: ${imageResult.imagePath}`);
      console.log(`🔗 URL: ${imageResult.url}`);
      console.log('==================');
    } else {
      console.log('\n🎨 Image Prompt (Generation Failed):');
      console.log('=====================================');
      console.log(imageResult.prompt);
      console.log(`❌ Error: ${imageResult.error}`);
      console.log('=====================================');
    }
    
    console.log('\n📊 Post Analysis:');
    console.log('=================');
    console.log(`Post #: ${postNumber}`);
    console.log(`Word Count: ${engagementMetrics.metrics.wordCount} (Ideal: 50-150)`);
    console.log(`Character Count: ${engagementMetrics.metrics.charCount} (Ideal: 300-1300)`);
    console.log(`Emoji Count: ${engagementMetrics.metrics.emojiCount} (Ideal: 5-12)`);
    console.log(`Engagement Score: ${engagementMetrics.engagementScore}/100`);
    
    console.log('\n🎯 Engagement Elements:');
    console.log(`✅ Has Question: ${engagementMetrics.metrics.hasQuestion ? 'Yes' : 'No'}`);
    console.log(`✅ Has Call-to-Action: ${engagementMetrics.metrics.hasCallToAction ? 'Yes' : 'No'}`);
    console.log(`✅ Has Statistics: ${engagementMetrics.metrics.hasStats ? 'Yes' : 'No'}`);
    console.log(`✅ Has Attention Grabber: ${engagementMetrics.metrics.hasAttentionGrabber ? 'Yes' : 'No'}`);
    
    console.log('\n📈 Estimated Performance:');
    console.log(`👁️  Estimated Views: ${engagementMetrics.estimatedViews.toLocaleString()}`);
    console.log(`🖱️  Estimated Clicks: ${engagementMetrics.estimatedClicks.toLocaleString()}`);
    console.log(`💬 Estimated Interactions: ${engagementMetrics.estimatedInteractions.toLocaleString()}`);
    
    console.log('\n🔄 Similarity Analysis:');
    console.log(`Similarity Score: ${(similarityAnalysis.similarityScore * 100).toFixed(1)}%`);
    console.log(`Status: ${similarityAnalysis.recommendation}`);
    
    // Performance rating
    const performanceRating = this.calculatePerformanceRating(engagementMetrics, similarityAnalysis);
    console.log(`\n🏆 Performance Rating: ${performanceRating.rating} (${performanceRating.score}/100)`);
    console.log(`💡 Recommendation: ${performanceRating.recommendation}`);
  }

  calculatePerformanceRating(engagementMetrics, similarityAnalysis) {
    let score = engagementMetrics.engagementScore;
    
    // Penalize for similarity
    if (similarityAnalysis.isTooSimilar) {
      score -= 20;
    } else if (similarityAnalysis.similarityScore > 0.5) {
      score -= 10;
    }
    
    // Bonus for high engagement elements
    if (engagementMetrics.metrics.hasQuestion && engagementMetrics.metrics.hasCallToAction) {
      score += 10;
    }
    
    score = Math.max(0, Math.min(100, score));
    
    let rating, recommendation;
    if (score >= 80) {
      rating = 'EXCELLENT';
      recommendation = 'Post immediately - high viral potential';
    } else if (score >= 60) {
      rating = 'GOOD';
      recommendation = 'Post with minor edits if needed';
    } else if (score >= 40) {
      rating = 'FAIR';
      recommendation = 'Consider regenerating for better performance';
    } else {
      rating = 'POOR';
      recommendation = 'Regenerate - needs significant improvement';
    }
    
    return { rating, score, recommendation };
  }

  async askUserAction(postContent, imageResult, engagementMetrics, similarityAnalysis, postNumber) {
    return new Promise((resolve) => {
      console.log('\n🤔 What would you like to do?');
      console.log('1. Approve and post now');
      console.log('2. Regenerate content');
      console.log('3. Edit content manually');
      console.log('4. Save for later (not post)');
      console.log('5. Reject and regenerate');
      console.log('6. View analytics dashboard');
      console.log('7. Exit without saving');
      
      this.rl.question('\nEnter your choice (1-7): ', async (answer) => {
        switch (answer.trim()) {
          case '1':
            await this.approveAndPost(postContent, imageResult, engagementMetrics, similarityAnalysis, postNumber);
            break;
          case '2':
            console.log('\n🔄 Regenerating content...\n');
            this.rl.close();
            const newPreview = new EnhancedPostPreview();
            await newPreview.generateAndPreview();
            break;
          case '3':
            await this.editContent(postContent, imageResult, engagementMetrics, similarityAnalysis, postNumber);
            break;
          case '4':
            await this.saveForLater(postContent, imageResult, engagementMetrics, similarityAnalysis, postNumber);
            break;
          case '5':
            await this.rejectAndRegenerate(postContent, postNumber);
            break;
          case '6':
            await this.showAnalyticsDashboard();
            break;
          case '7':
            console.log('👋 Exiting without saving.');
            this.rl.close();
            process.exit(0);
            break;
          default:
            console.log('❌ Invalid choice. Please try again.');
            await this.askUserAction(postContent, imageResult, engagementMetrics, similarityAnalysis, postNumber);
            break;
        }
        resolve();
      });
    });
  }

  async approveAndPost(postContent, imageResult, engagementMetrics, similarityAnalysis, postNumber) {
    console.log('\n🚀 Posting to LinkedIn...');
    
    try {
      // Save to database first
      const postId = await this.savePostToDatabase(postContent, imageResult, engagementMetrics, similarityAnalysis, postNumber, 'approved');
      
      // Post to LinkedIn
      const LinkedInAPI = require('./linkedin-api');
      const linkedinAPI = new LinkedInAPI();
      
      const result = await linkedinAPI.createPost(postContent, imageResult.success ? imageResult.imagePath : null);
      
      // Update database with LinkedIn post ID
      await this.database.updatePostPosted(postId, result.id, new Date().toISOString());
      
      console.log('✅ Post published successfully!');
      console.log(`📊 LinkedIn Post ID: ${result.id}`);
      console.log(`💾 Database ID: ${postId}`);
      
    } catch (error) {
      console.error('❌ Error posting:', error.message);
    }
    
    this.rl.close();
    process.exit(0);
  }

  async savePostToDatabase(postContent, imageResult, engagementMetrics, similarityAnalysis, postNumber, decision) {
    const now = moment().tz(config.posting.timezone);
    
    const postData = {
      postNumber,
      content: postContent,
      imagePrompt: imageResult.prompt,
      imagePath: imageResult.success ? imageResult.imagePath : null,
      scheduledTime: now.format('YYYY-MM-DD HH:mm:ss'),
      timeOfDay: now.format('HH:mm'),
      dayOfWeek: now.format('dddd'),
      wordCount: engagementMetrics.metrics.wordCount,
      characterCount: engagementMetrics.metrics.charCount,
      emojiCount: engagementMetrics.metrics.emojiCount,
      engagementScore: engagementMetrics.engagementScore,
      estimatedViews: engagementMetrics.estimatedViews,
      estimatedClicks: engagementMetrics.estimatedClicks,
      estimatedInteractions: engagementMetrics.estimatedInteractions,
      similarityScore: similarityAnalysis.similarityScore,
      hasQuestion: engagementMetrics.metrics.hasQuestion,
      hasCallToAction: engagementMetrics.metrics.hasCallToAction,
      hasStats: engagementMetrics.metrics.hasStats,
      hasAttentionGrabber: engagementMetrics.metrics.hasAttentionGrabber,
      notes: `Performance Rating: ${this.calculatePerformanceRating(engagementMetrics, similarityAnalysis).rating}${imageResult.success ? ' | Image: ' + imageResult.filename : ' | Image generation failed'}`
    };

    return await this.database.savePost(postData);
  }

  async editContent(originalContent, imageResult, engagementMetrics, similarityAnalysis, postNumber) {
    console.log('\n✏️  Manual Edit Mode');
    console.log('==================');
    console.log('Current content:');
    console.log(originalContent);
    console.log('==================');
    console.log('\nEnter your edited content (press Enter twice to finish):');
    
    let editedContent = '';
    let lines = [];
    
    return new Promise((resolve) => {
      this.rl.on('line', (line) => {
        if (line.trim() === '' && lines.length > 0 && lines[lines.length - 1].trim() === '') {
          // Double Enter detected, finish editing
          editedContent = lines.slice(0, -1).join('\n');
          
          // Recalculate metrics for edited content
          const newEngagementMetrics = this.contentGenerator.calculateEngagementMetrics(editedContent);
          
          console.log('\n📝 Edited content:');
          console.log('==================');
          console.log(editedContent);
          console.log('==================');
          
          console.log('\n📊 Updated Metrics:');
          console.log(`Engagement Score: ${newEngagementMetrics.engagementScore}/100`);
          console.log(`Estimated Views: ${newEngagementMetrics.estimatedViews.toLocaleString()}`);
          
          this.askUserAction(editedContent, imageResult, newEngagementMetrics, similarityAnalysis, postNumber);
          resolve();
        } else {
          lines.push(line);
        }
      });
    });
  }

  async saveForLater(postContent, imageResult, engagementMetrics, similarityAnalysis, postNumber) {
    await this.savePostToDatabase(postContent, imageResult, engagementMetrics, similarityAnalysis, postNumber, 'saved');
    
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `draft-post-${timestamp}.txt`;
    
    try {
      fs.writeFileSync(filename, postContent);
      console.log(`\n💾 Post saved to database and file: ${filename}`);
      console.log('You can edit this file and post it later using the manual post feature.');
    } catch (error) {
      console.error('❌ Error saving file:', error.message);
    }
    
    this.rl.close();
    process.exit(0);
  }

  async rejectAndRegenerate(postContent, postNumber) {
    await this.database.updatePostDecision(postNumber, 'rejected');
    console.log('\n❌ Post rejected and marked in database.');
    console.log('🔄 Regenerating content...\n');
    
    this.rl.close();
    const newPreview = new EnhancedPostPreview();
    await newPreview.generateAndPreview();
  }

  async showAnalyticsDashboard() {
    console.log('\n📊 Analytics Dashboard');
    console.log('=====================');
    
    try {
      const stats = await this.database.getPostStats();
      const recentPosts = await this.database.getRecentPosts(5);
      const analytics = await this.database.generateAnalyticsReport();
      
      console.log('\n📈 Overall Statistics:');
      console.log(`Total Posts: ${stats.total_posts}`);
      console.log(`Posted: ${stats.posted_posts}`);
      console.log(`Rejected: ${stats.rejected_posts}`);
      console.log(`Average Engagement Score: ${stats.avg_engagement_score?.toFixed(1) || 'N/A'}`);
      console.log(`Average Estimated Views: ${stats.avg_estimated_views?.toLocaleString() || 'N/A'}`);
      
      console.log('\n📅 Recent Posts:');
      recentPosts.forEach(post => {
        console.log(`#${post.post_number} - ${post.post_decision} - Score: ${post.engagement_score}/100`);
      });
      
      console.log('\n📊 30-Day Analytics:');
      analytics.slice(0, 7).forEach(day => {
        console.log(`${day.date}: ${day.total_posts} posts, ${day.avg_engagement_score?.toFixed(1) || 'N/A'} avg score`);
      });
      
    } catch (error) {
      console.error('❌ Error loading analytics:', error.message);
    }
    
    // Return to main menu
    await this.askUserAction('', '', {}, {}, 0);
  }

  // Generate multiple options
  async generateMultipleOptions(count = 3) {
    console.log(`🔍 Generating ${count} optimized post options...\n`);
    
    const options = [];
    const postNumber = await this.database.getNextPostNumber();
    
    for (let i = 0; i < count; i++) {
      console.log(`Generating option ${i + 1}/${count}...`);
      
      try {
        let postContent = await this.contentGenerator.generateOptimizedPost();
        const engagementMetrics = this.contentGenerator.calculateEngagementMetrics(postContent);
        const imagePrompt = await this.contentGenerator.generateImagePrompt(postContent);
        
        options.push({
          content: postContent,
          imagePrompt,
          engagementMetrics,
          postNumber: postNumber + i
        });
      } catch (error) {
        console.log('Using fallback content for this option...');
        const fallbackContent = this.contentGenerator.generateFallbackOptimizedPost();
        const engagementMetrics = this.contentGenerator.calculateEngagementMetrics(fallbackContent);
        const imagePrompt = "Professional fintech dashboard with data visualization";
        
        options.push({
          content: fallbackContent,
          imagePrompt,
          engagementMetrics,
          postNumber: postNumber + i
        });
      }
    }

    // Display all options
    console.log('\n📝 Generated Options:');
    console.log('=====================');
    
    options.forEach((option, index) => {
      console.log(`\n--- OPTION ${index + 1} ---`);
      console.log(option.content);
      console.log(`\n📊 Metrics: Score ${option.engagementMetrics.engagementScore}/100 | Views: ${option.engagementMetrics.estimatedViews.toLocaleString()} | Clicks: ${option.engagementMetrics.estimatedClicks.toLocaleString()}`);
      console.log('---');
    });

    // Ask user to select
    return new Promise((resolve) => {
      this.rl.question(`\nSelect an option (1-${count}) or 0 to regenerate all: `, (answer) => {
        const choice = parseInt(answer.trim());
        
        if (choice === 0) {
          console.log('\n🔄 Regenerating all options...\n');
          this.rl.close();
          this.generateMultipleOptions(count);
        } else if (choice >= 1 && choice <= count) {
          const selectedOption = options[choice - 1];
          console.log(`\n✅ Selected Option ${choice}`);
          this.askUserAction(selectedOption.content, selectedOption.imagePrompt, selectedOption.engagementMetrics, { similarityScore: 0, isTooSimilar: false, recommendation: 'New content' }, selectedOption.postNumber);
        } else {
          console.log('❌ Invalid choice. Please try again.');
          this.generateMultipleOptions(count);
        }
        resolve();
      });
    });
  }
}

// Main execution
async function main() {
  const preview = new EnhancedPostPreview();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--multiple')) {
    const count = parseInt(args[args.indexOf('--multiple') + 1]) || 3;
    await preview.generateMultipleOptions(count);
  } else {
    await preview.generateAndPreview();
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Exiting enhanced preview mode.');
  process.exit(0);
});

main().catch(error => {
  console.error('❌ Enhanced preview failed:', error);
  process.exit(1);
}); 