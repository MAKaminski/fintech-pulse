const LinkedInAnalytics = require('./linkedin-analytics');
const PostDatabase = require('./database');

class AutoOptimizer {
  constructor() {
    this.analytics = new LinkedInAnalytics();
    this.database = new PostDatabase();
  }

  async initialize() {
    await this.database.initialize();
    await this.analytics.initialize();
  }

  // Automatically run analytics and update optimization parameters
  async runAutoOptimization() {
    console.log('🔄 Starting automatic optimization process...');
    
    try {
      // Step 1: Fetch latest analytics data
      console.log('📊 Fetching latest LinkedIn analytics...');
      const analytics = await this.analytics.getAllPostAnalytics();
      
      if (analytics.length === 0) {
        console.log('📝 No analytics data available yet. Post more content to enable optimization.');
        
        // Create a basic optimization config for new users
        const basicConfig = {
          contentGeneration: {
            optimalWordCount: 100,
            optimalEmojiCount: 8,
            includeQuestions: true,
            includeStats: true
          },
          engagementScoring: {
            multiplier: 1.0
          },
          confidence: 'low',
          lastOptimization: new Date().toISOString(),
          message: 'Basic configuration created - post content to enable data-driven optimization'
        };
        
        // Save basic config
        const fs = require('fs');
        fs.writeFileSync('optimization-config.json', JSON.stringify(basicConfig, null, 2));
        
        return {
          success: true,
          message: 'Basic optimization configuration created',
          config: basicConfig,
          recommendations: ['Post more content to build dataset for data-driven optimization']
        };
      }

      // Step 2: Analyze performance patterns
      console.log('🔍 Analyzing performance patterns...');
      const analysis = await this.analytics.analyzePerformancePatterns();
      
      // Step 3: Generate optimization suggestions
      console.log('💡 Generating optimization suggestions...');
      const optimization = await this.analytics.generateOptimizationSuggestions();
      
      // Step 4: Update content generation parameters
      console.log('⚙️  Updating content generation parameters...');
      const newConfig = await this.analytics.updateContentGenerationParameters();
      
      if (newConfig) {
        console.log('✅ Optimization parameters updated successfully!');
        console.log(`📊 Confidence: ${newConfig.confidence}`);
        console.log(`🎯 Engagement multiplier: ${newConfig.engagementScoring?.multiplier?.toFixed(2) || 'N/A'}`);
        
        return {
          success: true,
          message: 'Optimization completed successfully',
          config: newConfig,
          analysis: analysis,
          postsAnalyzed: analytics.length
        };
      } else {
        console.log('❌ Failed to update optimization parameters');
        return {
          success: false,
          message: 'Failed to update optimization parameters'
        };
      }
      
    } catch (error) {
      console.error('❌ Error during auto-optimization:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Check if optimization is needed
  async shouldOptimize() {
    try {
      // Check if optimization config exists and is recent
      const fs = require('fs');
      if (!fs.existsSync('optimization-config.json')) {
        return { shouldOptimize: true, reason: 'No optimization config found' };
      }

      const config = JSON.parse(fs.readFileSync('optimization-config.json', 'utf8'));
      const lastOptimization = new Date(config.lastOptimization);
      const daysSinceOptimization = (new Date() - lastOptimization) / (1000 * 60 * 60 * 24);

      // Optimize if:
      // 1. More than 3 days since last optimization
      // 2. Low confidence and we have new posts
      // 3. High variance in recent posts
      
      if (daysSinceOptimization > 3) {
        return { shouldOptimize: true, reason: `Last optimization was ${Math.round(daysSinceOptimization)} days ago` };
      }

      if (config.confidence === 'low') {
        const stats = await this.database.getPostStats();
        if (stats.posted_posts > 0) {
          return { shouldOptimize: true, reason: 'Low confidence with posted content available' };
        }
      }

      return { shouldOptimize: false, reason: 'Optimization not needed' };
      
    } catch (error) {
      console.error('Error checking optimization status:', error.message);
      return { shouldOptimize: true, reason: 'Error checking status' };
    }
  }

  // Get optimization status
  async getOptimizationStatus() {
    try {
      const fs = require('fs');
      
      if (!fs.existsSync('optimization-config.json')) {
        return {
          status: 'not_optimized',
          message: 'No optimization configuration found',
          recommendations: ['Run auto-optimization to create initial configuration']
        };
      }

      const config = JSON.parse(fs.readFileSync('optimization-config.json', 'utf8'));
      const lastOptimization = new Date(config.lastOptimization);
      const daysSinceOptimization = (new Date() - lastOptimization) / (1000 * 60 * 60 * 24);

      return {
        status: 'optimized',
        confidence: config.confidence,
        lastOptimization: config.lastOptimization,
        daysSinceOptimization: Math.round(daysSinceOptimization),
        engagementMultiplier: config.engagementScoring?.multiplier,
        recommendations: this.getRecommendations(config, daysSinceOptimization)
      };
      
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  // Get recommendations based on current status
  getRecommendations(config, daysSinceOptimization) {
    const recommendations = [];

    if (daysSinceOptimization > 7) {
      recommendations.push('Run optimization - data may be outdated');
    }

    if (config.confidence === 'low') {
      recommendations.push('Post more content to improve optimization confidence');
    }

    if (config.engagementScoring?.multiplier < 0.8) {
      recommendations.push('Consider adjusting content strategy - engagement below expectations');
    }

    if (config.engagementScoring?.multiplier > 1.5) {
      recommendations.push('Excellent performance! Consider more aggressive content strategies');
    }

    return recommendations;
  }
}

// Run if called directly
async function main() {
  const optimizer = new AutoOptimizer();
  
  try {
    await optimizer.initialize();
    
    // Check if optimization is needed
    const shouldOptimize = await optimizer.shouldOptimize();
    
    if (shouldOptimize.shouldOptimize) {
      console.log(`🔄 Optimization needed: ${shouldOptimize.reason}`);
      const result = await optimizer.runAutoOptimization();
      
      if (result.success) {
        console.log('✅ Auto-optimization completed successfully!');
        console.log(`📊 Posts analyzed: ${result.postsAnalyzed}`);
        console.log(`🎯 Engagement multiplier: ${result.config.engagementScoring?.multiplier?.toFixed(2)}`);
      } else {
        console.log('❌ Auto-optimization failed:', result.message);
      }
    } else {
      console.log(`✅ Optimization not needed: ${shouldOptimize.reason}`);
      
      // Show current status
      const status = await optimizer.getOptimizationStatus();
      console.log('📊 Current Optimization Status:');
      console.log(`   Status: ${status.status}`);
      console.log(`   Confidence: ${status.confidence}`);
      console.log(`   Days since optimization: ${status.daysSinceOptimization}`);
      console.log(`   Engagement multiplier: ${status.engagementMultiplier?.toFixed(2) || 'N/A'}`);
    }
    
  } catch (error) {
    console.error('❌ Error in auto-optimization:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AutoOptimizer; 