const EnhancedContentGenerator = require('./enhanced-content-generator');
const LinkedInAnalytics = require('./linkedin-analytics');
const fs = require('fs');

class AdaptiveContentGenerator extends EnhancedContentGenerator {
  constructor() {
    super();
    this.analytics = new LinkedInAnalytics();
    this.optimizationConfig = this.loadOptimizationConfig();
  }

  loadOptimizationConfig() {
    try {
      if (fs.existsSync('optimization-config.json')) {
        return JSON.parse(fs.readFileSync('optimization-config.json', 'utf8'));
      }
    } catch (error) {
      console.error('Error loading optimization config:', error);
    }
    return null;
  }

  // Get optimized LinkedIn parameters based on analytics
  getLinkedInOptimization() {
    const baseOptimization = super.getLinkedInOptimization();
    
    if (!this.optimizationConfig) {
      return baseOptimization;
    }

    // Apply learned optimizations
    const optimized = { ...baseOptimization };

    // Adjust word count based on high-performing posts
    if (this.optimizationConfig.contentGeneration?.optimalWordCount) {
      optimized.idealWordCount = {
        min: Math.max(30, this.optimizationConfig.contentGeneration.optimalWordCount - 20),
        max: Math.min(200, this.optimizationConfig.contentGeneration.optimalWordCount + 20),
        optimal: this.optimizationConfig.contentGeneration.optimalWordCount
      };
    }

    // Adjust emoji count based on performance
    if (this.optimizationConfig.contentGeneration?.optimalEmojiCount) {
      optimized.idealEmojiCount = {
        min: Math.max(3, this.optimizationConfig.contentGeneration.optimalEmojiCount - 2),
        max: Math.min(15, this.optimizationConfig.contentGeneration.optimalEmojiCount + 2),
        optimal: this.optimizationConfig.contentGeneration.optimalEmojiCount
      };
    }

    // Adjust attention grabbers based on performance
    if (this.optimizationConfig.contentGeneration?.includeQuestions === false) {
      optimized.attentionGrabbers = optimized.attentionGrabbers.filter(grabber => 
        !grabber.includes('?')
      );
    }

    return optimized;
  }

  // Enhanced engagement scoring with learned adjustments
  calculateEngagementMetrics(postContent) {
    const baseMetrics = super.calculateEngagementMetrics(postContent);
    
    if (!this.optimizationConfig?.engagementScoring?.multiplier) {
      return baseMetrics;
    }

    // Apply learned engagement multiplier
    const multiplier = this.optimizationConfig.engagementScoring.multiplier;
    
    return {
      ...baseMetrics,
      engagementScore: Math.min(100, Math.round(baseMetrics.engagementScore * multiplier)),
      estimatedViews: Math.round(baseMetrics.estimatedViews * multiplier),
      estimatedClicks: Math.round(baseMetrics.estimatedClicks * multiplier),
      estimatedInteractions: Math.round(baseMetrics.estimatedInteractions * multiplier),
      optimizationApplied: true,
      multiplier: multiplier
    };
  }

  // Generate content with performance-based optimizations
  async generateOptimizedPost() {
    // First, try to update our optimization parameters
    await this.updateOptimizationParameters();
    
    // Generate content with current optimizations
    const postContent = await super.generateOptimizedPost();
    
    // Calculate metrics with learned adjustments
    const engagementMetrics = this.calculateEngagementMetrics(postContent);
    
    return {
      content: postContent,
      metrics: engagementMetrics,
      optimizationInfo: {
        configUsed: this.optimizationConfig ? true : false,
        confidence: this.optimizationConfig?.confidence || 'low',
        lastOptimization: this.optimizationConfig?.lastOptimization || 'never'
      }
    };
  }

