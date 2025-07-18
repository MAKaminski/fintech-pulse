const cron = require('node-cron');
const moment = require('moment-timezone');
const ContentGenerator = require('./content-generator');
const LinkedInAPI = require('./linkedin-api');
const config = require('../config');

class PostScheduler {
  constructor() {
    this.contentGenerator = new ContentGenerator();
    this.linkedinAPI = new LinkedInAPI();
    this.isRunning = false;
  }

  async initialize() {
    console.log('🚀 Initializing FintechPulse Scheduler...');
    
    // Test LinkedIn connection
    const connectionTest = await this.linkedinAPI.testConnection();
    if (!connectionTest) {
      console.error('❌ Cannot start scheduler - LinkedIn connection failed');
      return false;
    }

    console.log('✅ LinkedIn connection verified');
    console.log(`⏰ Scheduling posts for ${config.posting.timezone} timezone`);
    console.log(`📅 Morning post: ${config.posting.morningTime}`);
    console.log(`📅 Evening post: ${config.posting.eveningTime}`);
    
    return true;
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️  Scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('🎯 Starting FintechPulse scheduler...');

    // Schedule morning post (8:30 AM EST)
    cron.schedule(`0 30 8 * * *`, async () => {
      console.log('🌅 Morning post scheduled - generating content...');
      await this.createAndPost();
    }, {
      timezone: config.posting.timezone
    });

    // Schedule evening post (4:00 PM EST)
    cron.schedule(`0 0 16 * * *`, async () => {
      console.log('🌆 Evening post scheduled - generating content...');
      await this.createAndPost();
    }, {
      timezone: config.posting.timezone
    });

    console.log('✅ Scheduler started successfully');
    console.log('📊 Next scheduled posts:');
    this.showNextScheduledPosts();
  }

  async createAndPost() {
    try {
      console.log('🤖 Generating FintechPulse content...');
      
      // Generate content
      let postContent;
      try {
        postContent = await this.contentGenerator.generatePost();
      } catch (error) {
        console.log('⚠️  OpenAI failed, using fallback content...');
        postContent = this.contentGenerator.generateFallbackPost();
      }

      console.log('📝 Content generated successfully');
      
      // Post to LinkedIn
      await this.linkedinAPI.createPost(postContent, imageResult.success ? imageResult.imagePath : null);
      
      // Log success
      const now = moment().tz(config.posting.timezone).format('YYYY-MM-DD HH:mm:ss');
      console.log(`✅ Post completed at ${now}`);
      
    } catch (error) {
      console.error('❌ Error in createAndPost:', error.message);
      
      // Log error with timestamp
      const now = moment().tz(config.posting.timezone).format('YYYY-MM-DD HH:mm:ss');
      console.error(`❌ Post failed at ${now}:`, error.message);
    }
  }

  showNextScheduledPosts() {
    const now = moment().tz(config.posting.timezone);
    const today = now.format('YYYY-MM-DD');
    
    // Morning post
    const morningTime = moment.tz(`${today} ${config.posting.morningTime}`, config.posting.timezone);
    if (now.isBefore(morningTime)) {
      console.log(`🌅 Morning post: ${morningTime.format('YYYY-MM-DD HH:mm:ss')} (${morningTime.fromNow()})`);
    } else {
      const tomorrowMorning = morningTime.add(1, 'day');
      console.log(`🌅 Morning post: ${tomorrowMorning.format('YYYY-MM-DD HH:mm:ss')} (${tomorrowMorning.fromNow()})`);
    }
    
    // Evening post
    const eveningTime = moment.tz(`${today} ${config.posting.eveningTime}`, config.posting.timezone);
    if (now.isBefore(eveningTime)) {
      console.log(`🌆 Evening post: ${eveningTime.format('YYYY-MM-DD HH:mm:ss')} (${eveningTime.fromNow()})`);
    } else {
      const tomorrowEvening = eveningTime.add(1, 'day');
      console.log(`🌆 Evening post: ${tomorrowEvening.format('YYYY-MM-DD HH:mm:ss')} (${tomorrowEvening.fromNow()})`);
    }
  }

  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Scheduler is not running');
      return;
    }

    this.isRunning = false;
    console.log('🛑 Stopping FintechPulse scheduler...');
  }

  // Manual post for testing
  async manualPost() {
    console.log('🔧 Manual post requested...');
    await this.createAndPost();
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      timezone: config.posting.timezone,
      morningTime: config.posting.morningTime,
      eveningTime: config.posting.eveningTime,
      currentTime: moment().tz(config.posting.timezone).format('YYYY-MM-DD HH:mm:ss')
    };
  }
}

module.exports = PostScheduler; 