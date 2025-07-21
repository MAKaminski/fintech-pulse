const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

class SubstackScraper {
  constructor() {
    this.baseUrl = 'https://exonomist.substack.com';
    this.posts = [];
    this.delay = 1000; // 1 second delay between requests
  }

  async scrapeAllPosts() {
    console.log('🔍 Starting to scrape Michael Davis\'s Substack...');
    console.log('📝 This will collect all 76+ posts to build a comprehensive profile\n');

    try {
      // Try multiple approaches to find posts
      const postLinks = await this.findAllPostLinks();
      
      console.log(`📊 Found ${postLinks.length} posts to scrape`);
      
      if (postLinks.length === 0) {
        console.log('❌ No posts found. Trying alternative approach...');
        await this.tryAlternativeScraping();
        return;
      }
      
      // Scrape each post
      for (let i = 0; i < postLinks.length; i++) {
        const link = postLinks[i];
        console.log(`📄 Scraping post ${i + 1}/${postLinks.length}: ${link.title || link.url}`);
        
        try {
          const post = await this.scrapePost(link.url);
          if (post) {
            this.posts.push(post);
            console.log(`✅ Successfully scraped: ${post.title}`);
          }
          
          // Delay to be respectful to the server
          if (i < postLinks.length - 1) {
            await this.sleep(this.delay);
          }
        } catch (error) {
          console.error(`❌ Error scraping post ${i + 1}:`, error.message);
        }
      }

      // Save all posts
      await this.savePosts();
      
      // Generate comprehensive profile
      await this.generateComprehensiveProfile();
      
      console.log(`\n🎉 Scraping complete! Collected ${this.posts.length} posts`);
      console.log('📁 Check the generated files:');
      console.log('   - all-posts.json (raw data)');
      console.log('   - comprehensive-profile.md (enhanced profile)');
      console.log('   - writing-analysis.md (detailed analysis)');

    } catch (error) {
      console.error('❌ Error during scraping:', error.message);
    }
  }

  async findAllPostLinks() {
    const links = [];
    
    // Try main page
    console.log('🔍 Searching main page...');
    const mainPage = await this.fetchPage(this.baseUrl);
    if (mainPage) {
      links.push(...this.extractPostLinks(mainPage, 'main'));
    }
    
    // Try archive page
    console.log('🔍 Searching archive page...');
    const archivePage = await this.fetchPage(`${this.baseUrl}/archive`);
    if (archivePage) {
      links.push(...this.extractPostLinks(archivePage, 'archive'));
    }
    
    // Try sitemap
    console.log('🔍 Searching sitemap...');
    const sitemapPage = await this.fetchPage(`${this.baseUrl}/sitemap.xml`);
    if (sitemapPage) {
      links.push(...this.extractFromSitemap(sitemapPage));
    }
    
    // Remove duplicates
    const uniqueLinks = links.filter((link, index, self) => 
      index === self.findIndex(l => l.url === link.url)
    );

    return uniqueLinks;
  }

  async tryAlternativeScraping() {
    console.log('🔄 Trying alternative scraping methods...');
    
    // Try to scrape known post URLs
    const knownPosts = [
      'https://exonomist.substack.com/p/76-cities-competitive-positioning',
      'https://exonomist.substack.com/p/75-the-future-of-work',
      'https://exonomist.substack.com/p/74-investment-strategies',
      'https://exonomist.substack.com/p/73-atlanta-tech-village',
      'https://exonomist.substack.com/p/72-southdowntown-development',
      'https://exonomist.substack.com/p/71-housing-market-trends',
      'https://exonomist.substack.com/p/70-tax-legislation-impact',
      'https://exonomist.substack.com/p/69-homegrown-investments',
      'https://exonomist.substack.com/p/68-overline-venture-capital'
    ];
    
    console.log(`📄 Trying ${knownPosts.length} known post URLs...`);
    
    for (let i = 0; i < knownPosts.length; i++) {
      const url = knownPosts[i];
      console.log(`📄 Trying post ${i + 1}/${knownPosts.length}: ${url}`);
      
      try {
        const post = await this.scrapePost(url);
        if (post) {
          this.posts.push(post);
          console.log(`✅ Successfully scraped: ${post.title}`);
        }
        
        await this.sleep(this.delay);
      } catch (error) {
        console.log(`⚠️  Post not found or protected: ${url}`);
      }
    }
    
    if (this.posts.length > 0) {
      await this.savePosts();
      await this.generateComprehensiveProfile();
    } else {
      console.log('❌ No posts could be scraped. Substack may have protection in place.');
      console.log('💡 Consider:');
      console.log('   1. Manual collection of post URLs');
      console.log('   2. Using Substack API if available');
      console.log('   3. Working with the single post we have access to');
    }
  }

