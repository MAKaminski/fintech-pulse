#!/usr/bin/env node

require('dotenv').config();
const FreestyleGenerator = require('./src/generators/freestyle/generator');

async function testFreestyle() {
    console.log('🧪 Testing Freestyle Generator...\n');

    const generator = new FreestyleGenerator();

    const testPrompt = `So - my wife has been building a business since this past February -

LaceLuxx | Second-Hand Luxe Bags
A little about the numbers

MoM Sales Growth
SaaS Metrics

> Would love to hear from other ecommerce people on how you'd best approach this to "step-on-the-gas" {RACECAR}. Hey customers rave - 510 5 Star Reviews | 1.2K items sold

> Personal question - is anyone aware of AI models strong enough for real-time audio and visual streaming to create an avatar that's able to run these live shows (assuming the merchandise is keyed in ahead of time including the images/dimensions)

Here's the link to her primary sales channel - whatnot

@https://www.whatnot.com/user/laceluxx/reviews`;

    try {
        console.log('📝 Original Prompt:');
        console.log('==================');
        console.log(testPrompt);
        console.log('\n' + '='.repeat(50) + '\n');

        // Test content generation
        console.log('🤖 Generating enhanced content...');
        const postContent = await generator.generateFreestylePost(testPrompt);

        console.log('📝 Enhanced Content:');
        console.log('==================');
        console.log(postContent.enhancedContent);
        console.log('\n' + '='.repeat(50) + '\n');

        // Test metrics calculation
        console.log('📊 Calculating engagement metrics...');
        const metrics = generator.calculateFreestyleEngagementMetrics(postContent.enhancedContent);

        console.log('📈 Engagement Metrics:');
        console.log('=====================');
        console.log(`Engagement Score: ${metrics.engagementScore}/100`);
        console.log(`Word Count: ${metrics.metrics.wordCount}`);
        console.log(`Character Count: ${metrics.metrics.charCount}`);
        console.log(`Emoji Count: ${metrics.metrics.emojiCount}`);
        console.log(`Has Question: ${metrics.metrics.hasQuestion}`);
        console.log(`Has Call-to-Action: ${metrics.metrics.hasCallToAction}`);
        console.log(`Has Hashtags: ${metrics.metrics.hasHashtags}`);
        console.log(`Has Personal Voice: ${metrics.metrics.hasPersonalVoice}`);

        console.log('\n✅ Freestyle generator test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testFreestyle(); 