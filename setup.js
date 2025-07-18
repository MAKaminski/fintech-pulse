#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 FintechPulse Environment Setup');
console.log('==================================\n');

async function setupEnvironment() {
  try {
    // Check if .env already exists
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log('⚠️  .env file already exists. Do you want to overwrite it? (y/N)');
      const answer = await question('');
      if (answer.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        process.exit(0);
      }
    }

    console.log('Please provide the following information:\n');

    // LinkedIn credentials
    console.log('📱 LinkedIn API Credentials:');
    const linkedinClientId = await question('LinkedIn Client ID: ');
    const linkedinClientSecret = await question('LinkedIn Client Secret: ');
    const linkedinRedirectUri = await question('LinkedIn Redirect URI (default: http://localhost:8000/callback): ') || 'http://localhost:8000/callback';

    // OpenAI API key
    console.log('\n🤖 OpenAI API:');
    const openaiApiKey = await question('OpenAI API Key: ');

    // News API key (optional)
    console.log('\n📰 News API (Optional):');
    const newsApiKey = await question('News API Key (press Enter to skip): ');

    // Server configuration
    console.log('\n⚙️  Server Configuration:');
    const port = await question('Server Port (default: 8000): ') || '8000';
    const morningTime = await question('Morning Post Time (default: 08:30): ') || '08:30';
    const eveningTime = await question('Evening Post Time (default: 16:00): ') || '16:00';
    const timezone = await question('Timezone (default: America/New_York): ') || 'America/New_York';

    // Generate .env content
    const envContent = `# LinkedIn API Credentials
LINKEDIN_CLIENT_ID=${linkedinClientId}
LINKEDIN_CLIENT_SECRET=${linkedinClientSecret}
LINKEDIN_REDIRECT_URI=${linkedinRedirectUri}

# OpenAI API Key
OPENAI_API_KEY=${openaiApiKey}

# News API Key (Optional - for enhanced news features)
NEWS_API_KEY=${newsApiKey || 'your_news_api_key_here'}

# Server Configuration
PORT=${port}
NODE_ENV=development

# Posting Schedule (EST)
MORNING_POST_TIME=${morningTime}
EVENING_POST_TIME=${eveningTime}
TIMEZONE=${timezone}
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Environment configuration saved to .env file!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run auth');
    console.log('2. Run: npm run enhanced-preview (to test)');
    console.log('3. Run: npm start (to start the agent)');
    console.log('\n🔒 Security note: The .env file is already in .gitignore and will not be committed to version control.');

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  } finally {
    rl.close();
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

setupEnvironment(); 