  // Update optimization parameters based on latest analytics
  async updateOptimizationParameters() {
    try {
      console.log('🔄 Updating optimization parameters based on analytics...');
      
      const newConfig = await this.analytics.updateContentGenerationParameters();
      
      if (newConfig) {
        this.optimizationConfig = newConfig;
        console.log('✅ Optimization parameters updated');
        console.log(`📊 Confidence: ${newConfig.confidence}`);
        console.log(`🎯 Engagement multiplier: ${newConfig.engagementScoring?.multiplier?.toFixed(2) || 'N/A'}`);
      }
      
    } catch (error) {
      console.error('❌ Error updating optimization parameters:', error.message);
    }
  }

  // Generate content with specific performance targets
  async generatePostWithTarget(targetEngagementRate = 5) {
    console.log(`🎯 Generating post targeting ${targetEngagementRate}% engagement rate...`);
    
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      const result = await this.generateOptimizedPost();
      const estimatedEngagementRate = (result.metrics.estimatedInteractions / result.metrics.estimatedViews) * 100;
      
      console.log(`📊 Attempt ${attempts}: Estimated engagement rate: ${estimatedEngagementRate.toFixed(1)}%`);
      
      if (estimatedEngagementRate >= targetEngagementRate) {
        console.log(`✅ Target achieved! Estimated engagement: ${estimatedEngagementRate.toFixed(1)}%`);
        return result;
      }
      
      // If we haven't reached the target, try adjusting parameters
      if (attempts < maxAttempts) {
        console.log('🔄 Adjusting parameters for better engagement...');
        await this.adjustParametersForTarget(targetEngagementRate);
      }
    }
    
