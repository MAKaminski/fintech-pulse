const LinkedInAnalytics = require('./linkedin-analytics');
const AdaptiveContentGenerator = require('./adaptive-content-generator');
const PostDatabase = require('./database');
const fs = require('fs');

class AnalyticsDashboard {
  constructor() {
    this.analytics = new LinkedInAnalytics();
    this.contentGenerator = new AdaptiveContentGenerator();
    this.database = new PostDatabase();
  }

  async initialize() {
    await this.database.initialize();
  }

  // Main dashboard function
  async showDashboard() {
    console.log('\n📊 FintechPulse Analytics Dashboard');
    console.log('=====================================\n');

    try {
      // Get optimization status
      const optimizationStatus = this.contentGenerator.getOptimizationStatus();
      
      // Get performance analysis
      const performanceAnalysis = await this.contentGenerator.analyzeContentPerformance();
      
      // Get database stats
      const stats = await this.database.getPostStats();
      
      // Display optimization status
      this.displayOptimizationStatus(optimizationStatus);
      
      // Display performance summary
      this.displayPerformanceSummary(performanceAnalysis);
      
      // Display database statistics
      this.displayDatabaseStats(stats);
      
      // Display variance analysis
      if (performanceAnalysis.analysis?.analytics?.length > 0) {
        this.displayVarianceAnalysis(performanceAnalysis.analysis);
      }
      
      // Display recommendations
      this.displayRecommendations(performanceAnalysis.suggestions, optimizationStatus.recommendations);
      
      // Show menu options
      await this.showMenu();
      
    } catch (error) {
      console.error('❌ Error loading dashboard:', error.message);
    }
  }

  displayOptimizationStatus(status) {
    console.log('🎯 Optimization Status:');
    console.log('=======================');
    
    if (status.status === 'not_optimized') {
      console.log('❌ Status: Not Optimized');
      console.log(`📝 ${status.message}`);
      console.log('💡 Recommendations:');
      status.recommendations.forEach(rec => console.log(`   • ${rec}`));
    } else {
      console.log('✅ Status: Optimized');
      console.log(`📊 Confidence: ${status.confidence.toUpperCase()}`);
      console.log(`🔄 Last Updated: ${status.lastOptimization}`);
      console.log(`🎯 Engagement Multiplier: ${status.engagementMultiplier?.toFixed(2) || 'N/A'}`);
      
      if (status.recommendations.length > 0) {
        console.log('💡 Recommendations:');
        status.recommendations.forEach(rec => console.log(`   • ${rec}`));
      }
    }
    console.log('');
  }

  displayPerformanceSummary(analysis) {
    console.log('📈 Performance Summary:');
    console.log('=======================');
    
    if (analysis.summary) {
      console.log(`📊 Total Posts Analyzed: ${analysis.summary.totalPosts}`);
      console.log(`🚀 High Performers (>5% engagement): ${analysis.summary.highPerformers}`);
      console.log(`📉 Low Performers (<2% engagement): ${analysis.summary.lowPerformers}`);
      console.log(`📊 Average Variance: ${analysis.summary.averageVariance?.toFixed(1) || 'N/A'}%`);
    } else {
      console.log('📝 No performance data available yet');
    }
    console.log('');
  }

  displayDatabaseStats(stats) {
    console.log('💾 Database Statistics:');
    console.log('=======================');
    console.log(`📝 Total Posts: ${stats.total_posts || 0}`);
    console.log(`✅ Posted: ${stats.posted_posts || 0}`);
    console.log(`❌ Rejected: ${stats.rejected_posts || 0}`);
    console.log(`📊 Avg Engagement Score: ${stats.avg_engagement_score?.toFixed(1) || 'N/A'}/100`);
    console.log(`👁️  Avg Estimated Views: ${stats.avg_estimated_views?.toLocaleString() || 'N/A'}`);
    console.log(`👁️  Avg Actual Views: ${stats.avg_actual_views?.toLocaleString() || 'N/A'}`);
    console.log(`💬 Avg Actual Engagement Rate: ${stats.avg_actual_engagement_rate?.toFixed(2) || 'N/A'}%`);
    console.log('');
  }

  displayVarianceAnalysis(analysis) {
    console.log('📊 Variance Analysis:');
    console.log('=====================');
    
    if (analysis.insights) {
      analysis.insights.forEach(insight => {
        console.log(`🔍 ${insight.title}:`);
        console.log(`   ${insight.description}`);
        if (insight.details) {
          console.log(`   ${insight.details}`);
        }
        console.log('');
      });
    }
  }

