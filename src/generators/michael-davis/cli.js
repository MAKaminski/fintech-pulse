#!/usr/bin/env node

const MichaelDavisGenerator = require('./generator');
const readline = require('readline');

class MichaelDavisCLI {
  constructor() {
    this.generator = new MichaelDavisGenerator();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('🎯 Michael Davis Content Generator');
    console.log('==================================\n');

    await this.showMenu();
  }

  async showMenu() {
    console.log('Choose an option:');
    console.log('1. Generate random post');
    console.log('2. Generate specific topic post');
    console.log('3. Generate multiple posts');
    console.log('4. Generate South Downtown post');
    console.log('5. Generate Housing & Tax post');
    console.log('6. Generate Homegrown post');
    console.log('7. Generate Overline post');
    console.log('8. Generate Atlanta Tech Village post');
    console.log('9. View available topics');
    console.log('10. Exit');

    const choice = await this.question('\nEnter your choice (1-10): ');

    switch (choice) {
      case '1':
        await this.generateRandomPost();
        break;
      case '2':
        await this.generateSpecificPost();
        break;
      case '3':
        await this.generateMultiplePosts();
        break;
      case '4':
        await this.generateSouthDowntownPost();
        break;
      case '5':
        await this.generateHousingPost();
        break;
      case '6':
        await this.generateHomegrownPost();
        break;
      case '7':
        await this.generateOverlinePost();
        break;
      case '8':
        await this.generateAtlantaTechVillagePost();
        break;
      case '9':
        await this.viewTopics();
        break;
      case '10':
        console.log('👋 Goodbye!');
        this.rl.close();
        return;
      default:
        console.log('❌ Invalid choice. Please try again.\n');
        await this.showMenu();
    }
  }

  async generateRandomPost() {
    console.log('\n🎲 Generating random Michael Davis-style post...\n');
    
    try {
      const post = await this.generator.generatePost();
      this.displayPost(post);
    } catch (error) {
      console.error('❌ Error generating post:', error.message);
    }

    console.log('\n');
    await this.showMenu();
  }

  async generateSpecificPost() {
    console.log('\n📝 Generate Specific Topic Post');
    console.log('===============================');

    const topics = this.generator.getAvailableTopics();
    
    console.log('\nAvailable categories:');
    Object.keys(topics).forEach((category, index) => {
      console.log(`${index + 1}. ${category}`);
    });

    const categoryChoice = await this.question('\nSelect category (1-5): ');
    const categories = Object.keys(topics);
    const selectedCategory = categories[parseInt(categoryChoice) - 1];

    if (!selectedCategory) {
      console.log('❌ Invalid category selection.\n');
      await this.showMenu();
      return;
    }

    console.log(`\nTopics in ${selectedCategory}:`);
    topics[selectedCategory].forEach((topic, index) => {
      console.log(`${index + 1}. ${topic}`);
    });

    const topicChoice = await this.question('\nSelect topic: ');
    const selectedTopic = topics[selectedCategory][parseInt(topicChoice) - 1];

    if (!selectedTopic) {
      console.log('❌ Invalid topic selection.\n');
      await this.showMenu();
      return;
    }

    const context = await this.question('\nAdditional context (optional): ');

    console.log(`\n🎯 Generating post about: ${selectedTopic}\n`);
    
    try {
      const post = await this.generator.generateTopicSpecificPost(selectedTopic, context);
      this.displayPost(post);
    } catch (error) {
      console.error('❌ Error generating post:', error.message);
    }

    console.log('\n');
    await this.showMenu();
  }

  async generateMultiplePosts() {
    console.log('\n📝 Generate Multiple Posts');
    console.log('=========================');

    const count = parseInt(await this.question('Number of posts to generate (1-10): ')) || 3;
    
    if (count < 1 || count > 10) {
      console.log('❌ Please enter a number between 1 and 10.\n');
      await this.showMenu();
      return;
    }

    console.log(`\n📝 Generating ${count} Michael Davis-style posts...\n`);
    
    try {
      const posts = await this.generator.generateMultiplePosts(count);
      
      posts.forEach((post, index) => {
        console.log(`\n--- Post ${index + 1} ---`);
        this.displayPost(post);
        console.log('\n' + '='.repeat(50));
      });
    } catch (error) {
      console.error('❌ Error generating posts:', error.message);
    }

    console.log('\n');
    await this.showMenu();
  }

