#!/usr/bin/env node

const SubstackScraper = require('./substack-scraper');

async function main() {
  console.log('🔍 Michael Davis Substack Scraper');
  console.log('==================================\n');
  
  console.log('⚠️  Important Notes:');
  console.log('   - This will scrape all 76+ posts from exonomist.substack.com');
  console.log('   - It will take several minutes to complete');
  console.log('   - Please be respectful of the server (1-second delays between requests)');
  console.log('   - This is for educational/research purposes only\n');

  const scraper = new SubstackScraper();
  
  try {
    await scraper.scrapeAllPosts();
    
    console.log('\n🎉 Scraping completed successfully!');
    console.log('\n📁 Generated files:');
    console.log('   - all-posts.json (raw post data)');
    console.log('   - comprehensive-profile.md (enhanced profile)');
    console.log('   - writing-analysis.md (detailed analysis)');
    
    console.log('\n💡 Next steps:');
    console.log('   1. Review the generated files');
    console.log('   2. Update michael-davis-profile.md with new insights');
    console.log('   3. Test the enhanced content generator');
    
  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.length > 0) {
  switch (args[0]) {
    case 'help':
      console.log('Michael Davis Substack Scraper');
      console.log('==============================');
      console.log('');
      console.log('Usage:');
      console.log('  node src/scrape-michael-davis.js        - Run full scraping');
      console.log('  node src/scrape-michael-davis.js help   - Show this help');
      console.log('');
      console.log('This tool will:');
      console.log('  1. Scrape all posts from exonomist.substack.com');
      console.log('  2. Analyze writing patterns and style');
      console.log('  3. Generate comprehensive profile files');
      console.log('  4. Create detailed writing analysis');
      break;
      
    default:
      console.log('Unknown command. Use "help" for usage information.');
      process.exit(1);
  }
} else {
  main();
} 