  displayRecommendations(suggestions, optimizationRecs) {
    console.log('💡 Recommendations:');
    console.log('===================');
    
    const allRecommendations = [...(suggestions || []), ...(optimizationRecs || [])];
    
    if (allRecommendations.length === 0) {
      console.log('✅ No specific recommendations at this time');
    } else {
      allRecommendations.forEach((rec, index) => {
        if (typeof rec === 'string') {
          console.log(`${index + 1}. ${rec}`);
        } else {
          console.log(`${index + 1}. ${rec.title || rec.type}:`);
          console.log(`   ${rec.description || rec.action}`);
        }
      });
    }
    console.log('');
  }

  async showMenu() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

    while (true) {
      console.log('🔧 Analytics Actions:');
      console.log('1. 📊 Generate Full Analytics Report');
      console.log('2. 🔄 Update Optimization Parameters');
      console.log('3. 🎯 Generate Optimized Post');
      console.log('4. 📈 View Detailed Performance Data');
      console.log('5. 🎨 Generate Multiple Post Variations');
      console.log('6. 📋 Export Analytics Data');
      console.log('7. 🔍 Analyze Specific Post Performance');
      console.log('8. ⚙️  Show Optimization Configuration');
      console.log('9. 🔙 Return to Main Menu');
      console.log('0. 🚪 Exit');

      const choice = await question('\nSelect an option: ');

      switch (choice) {
        case '1':
          await this.generateFullReport();
          break;
        case '2':
          await this.updateOptimizationParameters();
          break;
        case '3':
          await this.generateOptimizedPost();
          break;
        case '4':
          await this.viewDetailedPerformance();
          break;
        case '5':
          await this.generateMultipleVariations();
          break;
        case '6':
          await this.exportAnalyticsData();
          break;
        case '7':
          await this.analyzeSpecificPost();
          break;
        case '8':
          await this.showOptimizationConfig();
          break;
        case '9':
          rl.close();
          return;
        case '0':
          rl.close();
          process.exit(0);
        default:
          console.log('❌ Invalid option. Please try again.');
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    }
  }

  async generateFullReport() {
    console.log('📊 Generating comprehensive analytics report...');
    
    try {
      const report = await this.analytics.generateAnalyticsReport();
      
      if (report) {
        console.log('✅ Report generated successfully!');
        console.log('📁 Saved to: analytics-report.json');
        console.log(`📊 Analyzed ${report.summary?.totalPosts || 0} posts`);
        console.log(`📈 Average engagement rate: ${report.summary?.averageEngagementRate?.toFixed(2) || 'N/A'}%`);
      } else {
        console.log('❌ Failed to generate report');
      }
    } catch (error) {
      console.error('❌ Error generating report:', error.message);
    }
  }

  async updateOptimizationParameters() {
    console.log('🔄 Updating optimization parameters...');
    
    try {
      const config = await this.analytics.updateContentGenerationParameters();
      
      if (config) {
        console.log('✅ Optimization parameters updated!');
        console.log(`📊 Confidence: ${config.confidence}`);
        console.log(`🎯 Engagement multiplier: ${config.engagementScoring?.multiplier?.toFixed(2) || 'N/A'}`);
      } else {
        console.log('❌ Failed to update parameters');
      }
    } catch (error) {
      console.error('❌ Error updating parameters:', error.message);
    }
  }

  async generateOptimizedPost() {
    console.log('🎯 Generating optimized post...');
    
    try {
      const result = await this.contentGenerator.generateOptimizedPost();
      
      console.log('\n📝 Generated Post:');
      console.log('==================');
      console.log(result.content);
      console.log('==================');
      
      console.log('\n📊 Performance Metrics:');
      console.log(`🎯 Engagement Score: ${result.metrics.engagementScore}/100`);
      console.log(`👁️  Estimated Views: ${result.metrics.estimatedViews.toLocaleString()}`);
      console.log(`💬 Estimated Interactions: ${result.metrics.estimatedInteractions.toLocaleString()}`);
      
      if (result.optimizationInfo.configUsed) {
        console.log(`🔄 Optimization Applied: Yes (${result.optimizationInfo.confidence} confidence)`);
        console.log(`📊 Multiplier: ${result.metrics.multiplier?.toFixed(2) || 'N/A'}`);
      }
      
    } catch (error) {
      console.error('❌ Error generating post:', error.message);
    }
  }