  async generateSouthDowntownPost() {
    console.log('\n🏢 Generating South Downtown post...\n');
    
    try {
      const post = await this.generator.generateSouthDowntownPost();
      this.displayPost(post);
    } catch (error) {
      console.error('❌ Error generating post:', error.message);
    }

    console.log('\n');
    await this.showMenu();
  }

  async generateHousingPost() {
    console.log('\n🏠 Generating Housing & Tax Legislation post...\n');
    
    try {
      const post = await this.generator.generateHousingPost();
      this.displayPost(post);
    } catch (error) {
      console.error('❌ Error generating post:', error.message);
    }

    console.log('\n');
    await this.showMenu();
  }

  async generateHomegrownPost() {
    console.log('\n🌱 Generating Homegrown post...\n');
    
    try {
      const post = await this.generator.generateHomegrownPost();
      this.displayPost(post);
    } catch (error) {
      console.error('❌ Error generating post:', error.message);
    }

    console.log('\n');
    await this.showMenu();
  }

  async generateOverlinePost() {
    console.log('\n💼 Generating Overline post...\n');
    
    try {
      const post = await this.generator.generateOverlinePost();
      this.displayPost(post);
    } catch (error) {
      console.error('❌ Error generating post:', error.message);
    }

    console.log('\n');
    await this.showMenu();
  }

  async generateAtlantaTechVillagePost() {
    console.log('\n🏘️  Generating Atlanta Tech Village post...\n');
    
    try {
      const post = await this.generator.generateAtlantaTechVillagePost();
      this.displayPost(post);
    } catch (error) {
      console.error('❌ Error generating post:', error.message);
    }

    console.log('\n');
    await this.showMenu();
  }

  async viewTopics() {
    console.log('\n📋 Available Topics');
    console.log('===================');

    const topics = this.generator.getAvailableTopics();
    
    Object.entries(topics).forEach(([category, topicList]) => {
      console.log(`\n${category.toUpperCase()}:`);
      topicList.forEach((topic, index) => {
        console.log(`  ${index + 1}. ${topic}`);
      });
    });

    console.log('\n');
    await this.showMenu();
  }

