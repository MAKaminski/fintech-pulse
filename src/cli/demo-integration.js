const EnhancedContentGenerator = require('./enhanced-content-generator');
const AutoOptimizer = require('./auto-optimize');

async function demonstrateIntegration() {
  console.log('🎯 FintechPulse Analytics Integration Demo');
  console.log('==========================================\n');

  try {
    // Initialize components
    const contentGenerator = new EnhancedContentGenerator();
    const autoOptimizer = new AutoOptimizer();
    await autoOptimizer.initialize();

    // Step 1: Check current optimization status
    console.log('📊 Step 1: Checking Optimization Status');
    console.log('=====================================');
    const status = await autoOptimizer.getOptimizationStatus();
    
    if (status.status === 'optimized') {
      console.log(`✅ Status: ${status.status.toUpperCase()}`);
      console.log(`📊 Confidence: ${status.confidence.toUpperCase()}`);
      console.log(`🔄 Days since optimization: ${status.daysSinceOptimization}`);
      console.log(`🎯 Engagement multiplier: ${status.engagementMultiplier?.toFixed(2) || 'N/A'}`);
      
      if (status.recommendations.length > 0) {
        console.log('💡 Recommendations:');
        status.recommendations.forEach(rec => console.log(`   • ${rec}`));
      }
    } else {
      console.log(`❌ Status: ${status.status.toUpperCase()}`);
      console.log(`📝 ${status.message}`);
      if (status.recommendations) {
        console.log('💡 Recommendations:');
        status.recommendations.forEach(rec => console.log(`   • ${rec}`));
      }
    }
    console.log('');

    // Step 2: Run optimization if needed
    console.log('🔄 Step 2: Running Auto-Optimization');
    console.log('===================================');
    const shouldOptimize = await autoOptimizer.shouldOptimize();
    
    if (shouldOptimize.shouldOptimize) {
      console.log(`🔄 Optimization needed: ${shouldOptimize.reason}`);
      const result = await autoOptimizer.runAutoOptimization();
      
      if (result.success) {
        console.log('✅ Optimization completed successfully!');
        console.log(`📊 Posts analyzed: ${result.postsAnalyzed}`);
        console.log(`🎯 Engagement multiplier: ${result.config.engagementScoring?.multiplier?.toFixed(2)}`);
        
        // Reload optimization config
        contentGenerator.optimizationConfig = contentGenerator.loadOptimizationConfig();
      } else {
        console.log('❌ Optimization failed:', result.message);
      }
    } else {
      console.log(`✅ Optimization not needed: ${shouldOptimize.reason}`);
    }
    console.log('');

    // Step 3: Generate content with analytics integration
    console.log('📝 Step 3: Generating Optimized Content');
    console.log('======================================');
    
    console.log('🤖 Generating content with analytics integration...');
    const postContent = await contentGenerator.generateOptimizedPost();
    
    console.log('\n📝 Generated Post:');
    console.log('==================');
    console.log(postContent);
    console.log('==================');
    
    // Step 4: Show engagement metrics with analytics
    console.log('\n📊 Step 4: Engagement Analysis');
    console.log('=============================');
    const metrics = contentGenerator.calculateEngagementMetrics(postContent);
    
    console.log(`🎯 Engagement Score: ${metrics.engagementScore}/100`);
    console.log(`👁️  Estimated Views: ${metrics.estimatedViews.toLocaleString()}`);
    console.log(`💬 Estimated Interactions: ${metrics.estimatedInteractions.toLocaleString()}`);
    
    if (metrics.optimizationApplied) {
      console.log(`🔄 Analytics optimization applied!`);
      console.log(`📊 Multiplier: ${metrics.analyticsMultiplier?.toFixed(2)}`);
      console.log(`📈 This post uses learned optimizations from actual LinkedIn performance data`);
    } else {
      console.log(`📝 Using default parameters (no analytics data available yet)`);
    }
    
    console.log('\n📊 Content Metrics:');
    console.log(`   Word Count: ${metrics.metrics.wordCount}`);
    console.log(`   Character Count: ${metrics.metrics.charCount}`);
    console.log(`   Emoji Count: ${metrics.metrics.emojiCount}`);
    console.log(`   Has Question: ${metrics.metrics.hasQuestion ? 'Yes' : 'No'}`);
    console.log(`   Has Call-to-Action: ${metrics.metrics.hasCallToAction ? 'Yes' : 'No'}`);
    console.log(`   Has Statistics: ${metrics.metrics.hasStats ? 'Yes' : 'No'}`);
    console.log(`   Has Attention Grabber: ${metrics.metrics.hasAttentionGrabber ? 'Yes' : 'No'}`);
    console.log(`   Mention Count: ${metrics.metrics.mentionCount}`);

    // Step 5: Show optimization details
    console.log('\n⚙️  Step 5: Optimization Details');
    console.log('==============================');
    
    if (contentGenerator.optimizationConfig) {
      const config = contentGenerator.optimizationConfig;
      console.log('✅ Analytics-based optimizations applied:');
      
      if (config.contentGeneration?.optimalWordCount) {
        console.log(`   📝 Optimal Word Count: ${config.contentGeneration.optimalWordCount} (learned from high-performing posts)`);
      }
      
      if (config.contentGeneration?.optimalEmojiCount) {
        console.log(`   🎨 Optimal Emoji Count: ${config.contentGeneration.optimalEmojiCount} (learned from high-performing posts)`);
      }
      
      if (config.contentGeneration?.includeQuestions !== undefined) {
        console.log(`   ❓ Include Questions: ${config.contentGeneration.includeQuestions ? 'Yes' : 'No'} (based on performance)`);
      }
      
      if (config.contentGeneration?.includeStats !== undefined) {
        console.log(`   📊 Include Statistics: ${config.contentGeneration.includeStats ? 'Yes' : 'No'} (based on performance)`);
      }
      
      if (config.engagementScoring?.multiplier) {
        console.log(`   🎯 Engagement Multiplier: ${config.engagementScoring.multiplier.toFixed(2)} (calibrated from actual performance)`);
      }
      
      console.log(`   📊 Confidence: ${config.confidence.toUpperCase()}`);
      console.log(`   🔄 Last Updated: ${config.lastOptimization}`);
    } else {
      console.log('📝 No optimization configuration found');
      console.log('💡 Post more content and run analytics to enable optimizations');
    }

    console.log('\n🎉 Integration Demo Complete!');
    console.log('============================');
    console.log('✅ Analytics are now fully integrated into content generation');
    console.log('✅ Every new post automatically uses learned optimizations');
    console.log('✅ The system continuously improves based on actual performance');
    console.log('✅ No manual intervention required - it\'s all automatic!');

  } catch (error) {
    console.error('❌ Error in demo:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  demonstrateIntegration();
}

module.exports = { demonstrateIntegration }; 