    // Return the best attempt if target not reached
    console.log(`⚠️  Target not reached after ${maxAttempts} attempts, returning best result`);
    return await this.generateOptimizedPost();
  }

  // Adjust parameters to target specific engagement rate
  async adjustParametersForTarget(targetEngagementRate) {
    if (!this.optimizationConfig) return;
    
    // Increase engagement scoring multiplier
    if (this.optimizationConfig.engagementScoring?.multiplier) {
      this.optimizationConfig.engagementScoring.multiplier *= 1.1;
    }
    
    // Adjust content generation preferences
    if (this.optimizationConfig.contentGeneration) {
      // Increase emoji count
      if (this.optimizationConfig.contentGeneration.optimalEmojiCount) {
        this.optimizationConfig.contentGeneration.optimalEmojiCount = 
          Math.min(15, this.optimizationConfig.contentGeneration.optimalEmojiCount + 1);
      }
      
      // Ensure questions are included
      this.optimizationConfig.contentGeneration.includeQuestions = true;
      
      // Ensure statistics are included
      this.optimizationConfig.contentGeneration.includeStats = true;
    }
  }

  // Generate multiple variations with different optimization strategies
  async generateMultipleOptimizedPosts(count = 3) {
    console.log(`🔄 Generating ${count} optimized post variations...`);
    
    const posts = [];
    
    for (let i = 0; i < count; i++) {
      console.log(`\n📝 Generating variation ${i + 1}/${count}...`);
      
      // Vary the optimization strategy
      if (i === 1) {
        // Conservative approach
        await this.adjustParametersForTarget(3);
      } else if (i === 2) {
        // Aggressive approach
        await this.adjustParametersForTarget(8);
      }
      
      const result = await this.generateOptimizedPost();
      posts.push({
        variation: i + 1,
        ...result
      });
    }
    
    return posts;
  }

  // Analyze content performance and suggest improvements
  async analyzeContentPerformance() {
    try {
      console.log('📊 Analyzing content performance patterns...');
      
      const analysis = await this.analytics.analyzePerformancePatterns();
      
      if (analysis.analytics.length === 0) {
        return {
          message: 'No performance data available yet',
          suggestions: []
        };
      }

      const suggestions = [];

      // Analyze content characteristics vs performance
      const highPerformers = analysis.analytics.filter(post => post.engagementRate > 5);
      const lowPerformers = analysis.analytics.filter(post => post.engagementRate < 2);

      if (highPerformers.length > 0) {
        const avgWordCount = highPerformers.reduce((sum, post) => 
          sum + post.content.split(/\s+/).length, 0) / highPerformers.length;
        
        suggestions.push({
          type: 'content_optimization',
          title: 'Optimal Content Length',
          description: `High-performing posts average ${Math.round(avgWordCount)} words`,
          action: `Target ${Math.round(avgWordCount)} words in future posts`
        });
      }

      if (lowPerformers.length > 0) {
        const commonIssues = this.analyzeContentIssues(lowPerformers);
        suggestions.push({
          type: 'content_avoidance',
          title: 'Content Issues to Avoid',
          description: 'Common characteristics in low-performing posts',
          action: `Avoid: ${commonIssues.join(', ')}`
        });
      }

      // Analyze estimation accuracy
      const avgVariance = analysis.analytics.reduce((sum, post) => 
        sum + Math.abs((post.views - post.estimatedViews) / post.estimatedViews * 100), 0) / analysis.analytics.length;

      if (avgVariance > 50) {
        suggestions.push({
          type: 'estimation_improvement',
          title: 'Improve Estimation Accuracy',
          description: `Average variance: ${avgVariance.toFixed(1)}%`,
          action: 'Recalibrate engagement scoring algorithm'
        });
      }

      return {
        analysis,
        suggestions,
        summary: {
          totalPosts: analysis.analytics.length,
          highPerformers: highPerformers.length,
          lowPerformers: lowPerformers.length,
          averageVariance: avgVariance
        }
      };

    } catch (error) {
      console.error('❌ Error analyzing content performance:', error.message);
      return {
        message: 'Error analyzing performance',
        suggestions: []
      };
    }
  }

  // Analyze common issues in low-performing content
  analyzeContentIssues(posts) {
    const issues = [];
    
    // Check for common problems
    const tooLong = posts.filter(post => post.content.split(/\s+/).length > 150).length;
    const tooShort = posts.filter(post => post.content.split(/\s+/).length < 50).length;
    const noEmojis = posts.filter(post => 
      (post.content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length < 3
    ).length;
    const noQuestions = posts.filter(post => !post.content.includes('?')).length;
    const noStats = posts.filter(post => !/\d+%|\$\d+|\d+ billion|\d+ million/i.test(post.content)).length;

    if (tooLong > posts.length * 0.6) issues.push('Posts too long');
    if (tooShort > posts.length * 0.6) issues.push('Posts too short');
    if (noEmojis > posts.length * 0.6) issues.push('Insufficient emojis');
    if (noQuestions > posts.length * 0.6) issues.push('No questions');
    if (noStats > posts.length * 0.6) issues.push('No statistics');

    return issues;
  }

  // Get optimization status and recommendations
  getOptimizationStatus() {
    if (!this.optimizationConfig) {
      return {
        status: 'not_optimized',
        message: 'No optimization data available. Run analytics first.',
        recommendations: ['Run analytics to gather performance data', 'Post more content to build dataset']
      };
    }

    const status = {
      status: 'optimized',
      confidence: this.optimizationConfig.confidence,
      lastOptimization: this.optimizationConfig.lastOptimization,
      engagementMultiplier: this.optimizationConfig.engagementScoring?.multiplier,
      recommendations: []
    };

    if (this.optimizationConfig.confidence === 'low') {
      status.recommendations.push('Post more content to improve optimization confidence');
    }

    if (this.optimizationConfig.engagementScoring?.multiplier < 0.8) {
      status.recommendations.push('Consider adjusting content strategy - engagement below expectations');
    }

    if (this.optimizationConfig.engagementScoring?.multiplier > 1.5) {
      status.recommendations.push('Excellent performance! Consider more aggressive content strategies');
    }

    return status;
  }
}

module.exports = AdaptiveContentGenerator; 