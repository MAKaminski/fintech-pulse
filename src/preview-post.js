const ContentGenerator = require('./content-generator');
const readline = require('readline');

class PostPreview {
  constructor() {
    this.contentGenerator = new ContentGenerator();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async generateAndPreview() {
    console.log('🔍 FintechPulse Post Preview');
    console.log('============================\n');

    try {
      // Generate content
      console.log('🤖 Generating content...');
      let postContent;
      
      try {
        postContent = await this.contentGenerator.generatePost();
        console.log('✅ AI content generation successful!');
      } catch (error) {
        console.log('⚠️  OpenAI failed, using fallback content...');
        postContent = this.contentGenerator.generateFallbackPost();
        console.log('✅ Fallback content generation successful!');
      }

      // Display the post
      console.log('\n📝 Generated Post:');
      console.log('==================');
      console.log(postContent);
      console.log('==================');
      
      // Show post stats
      const charCount = postContent.length;
      const wordCount = postContent.split(/\s+/).length;
      console.log(`\n📊 Post Statistics:`);
      console.log(`Characters: ${charCount} (LinkedIn limit: 3000)`);
      console.log(`Words: ${wordCount}`);
      console.log(`Status: ${charCount > 3000 ? '❌ Too long' : '✅ Good length'}`);

      // Ask for user input
      await this.askUserAction(postContent);

    } catch (error) {
      console.error('❌ Error generating preview:', error.message);
      process.exit(1);
    }
  }

  async askUserAction(postContent) {
    return new Promise((resolve) => {
      console.log('\n🤔 What would you like to do?');
      console.log('1. Approve and post now');
      console.log('2. Regenerate content');
      console.log('3. Edit content manually');
      console.log('4. Save for later (not post)');
      console.log('5. Exit without posting');
      
      this.rl.question('\nEnter your choice (1-5): ', async (answer) => {
        switch (answer.trim()) {
          case '1':
            await this.approveAndPost(postContent);
            break;
          case '2':
            console.log('\n🔄 Regenerating content...\n');
            this.rl.close();
            const newPreview = new PostPreview();
            await newPreview.generateAndPreview();
            break;
          case '3':
            await this.editContent(postContent);
            break;
          case '4':
            await this.saveForLater(postContent);
            break;
          case '5':
            console.log('👋 Exiting without posting.');
            this.rl.close();
            process.exit(0);
            break;
          default:
            console.log('❌ Invalid choice. Please try again.');
            await this.askUserAction(postContent);
            break;
        }
        resolve();
      });
    });
  }

  async approveAndPost(postContent) {
    console.log('\n🚀 Posting to LinkedIn...');
    
    try {
      const LinkedInAPI = require('./linkedin-api');
      const linkedinAPI = new LinkedInAPI();
      
      await linkedinAPI.createPost(postContent, imageResult.success ? imageResult.imagePath : null);
      console.log('✅ Post published successfully!');
      
    } catch (error) {
      console.error('❌ Error posting:', error.message);
    }
    
    this.rl.close();
    process.exit(0);
  }

  async editContent(originalContent) {
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
          console.log('\n📝 Edited content:');
          console.log('==================');
          console.log(editedContent);
          console.log('==================');
          
          this.askUserAction(editedContent);
          resolve();
        } else {
          lines.push(line);
        }
      });
    });
  }

  async saveForLater(postContent) {
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `draft-post-${timestamp}.txt`;
    
    try {
      fs.writeFileSync(filename, postContent);
      console.log(`\n💾 Post saved as: ${filename}`);
      console.log('You can edit this file and post it later using the manual post feature.');
    } catch (error) {
      console.error('❌ Error saving file:', error.message);
    }
    
    this.rl.close();
    process.exit(0);
  }

  // Generate multiple options
  async generateMultipleOptions(count = 3) {
    console.log(`🔍 Generating ${count} post options...\n`);
    
    const options = [];
    
    for (let i = 0; i < count; i++) {
      console.log(`Generating option ${i + 1}/${count}...`);
      
      try {
        let postContent = await this.contentGenerator.generatePost();
        options.push(postContent);
      } catch (error) {
        console.log('Using fallback content for this option...');
        const fallbackContent = this.contentGenerator.generateFallbackPost();
        options.push(fallbackContent);
      }
    }

    // Display all options
    console.log('\n📝 Generated Options:');
    console.log('=====================');
    
    options.forEach((content, index) => {
      console.log(`\n--- OPTION ${index + 1} ---`);
      console.log(content);
      console.log(`\nCharacters: ${content.length} | Words: ${content.split(/\s+/).length}`);
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
          const selectedContent = options[choice - 1];
          console.log(`\n✅ Selected Option ${choice}`);
          this.askUserAction(selectedContent);
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
  const preview = new PostPreview();
  
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
  console.log('\n👋 Exiting preview mode.');
  process.exit(0);
});

main().catch(error => {
  console.error('❌ Preview failed:', error);
  process.exit(1);
}); 