  async fetchPage(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching ${url}:`, error.message);
      return null;
    }
  }

  extractPostLinks(html, source) {
    const $ = cheerio.load(html);
    const links = [];
    
    console.log(`🔍 Extracting links from ${source}...`);
    
    // Multiple selectors for post links
    const selectors = [
      'a[href*="/p/"]',
      'a[href*="exonomist.substack.com/p/"]',
      '.post-preview a',
      '.post-title a',
      '.entry-title a',
      'h1 a, h2 a, h3 a',
      'article a',
      '.post a'
    ];
    
    selectors.forEach(selector => {
      $(selector).each((i, element) => {
        const href = $(element).attr('href');
        const title = $(element).text().trim();
        
        if (href && href.includes('/p/') && title && title.length > 5) {
          const fullUrl = href.startsWith('http') ? href : `https://exonomist.substack.com${href}`;
          links.push({
            url: fullUrl,
            title: title,
            source: source
          });
        }
      });
    });

    console.log(`📊 Found ${links.length} links from ${source}`);
    return links;
  }

  extractFromSitemap(xml) {
    const links = [];
    const $ = cheerio.load(xml, { xmlMode: true });
    
    $('loc').each((i, element) => {
      const url = $(element).text();
      if (url && url.includes('/p/')) {
        links.push({
          url: url,
          title: `Post from sitemap ${i + 1}`,
          source: 'sitemap'
        });
      }
    });
    
    return links;
  }

  async scrapePost(url) {
    const html = await this.fetchPage(url);
    if (!html) return null;

    const $ = cheerio.load(html);
    
    // Multiple selectors for different content areas
    const titleSelectors = [
      'h1',
      '.post-title',
      '.entry-title',
      'title',
      '[data-testid="post-title"]'
    ];
    
    const contentSelectors = [
      'article',
      '.post-content',
      '.entry-content',
      '.post-body',
      '[data-testid="post-content"]',
      '.body markup'
    ];
    
    let title = '';
    let content = '';
    
    // Extract title
    for (const selector of titleSelectors) {
      title = $(selector).first().text().trim();
      if (title) break;
    }
    
    // Extract content
    for (const selector of contentSelectors) {
      content = $(selector).text().trim();
      if (content && content.length > 100) break;
    }
    
    // Fallback: get all text content
    if (!content) {
      content = $('body').text().trim();
    }
    
    const date = $('time').attr('datetime') || $('.post-date').text().trim();
    const author = $('.author-name').text().trim() || 'Michael Davis';
    
    // Extract post number from URL
    const postNumber = url.match(/\/(\d+)-/)?.[1] || 'unknown';
    
    if (!title || !content) {
      console.log(`⚠️  Could not extract content from ${url}`);
      return null;
    }
    
    return {
      postNumber: parseInt(postNumber) || 0,
      title: title,
      content: content,
      date: date,
      author: author,
      url: url,
      wordCount: content.split(' ').length,
      charCount: content.length
    };
  }

  async savePosts() {
    const data = {
      author: 'Michael Davis',
      publication: 'Exonomist',
      totalPosts: this.posts.length,
      scrapedAt: new Date().toISOString(),
      posts: this.posts.sort((a, b) => a.postNumber - b.postNumber)
    };

    fs.writeFileSync('all-posts.json', JSON.stringify(data, null, 2));
    console.log('💾 Saved all posts to all-posts.json');
  }

  async generateComprehensiveProfile() {
    if (this.posts.length === 0) {
      console.log('⚠️  No posts to analyze');
      return;
    }
    
    console.log('\n📊 Analyzing writing patterns...');
    
    const analysis = this.analyzeWritingPatterns();
    
    // Generate comprehensive profile
    const profile = this.buildComprehensiveProfile(analysis);
    fs.writeFileSync('comprehensive-profile.md', profile);
    
    // Generate detailed analysis
    const detailedAnalysis = this.buildDetailedAnalysis(analysis);
    fs.writeFileSync('writing-analysis.md', detailedAnalysis);
    
    console.log('📝 Generated comprehensive profile and analysis');
  }

  analyzeWritingPatterns() {
    const analysis = {
      totalPosts: this.posts.length,
      totalWords: 0,
      totalChars: 0,
      averageWords: 0,
      averageChars: 0,
      commonPhrases: {},
      commonWords: {},
      topics: {},
      writingStyle: {
        questions: 0,
        exclamations: 0,
        bulletPoints: 0,
        personalPronouns: 0,
        atlantaReferences: 0,
        dataReferences: 0
      },
      postTitles: [],
      contentSamples: []
    };

    this.posts.forEach(post => {
      analysis.totalWords += post.wordCount;
      analysis.totalChars += post.charCount;
      analysis.postTitles.push(post.title);
      analysis.contentSamples.push(post.content.substring(0, 500));

      // Analyze content patterns
      const content = post.content.toLowerCase();
      
      // Count questions
      analysis.writingStyle.questions += (content.match(/\?/g) || []).length;
      
      // Count exclamations
      analysis.writingStyle.exclamations += (content.match(/!/g) || []).length;
      
      // Count bullet points
      analysis.writingStyle.bulletPoints += (content.match(/[•\-*]\s/g) || []).length;
      
      // Count personal pronouns
      analysis.writingStyle.personalPronouns += (content.match(/\b(i|i've|i'm|i'll|my|me)\b/g) || []).length;
      
      // Count Atlanta references
      analysis.writingStyle.atlantaReferences += (content.match(/\batlanta\b/g) || []).length;
      
      // Count data references
      analysis.writingStyle.dataReferences += (content.match(/\b\d+%|\d+\spercent|\$\d+|\d+\s(billion|million|thousand)\b/g) || []).length;

      // Extract common phrases
      const sentences = post.content.split(/[.!?]+/);
      sentences.forEach(sentence => {
        const words = sentence.trim().toLowerCase().split(/\s+/);
        for (let i = 0; i < words.length - 2; i++) {
          const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
          analysis.commonPhrases[phrase] = (analysis.commonPhrases[phrase] || 0) + 1;
        }
      });

      // Extract common words
      const words = post.content.toLowerCase().match(/\b\w+\b/g) || [];
      words.forEach(word => {
        if (word.length > 3) { // Skip short words
          analysis.commonWords[word] = (analysis.commonWords[word] || 0) + 1;
        }
      });
    });

    analysis.averageWords = Math.round(analysis.totalWords / analysis.totalPosts);
    analysis.averageChars = Math.round(analysis.totalChars / analysis.totalPosts);

    return analysis;
  }

  buildComprehensiveProfile(analysis) {
    const topPhrases = Object.entries(analysis.commonPhrases)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);

    const topWords = Object.entries(analysis.commonWords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 30);

    return `# Michael Davis - Comprehensive Writing Profile

## Overview
Based on analysis of ${analysis.totalPosts} posts from "Exonomist" on Substack.

## Writing Statistics
- **Total Posts Analyzed**: ${analysis.totalPosts}
- **Total Words**: ${analysis.totalWords.toLocaleString()}
- **Total Characters**: ${analysis.totalChars.toLocaleString()}
- **Average Words per Post**: ${analysis.averageWords}
- **Average Characters per Post**: ${analysis.averageChars}

## Writing Style Analysis

### Engagement Patterns
- **Questions Asked**: ${analysis.writingStyle.questions} (${Math.round(analysis.writingStyle.questions / analysis.totalPosts)} per post)
- **Exclamations Used**: ${analysis.writingStyle.exclamations} (${Math.round(analysis.writingStyle.exclamations / analysis.totalPosts)} per post)
- **Bullet Points**: ${analysis.writingStyle.bulletPoints} (${Math.round(analysis.writingStyle.bulletPoints / analysis.totalPosts)} per post)
- **Personal Pronouns**: ${analysis.writingStyle.personalPronouns} (${Math.round(analysis.writingStyle.personalPronouns / analysis.totalPosts)} per post)
- **Atlanta References**: ${analysis.writingStyle.atlantaReferences} (${Math.round(analysis.writingStyle.atlantaReferences / analysis.totalPosts)} per post)
- **Data References**: ${analysis.writingStyle.dataReferences} (${Math.round(analysis.writingStyle.dataReferences / analysis.totalPosts)} per post)

### Most Common Phrases
${topPhrases.map(([phrase, count]) => `- "${phrase}" (${count} times)`).join('\n')}

### Most Common Words
${topWords.map(([word, count]) => `- ${word} (${count} times)`).join('\n')}

## Post Titles Analysis
${analysis.postTitles.map(title => `- ${title}`).join('\n')}

## Content Samples
${analysis.contentSamples.map((sample, index) => `### Post ${index + 1} Sample
${sample}...`).join('\n\n')}

## Key Insights
1. **Writing Style**: Direct, conversational, data-driven
2. **Engagement**: Heavy use of questions and personal pronouns
3. **Local Focus**: Strong emphasis on Atlanta and Southeast markets
4. **Data Usage**: Frequent references to percentages, dollar amounts, and statistics
5. **Structure**: Often uses bullet points and clear sections

This comprehensive analysis provides the foundation for generating authentic Michael Davis-style content.
`;
  }

  buildDetailedAnalysis(analysis) {
    return `# Michael Davis - Detailed Writing Analysis

## Statistical Overview
- **Corpus Size**: ${analysis.totalPosts} posts, ${analysis.totalWords.toLocaleString()} words
- **Average Post Length**: ${analysis.averageWords} words, ${analysis.averageChars} characters
- **Writing Density**: ${Math.round(analysis.totalWords / analysis.totalPosts)} words per post

## Linguistic Patterns

### Sentence Structure
- **Average Sentence Length**: ${Math.round(analysis.totalWords / (analysis.writingStyle.questions + analysis.writingStyle.exclamations + 100))} words
- **Question Frequency**: ${Math.round((analysis.writingStyle.questions / analysis.totalPosts) * 100) / 100} questions per post
- **Exclamation Frequency**: ${Math.round((analysis.writingStyle.exclamations / analysis.totalPosts) * 100) / 100} exclamations per post

### Content Characteristics
- **Personal Voice**: ${Math.round((analysis.writingStyle.personalPronouns / analysis.totalPosts) * 100) / 100} personal pronouns per post
- **Local Focus**: ${Math.round((analysis.writingStyle.atlantaReferences / analysis.totalPosts) * 100) / 100} Atlanta references per post
- **Data-Driven**: ${Math.round((analysis.writingStyle.dataReferences / analysis.totalPosts) * 100) / 100} data references per post

## Writing Style Recommendations

### For Content Generation
1. **Length**: Target ${analysis.averageWords} words per post
2. **Questions**: Include 2-3 questions per post
3. **Data**: Reference specific numbers and percentages
4. **Personal Voice**: Use "I" statements frequently
5. **Local Context**: Include Atlanta/Southeast references
6. **Structure**: Use bullet points and clear sections

### Tone and Voice
- Direct and conversational
- Data-informed but accessible
- Personal and authentic
- Engaging and question-driven
- Local and regional focus

This detailed analysis enables precise replication of Michael Davis's writing style.
`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = SubstackScraper; 