  async viewDetailedPerformance() {
    console.log('📈 Loading detailed performance data...');
    
    try {
      const analytics = await this.analytics.getAllPostAnalytics();
      
      if (analytics.length === 0) {
        console.log('📝 No performance data available');
        return;
      }
      
      console.log('\n📊 Detailed Performance Data:');
      console.log('==============================');
      
      analytics.forEach((post, index) => {
        console.log(`\n📝 Post #${post.postNumber}:`);
        console.log(`   Content: ${post.content.substring(0, 100)}...`);
        console.log(`   Views: ${post.views.toLocaleString()} (Est: ${post.estimatedViews.toLocaleString()})`);
        console.log(`   Engagement Rate: ${post.engagementRate.toFixed(2)}%`);
        console.log(`   Likes: ${post.likes}, Comments: ${post.comments}, Shares: ${post.shares}`);
        console.log(`   Engagement Score: ${post.engagementScore}/100`);
        
        const variance = this.analytics.calculateVariance(post.estimatedViews, post.views);
        console.log(`   Variance: ${variance.toFixed(1)}%`);
      });
      
    } catch (error) {
      console.error('❌ Error loading performance data:', error.message);
    }
  }

  async generateMultipleVariations() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

    try {
      const count = await question('How many variations? (default: 3): ');
      const variations = parseInt(count) || 3;
      
      console.log(`🔄 Generating ${variations} optimized variations...`);
      
      const posts = await this.contentGenerator.generateMultipleOptimizedPosts(variations);
      
      posts.forEach((post, index) => {
        console.log(`\n📝 Variation ${index + 1}:`);
        console.log('==================');
        console.log(post.content);
        console.log('==================');
        console.log(`📊 Engagement Score: ${post.metrics.engagementScore}/100`);
        console.log(`👁️  Estimated Views: ${post.metrics.estimatedViews.toLocaleString()}`);
        console.log(`💬 Estimated Interactions: ${post.metrics.estimatedInteractions.toLocaleString()}`);
      });
      
    } catch (error) {
      console.error('❌ Error generating variations:', error.message);
    } finally {
      rl.close();
    }
  }

  async exportAnalyticsData() {
    console.log('📋 Exporting analytics data...');
    
    try {
      const analytics = await this.analytics.getAllPostAnalytics();
      const stats = await this.database.getPostStats();
      const optimizationStatus = this.contentGenerator.getOptimizationStatus();
      
      const exportData = {
        exportedAt: new Date().toISOString(),
        analytics,
        statistics: stats,
        optimizationStatus,
        summary: {
          totalPosts: analytics.length,
          averageEngagementRate: analytics.reduce((sum, post) => sum + post.engagementRate, 0) / analytics.length,
          averageVariance: analytics.reduce((sum, post) => 
            sum + Math.abs(this.analytics.calculateVariance(post.estimatedViews, post.views)), 0) / analytics.length
        }
      };
      
      fs.writeFileSync('analytics-export.json', JSON.stringify(exportData, null, 2));
      
      console.log('✅ Analytics data exported successfully!');
      console.log('📁 Saved to: analytics-export.json');
      
    } catch (error) {
      console.error('❌ Error exporting data:', error.message);
    }
  }

  async analyzeSpecificPost() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

    try {
      const postNumber = await question('Enter post number to analyze: ');
      
      console.log(`🔍 Analyzing post #${postNumber}...`);
      
      const posts = await this.database.getPostsWithLinkedInIds();
      const post = posts.find(p => p.post_number == postNumber);
      
      if (!post) {
        console.log('❌ Post not found or not posted to LinkedIn');
        return;
      }
      
      const analytics = await this.analytics.getPostAnalytics(post.linkedin_post_id);
      
      console.log('\n📊 Post Analysis:');
      console.log('=================');
      console.log(`📝 Content: ${post.content.substring(0, 200)}...`);
      console.log(`📊 Engagement Score: ${post.engagement_score}/100`);
      console.log(`👁️  Estimated Views: ${post.estimated_views?.toLocaleString() || 'N/A'}`);
      console.log(`👁️  Actual Views: ${analytics.views.toLocaleString()}`);
      console.log(`💬 Engagement Rate: ${analytics.engagementRate.toFixed(2)}%`);
      console.log(`👍 Likes: ${analytics.likes}, 💬 Comments: ${analytics.comments}, 🔄 Shares: ${analytics.shares}`);
      
      const variance = this.analytics.calculateVariance(post.estimated_views, analytics.views);
      console.log(`📊 Variance: ${variance.toFixed(1)}%`);
      
    } catch (error) {
      console.error('❌ Error analyzing post:', error.message);
    } finally {
      rl.close();
    }
  }

  async showOptimizationConfig() {
    console.log('⚙️  Optimization Configuration:');
    console.log('==============================');
    
    try {
      if (fs.existsSync('optimization-config.json')) {
        const config = JSON.parse(fs.readFileSync('optimization-config.json', 'utf8'));
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.log('📝 No optimization configuration found');
        console.log('💡 Run analytics first to generate optimization parameters');
      }
    } catch (error) {
      console.error('❌ Error reading configuration:', error.message);
    }
  }
}

module.exports = AnalyticsDashboard; 