  displayPost(post) {
    console.log('📄 Generated Post:');
    console.log('==================');
    console.log(`Topic: ${post.metadata.topic}`);
    console.log(`Category: ${post.metadata.category}`);
    console.log(`Style: ${post.metadata.style}`);
    console.log(`Timestamp: ${new Date(post.metadata.timestamp).toLocaleString()}`);
    console.log('\nContent:');
    console.log('--------');
    console.log(post.content);
    if (post.image) {
      if (post.image.success) {
        console.log('\n🖼️  Image generated:');
        console.log(`File: ${post.image.filename}`);
        console.log(`Prompt: ${post.image.prompt}`);
      } else {
        console.log('\n⚠️  Image generation failed:', post.image.error);
      }
    }
    console.log('\n💡 Post ready for LinkedIn!');
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.length > 0) {
  // Command line mode
  const generator = new MichaelDavisGenerator();
  
  switch (args[0]) {
    case 'random':
      generator.generatePost()
        .then(post => {
          console.log('📄 Generated Post:');
          console.log('==================');
          console.log(post.content);
          if (post.image) {
            if (post.image.success) {
              console.log('\n🖼️  Image generated:');
              console.log(`File: ${post.image.filename}`);
              console.log(`Prompt: ${post.image.prompt}`);
            } else {
              console.log('\n⚠️  Image generation failed:', post.image.error);
            }
          }
        })
        .catch(error => {
          console.error('❌ Error:', error.message);
          process.exit(1);
        });
      break;
      
    case 'southdowntown':
    case 'south-downtown':
      generator.generateSouthDowntownPost()
        .then(post => {
          console.log('📄 South Downtown Post:');
          console.log('======================');
          console.log(post.content);
          if (post.image) {
            if (post.image.success) {
              console.log('\n🖼️  Image generated:');
              console.log(`File: ${post.image.filename}`);
              console.log(`Prompt: ${post.image.prompt}`);
            } else {
              console.log('\n⚠️  Image generation failed:', post.image.error);
            }
          }
        })
        .catch(error => {
          console.error('❌ Error:', error.message);
          process.exit(1);
        });
      break;
      
    case 'housing':
      generator.generateHousingPost()
        .then(post => {
          console.log('📄 Housing & Tax Post:');
          console.log('======================');
          console.log(post.content);
          if (post.image) {
            if (post.image.success) {
              console.log('\n🖼️  Image generated:');
              console.log(`File: ${post.image.filename}`);
              console.log(`Prompt: ${post.image.prompt}`);
            } else {
              console.log('\n⚠️  Image generation failed:', post.image.error);
            }
          }
        })
        .catch(error => {
          console.error('❌ Error:', error.message);
          process.exit(1);
        });
      break;
      
    case 'homegrown':
      generator.generateHomegrownPost()
        .then(post => {
          console.log('📄 Homegrown Post:');
          console.log('==================');
          console.log(post.content);
          if (post.image) {
            if (post.image.success) {
              console.log('\n🖼️  Image generated:');
              console.log(`File: ${post.image.filename}`);
              console.log(`Prompt: ${post.image.prompt}`);
            } else {
              console.log('\n⚠️  Image generation failed:', post.image.error);
            }
          }
        })
        .catch(error => {
          console.error('❌ Error:', error.message);
          process.exit(1);
        });
      break;
      
    case 'overline':
      generator.generateOverlinePost()
        .then(post => {
          console.log('📄 Overline Post:');
          console.log('=================');
          console.log(post.content);
          if (post.image) {
            if (post.image.success) {
              console.log('\n🖼️  Image generated:');
              console.log(`File: ${post.image.filename}`);
              console.log(`Prompt: ${post.image.prompt}`);
            } else {
              console.log('\n⚠️  Image generation failed:', post.image.error);
            }
          }
        })
        .catch(error => {
          console.error('❌ Error:', error.message);
          process.exit(1);
        });
      break;
      
    case 'atv':
      generator.generateAtlantaTechVillagePost()
        .then(post => {
          console.log('📄 Atlanta Tech Village Post:');
          console.log('============================');
          console.log(post.content);
          if (post.image) {
            if (post.image.success) {
              console.log('\n🖼️  Image generated:');
              console.log(`File: ${post.image.filename}`);
              console.log(`Prompt: ${post.image.prompt}`);
            } else {
              console.log('\n⚠️  Image generation failed:', post.image.error);
            }
          }
        })
        .catch(error => {
          console.error('❌ Error:', error.message);
          process.exit(1);
        });
      break;
      
    case 'multiple':
      const count = parseInt(args[1]) || 3;
      generator.generateMultiplePosts(count)
        .then(posts => {
          posts.forEach((post, index) => {
            console.log(`\n--- Post ${index + 1} ---`);
            console.log(post.content);
            if (post.image) {
              if (post.image.success) {
                console.log('\n🖼️  Image generated:');
                console.log(`File: ${post.image.filename}`);
                console.log(`Prompt: ${post.image.prompt}`);
              } else {
                console.log('\n⚠️  Image generation failed:', post.image.error);
              }
            }
            console.log('\n' + '='.repeat(50));
          });
        })
        .catch(error => {
          console.error('❌ Error:', error.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Available commands:');
      console.log('  random              - Generate random post');
      console.log('  southdowntown       - Generate South Downtown post');
      console.log('  south-downtown      - Generate South Downtown post');
      console.log('  housing             - Generate Housing & Tax post');
      console.log('  homegrown           - Generate Homegrown post');
      console.log('  overline            - Generate Overline post');
      console.log('  atv                 - Generate Atlanta Tech Village post');
      console.log('  multiple [count]    - Generate multiple posts');
      process.exit(1);
  }
} else {
  // Interactive mode
  const cli = new MichaelDavisCLI();
  cli.start().catch(error => {
    console.error('❌ CLI error:', error.message);
    process.exit(1);
  });
} 