const readline = require('readline');
const QEDInvestmentGenerator = require('../generators/qed/generator');
const PostDatabase = require('../utils/database');
const fs = require('fs');
const path = require('path');

class QEDGeneratorCLI {
  constructor() {
    this.generator = new QEDInvestmentGenerator();
    this.database = new PostDatabase();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async initialize() {
    await this.database.initialize();
  }

  async run() {
    console.log('\n🎯 QED Investors Post Generator');
    console.log('================================\n');

    try {
      await this.initialize();
      
      console.log('📊 QED Investors Profile:');
      const profile = this.generator.getQEDProfile();
      console.log(`   Name: ${profile.name}`);
      console.log(`   Focus: ${profile.focus}`);
      console.log(`   Stage: ${profile.stage}`);
      console.log(`   Geography: ${profile.geography}`);
      console.log(`   Portfolio Sectors: ${profile.portfolio.sectors.slice(0, 3).join(', ')}...\n`);

      const action = await this.selectAction();
      
      if (action === 'single') {
        await this.generateSinglePost();
      } else if (action === 'multiple') {
        await this.generateMultiplePosts();
      } else if (action === 'custom') {
        await this.generateCustomPost();
      } else if (action === 'view-profile') {
        this.displayProfile();
      } else {
        console.log('❌ Invalid selection. Exiting...');
      }

    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async selectAction() {
    return new Promise((resolve) => {
      console.log('📝 What would you like to do?');
      console.log('1. Generate single QED post');
      console.log('2. Generate multiple post options (3)');
      console.log('3. Generate custom themed post');
      console.log('4. View QED profile details');
      console.log('5. Exit\n');

      this.rl.question('Enter your choice (1-5): ', (answer) => {
        switch (answer.trim()) {
          case '1':
            resolve('single');
            break;
          case '2':
            resolve('multiple');
            break;
          case '3':
            resolve('custom');
            break;
          case '4':
            resolve('view-profile');
            break;
          case '5':
            resolve('exit');
            break;
          default:
            console.log('❌ Invalid choice. Please enter 1, 2, 3, 4, or 5.');
            resolve(this.selectAction());
        }
      });
    });
  }

  async generateSinglePost() {
    console.log('\n🚀 Generating QED Investment Post...');
    console.log('=====================================\n');

    try {
      const post = await this.generator.generateInvestmentPost({
        includeImage: true,
        tone: 'professional'
      });

      this.displayPost(post);
      
      const shouldSave = await this.askYesNo('\n💾 Save this post to database? (y/n): ');
      
      if (shouldSave) {
        const savedPost = await this.database.savePost({
          content: post.content,
          type: 'qed-investment',
          engagement_score: post.metadata.engagement_score,
          metadata: JSON.stringify(post.metadata),
          scheduled_time: new Date().toISOString()
        });

        console.log(`✅ Post saved to database with ID: ${savedPost.id}`);
      }

      if (post.metadata.includeImage && post.metadata.imagePrompt) {
        console.log('\n🖼️ Image generation prompt:');
        console.log(`   ${post.metadata.imagePrompt}`);
        
        const shouldSaveImage = await this.askYesNo('\n💾 Save image prompt to file? (y/n): ');
        if (shouldSaveImage) {
          this.saveImagePrompt(post.metadata.imagePrompt, post.metadata.theme);
        }
      }

    } catch (error) {
      console.error('❌ Error generating post:', error.message);
    }
  }

  async generateMultiplePosts() {
    console.log('\n🚀 Generating Multiple QED Post Options...');
    console.log('==========================================\n');

    try {
      const posts = await this.generator.generateMultipleOptions(3, {
        includeImage: true,
        tone: 'professional'
      });

      console.log(`📝 Generated ${posts.length} post options:\n`);

      posts.forEach((post, index) => {
        console.log(`\n--- Option ${index + 1} (${post.metadata.theme}) ---`);
        this.displayPost(post, false);
      });

      const selectedIndex = await this.selectPostOption(posts.length);
      
      if (selectedIndex >= 0) {
        const selectedPost = posts[selectedIndex];
        console.log(`\n✅ You selected Option ${selectedIndex + 1}`);
        
        const shouldSave = await this.askYesNo('\n💾 Save this post to database? (y/n): ');
        
        if (shouldSave) {
          const savedPost = await this.database.savePost({
            content: selectedPost.content,
            type: 'qed-investment',
            engagement_score: selectedPost.metadata.engagement_score,
            metadata: JSON.stringify(selectedPost.metadata),
            scheduled_time: new Date().toISOString()
          });

          console.log(`✅ Post saved to database with ID: ${savedPost.id}`);
        }
      }

    } catch (error) {
      console.error('❌ Error generating posts:', error.message);
    }
  }

  async generateCustomPost() {
    console.log('\n🎨 Custom QED Post Generation');
    console.log('==============================\n');

    try {
      const profile = this.generator.getQEDProfile();
      
      // Select theme
      console.log('📋 Available themes:');
      profile.content_themes.forEach((theme, index) => {
        console.log(`${index + 1}. ${theme}`);
      });
      
      const themeIndex = await this.selectFromList('theme', profile.content_themes.length);
      const selectedTheme = profile.content_themes[themeIndex];

      // Select focus area
      console.log('\n🎯 Available focus areas:');
      profile.portfolio.sectors.forEach((sector, index) => {
        console.log(`${index + 1}. ${sector}`);
      });
      
      const focusIndex = await this.selectFromList('focus area', profile.portfolio.sectors.length);
      const selectedFocus = profile.portfolio.sectors[focusIndex];

      // Select tone
      const tones = ['professional', 'thought-leadership', 'celebratory', 'analytical'];
      console.log('\n🗣️ Available tones:');
      tones.forEach((tone, index) => {
        console.log(`${index + 1}. ${tone}`);
      });
      
      const toneIndex = await this.selectFromList('tone', tones.length);
      const selectedTone = tones[toneIndex];

      const includeImage = await this.askYesNo('\n🖼️ Include image prompt? (y/n): ');

      console.log('\n🚀 Generating custom post...');
      
      const post = await this.generator.generateInvestmentPost({
        theme: selectedTheme,
        focusArea: selectedFocus,
        tone: selectedTone,
        includeImage: includeImage
      });

      this.displayPost(post);
      
      const shouldSave = await this.askYesNo('\n💾 Save this post to database? (y/n): ');
      
      if (shouldSave) {
        const savedPost = await this.database.savePost({
          content: post.content,
          type: 'qed-investment',
          engagement_score: post.metadata.engagement_score,
          metadata: JSON.stringify(post.metadata),
          scheduled_time: new Date().toISOString()
        });

        console.log(`✅ Post saved to database with ID: ${savedPost.id}`);
      }

    } catch (error) {
      console.error('❌ Error generating custom post:', error.message);
    }
  }

  displayProfile() {
    const profile = this.generator.getQEDProfile();
    
    console.log('\n📊 QED Investors Complete Profile');
    console.log('==================================\n');
    
    console.log(`🏢 ${profile.name}`);
    console.log(`🎯 Focus: ${profile.focus}`);
    console.log(`📈 Stage: ${profile.stage}`);
    console.log(`🌍 Geography: ${profile.geography}\n`);
    
    console.log('💼 Portfolio Sectors:');
    profile.portfolio.sectors.forEach(sector => {
      console.log(`   • ${sector}`);
    });
    
    console.log('\n🚀 Notable Investments:');
    profile.portfolio.notable_investments.forEach(investment => {
      console.log(`   • ${investment}`);
    });
    
    console.log('\n💡 Investment Thesis:');
    profile.investment_thesis.forEach(thesis => {
      console.log(`   • ${thesis}`);
    });
    
    console.log('\n📝 Content Themes:');
    profile.content_themes.forEach(theme => {
      console.log(`   • ${theme}`);
    });
  }

  displayPost(post, showMetadata = true) {
    console.log('📄 Generated Post:');
    console.log('==================');
    console.log(post.content);
    console.log('==================\n');

    if (showMetadata) {
      console.log('📊 Post Metadata:');
      console.log(`   Theme: ${post.metadata.theme}`);
      console.log(`   Focus Area: ${post.metadata.focusArea}`);
      console.log(`   Tone: ${post.metadata.tone}`);
      console.log(`   Engagement Score: ${post.metadata.engagement_score.toFixed(1)}/10`);
      console.log(`   Character Count: ${post.content.length}`);
      console.log(`   Hashtags: ${post.metadata.hashtags.join(', ')}`);
      
      if (post.metadata.imagePrompt) {
        console.log(`   Image Prompt: ${post.metadata.imagePrompt}`);
      }
    }
  }

  async selectPostOption(count) {
    return new Promise((resolve) => {
      this.rl.question(`\nSelect post option (1-${count}) or 0 to skip: `, (answer) => {
        const selection = parseInt(answer.trim()) - 1;
        if (selection >= -1 && selection < count) {
          resolve(selection);
        } else {
          console.log(`❌ Please enter a number between 0 and ${count}`);
          resolve(this.selectPostOption(count));
        }
      });
    });
  }

  async selectFromList(itemName, count) {
    return new Promise((resolve) => {
      this.rl.question(`\nSelect ${itemName} (1-${count}): `, (answer) => {
        const selection = parseInt(answer.trim()) - 1;
        if (selection >= 0 && selection < count) {
          resolve(selection);
        } else {
          console.log(`❌ Please enter a number between 1 and ${count}`);
          resolve(this.selectFromList(itemName, count));
        }
      });
    });
  }

  async askYesNo(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        const response = answer.trim().toLowerCase();
        if (response === 'y' || response === 'yes') {
          resolve(true);
        } else if (response === 'n' || response === 'no') {
          resolve(false);
        } else {
          console.log('❌ Please enter y/yes or n/no');
          resolve(this.askYesNo(question));
        }
      });
    });
  }

  saveImagePrompt(prompt, theme) {
    try {
      const dataDir = path.join(__dirname, '../../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const filename = `qed-image-prompt-${theme.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.txt`;
      const filepath = path.join(dataDir, filename);
      
      fs.writeFileSync(filepath, prompt);
      console.log(`✅ Image prompt saved to: ${filename}`);
    } catch (error) {
      console.error('❌ Error saving image prompt:', error.message);
    }
  }
}

// CLI execution
async function main() {
  const cli = new QEDGeneratorCLI();
  await cli.run();
}

// Handle command line execution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ CLI Error:', error);
    process.exit(1);
  });
}

module.exports = QEDGeneratorCLI;