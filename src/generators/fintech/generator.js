const OpenAI = require('openai');
const axios = require('axios');
const config = require('../../../config.js');
const fs = require('fs');

class EnhancedContentGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.optimizationConfig = this.loadOptimizationConfig();
  }

  // Load optimization configuration from analytics
  loadOptimizationConfig() {
    try {
      if (fs.existsSync('optimization-config.json')) {
        return JSON.parse(fs.readFileSync('optimization-config.json', 'utf8'));
      }
    } catch (error) {
      console.log('📝 No optimization config found, using default parameters');
    }
    return null;
  }

  // LinkedIn optimization constants with analytics integration
  getLinkedInOptimization() {
    const baseOptimization = {
      idealWordCount: { min: 50, max: 150, optimal: 100 },
      idealCharCount: { min: 300, max: 1300, optimal: 800 },
      attentionGrabbers: [
        "🚨 SHOCKING:",
        "💥 BREAKING:",
        "🔥 HOT TAKE:",
        "⚡ URGENT:",
        "🎯 INSIDER:",
        "💡 REVEALED:",
        "🚀 EXPLOSIVE:",
        "💎 GEM:",
        "🔥 CONTROVERSIAL:",
        "⚡ CRITICAL:"
      ],
      highEngagementEmojis: [
        "📊", "💰", "🚀", "💡", "🎯", "🔥", "⚡", "💎", "🏆", "📈",
        "💼", "🎪", "🎭", "🎨", "🎪", "🎯", "🎲", "🎪", "🎭", "🎨"
      ],
      fintechEmojis: [
        "💳", "🏦", "📱", "🔐", "⚡", "🌐", "📊", "💰", "📈", "🎯"
      ]
    };

    // Apply analytics-based optimizations if available
    if (this.optimizationConfig?.contentGeneration) {
      const config = this.optimizationConfig.contentGeneration;
      
      // Adjust word count based on high-performing posts
      if (config.optimalWordCount) {
        baseOptimization.idealWordCount = {
          min: Math.max(30, config.optimalWordCount - 20),
          max: Math.min(200, config.optimalWordCount + 20),
          optimal: config.optimalWordCount
        };
      }

      // Adjust emoji count based on performance
      if (config.optimalEmojiCount) {
        baseOptimization.idealEmojiCount = {
          min: Math.max(3, config.optimalEmojiCount - 2),
          max: Math.min(15, config.optimalEmojiCount + 2),
          optimal: config.optimalEmojiCount
        };
      }

      // Adjust attention grabbers based on performance
      if (config.includeQuestions === false) {
        baseOptimization.attentionGrabbers = baseOptimization.attentionGrabbers.filter(grabber => 
          !grabber.includes('?')
        );
      }
    }

    return baseOptimization;
  }

  // Generate relevant LinkedIn mentions with proper LinkedIn formatting
  async generateLinkedInMentions() {
    // LinkedIn-compatible mentions with proper company names and LinkedIn URLs
    const fintechCompanies = [
      { name: "Stripe", linkedin: "stripe", display: "Stripe" },
      { name: "Square", linkedin: "square", display: "Square" },
      { name: "PayPal", linkedin: "paypal", display: "PayPal" },
      { name: "Coinbase", linkedin: "coinbase", display: "Coinbase" },
      { name: "Robinhood", linkedin: "robinhood-markets", display: "Robinhood" },
      { name: "Chime", linkedin: "chime", display: "Chime" },
      { name: "Affirm", linkedin: "affirm", display: "Affirm" },
      { name: "Klarna", linkedin: "klarna", display: "Klarna" },
      { name: "Plaid", linkedin: "plaid", display: "Plaid" },
      { name: "Brex", linkedin: "brex", display: "Brex" },
      { name: "Revolut", linkedin: "revolut", display: "Revolut" },
      { name: "Shopify", linkedin: "shopify", display: "Shopify" },
      { name: "Block", linkedin: "block", display: "Block" },
      { name: "Adyen", linkedin: "adyen", display: "Adyen" },
      { name: "Wise", linkedin: "wise", display: "Wise" }
    ];

    const fintechIndividuals = [
      { name: "Patrick Collison", linkedin: "patrick-collison", display: "Patrick Collison" },
      { name: "Jack Dorsey", linkedin: "jack-dorsey", display: "Jack Dorsey" },
      { name: "Brian Armstrong", linkedin: "brian-armstrong", display: "Brian Armstrong" },
      { name: "Vlad Tenev", linkedin: "vlad-tenev", display: "Vlad Tenev" },
      { name: "Max Levchin", linkedin: "max-levchin", display: "Max Levchin" },
      { name: "Daniel Ek", linkedin: "daniel-ek", display: "Daniel Ek" },
      { name: "Anne Boden", linkedin: "anne-boden", display: "Anne Boden" },
      { name: "Tom Blomfield", linkedin: "tom-blomfield", display: "Tom Blomfield" }
    ];

    const peExecutives = [
      { name: "Stephen Schwarzman", linkedin: "stephen-schwarzman", display: "Stephen Schwarzman" },
      { name: "Henry Kravis", linkedin: "henry-kravis", display: "Henry Kravis" },
      { name: "Marc Rowan", linkedin: "marc-rowan", display: "Marc Rowan" },
      { name: "David Rubenstein", linkedin: "david-rubenstein", display: "David Rubenstein" },
      { name: "Jonathan Gray", linkedin: "jonathan-gray", display: "Jonathan Gray" }
    ];

    // Randomly select 0-2 mentions
    const numMentions = Math.floor(Math.random() * 3); // 0, 1, or 2
    const allMentions = [...fintechCompanies, ...fintechIndividuals, ...peExecutives];
    const selectedMentions = [];

    for (let i = 0; i < numMentions; i++) {
      const randomMention = allMentions[Math.floor(Math.random() * allMentions.length)];
      if (!selectedMentions.some(m => m.name === randomMention.name)) {
        selectedMentions.push(randomMention);
      }
    }

    return selectedMentions;
  }

  // Get recent fintech news
  async getRecentFintechNews() {
    try {
      // Using NewsAPI (you'll need to add NEWS_API_KEY to your env)
      const newsApiKey = process.env.NEWS_API_KEY;
      if (!newsApiKey) {
        return this.getFallbackNews();
      }

      const response = await axios.get(`https://newsapi.org/v2/everything`, {
        params: {
          q: 'fintech OR "financial technology" OR "digital banking" OR "payment processing"',
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          sortBy: 'relevancy',
          language: 'en',
          pageSize: 10,
          apiKey: newsApiKey
        }
      });

      return response.data.articles.slice(0, 5).map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt
      }));
    } catch (error) {
      console.log('⚠️  News API failed, using fallback news...');
      return this.getFallbackNews();
    }
  }

  getFallbackNews() {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    return [
      {
        title: `Fed signals potential rate cuts in ${nextYear}`,
        description: "Federal Reserve indicates possible interest rate reductions",
        publishedAt: new Date().toISOString()
      },
      {
        title: "Digital payments surge 23% globally",
        description: "Contactless and mobile payments continue rapid adoption",
        publishedAt: new Date().toISOString()
      },
      {
        title: `Fintech funding reaches $50B in Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
        description: "Investment in financial technology startups remains strong",
        publishedAt: new Date().toISOString()
      }
    ];
  }

  // Generate optimized LinkedIn post
  async generateOptimizedPost() {
    try {
      const optimization = this.getLinkedInOptimization();
      const news = await this.getRecentFintechNews();
      const mentions = await this.generateLinkedInMentions();
      const attentionGrabber = optimization.attentionGrabbers[Math.floor(Math.random() * optimization.attentionGrabbers.length)];
      const emojis = [...optimization.highEngagementEmojis, ...optimization.fintechEmojis];
      
      // Format mentions for LinkedIn
      const mentionsText = mentions.length > 0 ? 
        `\nMENTIONS TO INCLUDE: ${mentions.map(m => m.display).join(', ')}` : '';
      const linkedinMentions = mentions.map(m => 
        m.linkedin.includes('company') ? 
          `https://www.linkedin.com/company/${m.linkedin}` : 
          `https://www.linkedin.com/in/${m.linkedin}`
      );
      
      const prompt = `Create a LinkedIn post for FintechPulse with these EXACT requirements:

AGENT PROFILE:
- Name: FintechPulse
- Purpose: Promote Fintech & Service Industry Analytics
- Style: Analytical, attention-grabbing, professional
- Audience: Fintech & PE Executives
- Tone: Confident, data-driven, slightly provocative

CONTENT REQUIREMENTS:
1. Start with: "${attentionGrabber}" followed by a shocking/controversial statement
2. Include 1-2 recent fintech news items from this week: ${JSON.stringify(news.slice(0, 2))}
3. Use 8-12 emojis strategically: ${emojis.join(' ')}
4. Include industry statistics and data points
5. Add a thought-provoking question or call-to-action${mentionsText}
6. End with 3-5 relevant hashtags

TIME AWARENESS REQUIREMENTS:
- Current year is ${new Date().getFullYear()}
- Current month is ${new Date().toLocaleString('default', { month: 'long' })}
- All data references must be current or future-oriented
- Avoid referencing past years as if they're current
- Use phrases like "this year", "next year", "current quarter"
- Ensure all statistics and predictions are time-appropriate

MENTION REQUIREMENTS:
- Include the provided mentions naturally in the content
- Use mentions to reference companies/individuals in context
- Don't force mentions - integrate them smoothly
- Mentions should add value to the conversation
- For LinkedIn mentions, use the company/person name naturally in the text
- LinkedIn will automatically link mentions when the post is published

TECHNICAL REQUIREMENTS:
- Word count: ${optimization.idealWordCount.optimal} words (±20)
- Character count: ${optimization.idealCharCount.optimal} characters (±200)
- First sentence must be attention-grabbing and algorithm-friendly
- Include bullet points or numbered lists
- No repetitive content from previous posts
- Professional but engaging tone

FORMAT: Return only the post content, no explanations.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are FintechPulse, an expert fintech content creator. Create viral, algorithm-optimized LinkedIn posts that drive high engagement among fintech executives and investors."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.8
      });

      return completion.choices[0].message.content.trim();

    } catch (error) {
      console.error('Error generating optimized content:', error);
      return this.generateFallbackOptimizedPost();
    }
  }

  generateFallbackOptimizedPost() {
    const optimization = this.getLinkedInOptimization();
    const attentionGrabber = optimization.attentionGrabbers[Math.floor(Math.random() * optimization.attentionGrabbers.length)];
    const emojis = optimization.fintechEmojis;
    
    // Generate mentions for fallback posts using proper LinkedIn format
    const fintechCompanies = [
      { name: "Stripe", display: "Stripe" },
      { name: "Square", display: "Square" },
      { name: "PayPal", display: "PayPal" },
      { name: "Coinbase", display: "Coinbase" },
      { name: "Robinhood", display: "Robinhood" },
      { name: "Chime", display: "Chime" },
      { name: "Affirm", display: "Affirm" }
    ];
    const fintechIndividuals = [
      { name: "Patrick Collison", display: "Patrick Collison" },
      { name: "Jack Dorsey", display: "Jack Dorsey" },
      { name: "Brian Armstrong", display: "Brian Armstrong" },
      { name: "Vlad Tenev", display: "Vlad Tenev" }
    ];
    const allMentions = [...fintechCompanies, ...fintechIndividuals];
    
    const mentions = [];
    const numMentions = Math.floor(Math.random() * 3); // 0, 1, or 2
    for (let i = 0; i < numMentions; i++) {
      const randomMention = allMentions[Math.floor(Math.random() * allMentions.length)];
      if (!mentions.some(m => m.name === randomMention.name)) {
        mentions.push(randomMention);
      }
    }
    
    const mentionsText = mentions.length > 0 ? 
      `\n\n💼 What do you think ${mentions.map(m => m.display).join(', ')}?` : '';
    
          const templates = [
        `${attentionGrabber} 78% of traditional banks will be obsolete by 2030. 💥

📊 The numbers don't lie:
• Digital payments up 23% this quarter
• Fintech funding hits $50B globally this year
• 3 out of 4 consumers prefer digital banking

💡 But here's what most execs miss:
Traditional banks are spending billions on "digital transformation" while fintech startups like ${mentions[0] || '@Stripe'} are building the future from scratch.

🎯 Question: Are you investing in the past or the future?

The companies that adapt now will capture 80% of the market share.${mentionsText}

#Fintech #DigitalTransformation #Banking #Innovation #FutureOfFinance`,

        `${attentionGrabber} The Fed just made a move that will change fintech forever. 🔥

📈 What happened:
• Interest rates signaling cuts in ${new Date().getFullYear() + 1}
• Digital payments surge continues
• RegTech spending to reach $19.5B by ${new Date().getFullYear() + 2}

⚡ The opportunity:
Lending platforms that can adapt to rate changes will dominate the next 5 years.

💎 Insider insight:
The winners will be those who can:
• Scale quickly in changing conditions
• Leverage AI for risk assessment
• Build seamless user experiences

🚀 Are you positioned for this shift?

The data shows a $2T opportunity for agile fintech companies like ${mentions[0] || '@Affirm'}.${mentionsText}

#Fintech #Lending #AI #Innovation #DigitalBanking`
      ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Generate and save actual image for the post
  async generateImage(postContent) {
    try {
      // Create images directory if it doesn't exist
      const fs = require('fs');
      const path = require('path');
      const imagesDir = path.join(__dirname, '..', 'images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      // Generate optimized image prompt
      const imagePrompt = await this.generateImagePrompt(postContent);
      
      console.log('🎨 Generating image with DALL-E...');
      
      // Enhanced prompt to avoid text and numbers
      const enhancedPrompt = `${imagePrompt}

IMPORTANT: Create an image with NO text, numbers, letters, or readable characters. Use abstract geometric shapes, gradients, and professional design elements instead.`;

      // Generate image using DALL-E
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      });

      if (response.data && response.data[0] && response.data[0].url) {
        const imageUrl = response.data[0].url;
        
        // Download and save the image
        const axios = require('axios');
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        
        // Generate unique filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `fintech-pulse-${timestamp}.png`;
        const imagePath = path.join(imagesDir, filename);
        
        // Save image to local file
        fs.writeFileSync(imagePath, imageResponse.data);
        
        console.log(`✅ Image generated and saved: ${filename}`);
        
        return {
          success: true,
          imagePath: imagePath,
          filename: filename,
          prompt: imagePrompt,
          url: imageUrl
        };
      } else {
        throw new Error('No image URL received from DALL-E');
      }
      
    } catch (error) {
      console.error('❌ Error generating image:', error.message);
      return {
        success: false,
        imagePath: null,
        filename: null,
        prompt: await this.generateImagePrompt(postContent),
        error: error.message
      };
    }
  }

  // Generate image prompt for the post (helper method)
  async generateImagePrompt(postContent) {
    try {
      const prompt = `Create a professional fintech image prompt based on this LinkedIn post:

${postContent}

Requirements:
- Professional, corporate style
- Fintech/technology theme
- Data visualization elements
- Modern, clean design
- Suitable for LinkedIn business audience
- No text overlay needed
- High-quality, photorealistic style
- Blue and white color scheme preferred
- Clean, minimalist composition
- NO TEXT, NUMBERS, OR LETTERS in the image
- NO CHARTS WITH LABELS OR AXES
- NO SCREENS WITH TEXT
- Focus on abstract data visualization, geometric shapes, and professional aesthetics
- Use gradients, light effects, and modern design elements instead of text

Return only the image prompt, no explanations.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating image prompts for professional fintech content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      return "Professional fintech dashboard with data visualization, modern office setting, blue and white color scheme, clean design";
    }
  }

  // Calculate engagement metrics with analytics integration
  calculateEngagementMetrics(postContent) {
    const optimization = this.getLinkedInOptimization();
    const wordCount = postContent.split(/\s+/).length;
    const charCount = postContent.length;
    const emojiCount = (postContent.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    const hasQuestion = /\?/.test(postContent);
    const hasCallToAction = /\b(DM|follow|connect|share|comment|like)\b/i.test(postContent);
    const hasStats = /\d+%|\$\d+|\d+ billion|\d+ million/i.test(postContent);
    // Count mentions by looking for company/person names in the content
    const mentionCount = this.countMentionsInContent(postContent);

    // Engagement scoring algorithm
    let engagementScore = 0;
    
    // Word count optimization (0-20 points)
    if (wordCount >= optimization.idealWordCount.min && wordCount <= optimization.idealWordCount.max) {
      engagementScore += 20;
    } else if (wordCount >= 30 && wordCount <= 200) {
      engagementScore += 10;
    }

    // Character count optimization (0-20 points)
    if (charCount >= optimization.idealCharCount.min && charCount <= optimization.idealCharCount.max) {
      engagementScore += 20;
    } else if (charCount >= 200 && charCount <= 1500) {
      engagementScore += 10;
    }

    // Emoji usage (0-15 points)
    if (emojiCount >= 5 && emojiCount <= 12) {
      engagementScore += 15;
    } else if (emojiCount >= 3 && emojiCount <= 15) {
      engagementScore += 10;
    }

    // Engagement elements (0-25 points)
    if (hasQuestion) engagementScore += 10;
    if (hasCallToAction) engagementScore += 10;
    if (hasStats) engagementScore += 5;

    // LinkedIn mentions (0-15 points)
    if (mentionCount >= 1 && mentionCount <= 2) {
      engagementScore += 15;
    } else if (mentionCount > 2) {
      engagementScore += 10;
    }

    // Attention grabber (0-20 points)
    const hasAttentionGrabber = optimization.attentionGrabbers.some(grabber => 
      postContent.includes(grabber.replace(/[🚨💥🔥⚡🎯💡🚀💎]/g, ''))
    );
    if (hasAttentionGrabber) engagementScore += 20;

    // Apply analytics-based engagement multiplier if available
    let finalEngagementScore = engagementScore;
    let multiplier = 1 + (engagementScore / 100);
    let optimizationApplied = false;

    if (this.optimizationConfig?.engagementScoring?.multiplier) {
      const analyticsMultiplier = this.optimizationConfig.engagementScoring.multiplier;
      finalEngagementScore = Math.min(100, Math.round(engagementScore * analyticsMultiplier));
      multiplier = 1 + (finalEngagementScore / 100);
      optimizationApplied = true;
    }

    // Estimated metrics based on score
    const baseViews = 500;
    const baseClicks = 25;
    const baseInteractions = 15;
    
    return {
      engagementScore: finalEngagementScore,
      estimatedViews: Math.round(baseViews * multiplier),
      estimatedClicks: Math.round(baseClicks * multiplier),
      estimatedInteractions: Math.round(baseInteractions * multiplier),
      optimizationApplied,
      analyticsMultiplier: this.optimizationConfig?.engagementScoring?.multiplier,
      metrics: {
        wordCount,
        charCount,
        emojiCount,
        hasQuestion,
        hasCallToAction,
        hasStats,
        hasAttentionGrabber,
        mentionCount
      }
    };
  }

  // Analyze post for similarity with previous posts
  async analyzeSimilarity(postContent, previousPosts = []) {
    // Simple similarity check - in production, you'd use more sophisticated NLP
    const words = postContent.toLowerCase().split(/\s+/);
    const uniqueWords = [...new Set(words)];
    
    let maxSimilarity = 0;
    
    for (const previousPost of previousPosts) {
      const prevWords = previousPost.toLowerCase().split(/\s+/);
      const prevUniqueWords = [...new Set(prevWords)];
      
      const commonWords = uniqueWords.filter(word => prevUniqueWords.includes(word));
      const similarity = commonWords.length / Math.max(uniqueWords.length, prevUniqueWords.length);
      
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    return {
      similarityScore: maxSimilarity,
      isTooSimilar: maxSimilarity > 0.7,
      recommendation: maxSimilarity > 0.7 ? 'Regenerate - too similar to previous posts' : 'Good - sufficient uniqueness'
    };
  }

  // Count mentions in content by looking for company/person names
  countMentionsInContent(postContent) {
    const allMentions = [
      // Companies
      "Stripe", "Square", "PayPal", "Coinbase", "Robinhood", "Chime", "Affirm",
      "Klarna", "Plaid", "Brex", "Revolut", "Shopify", "Block", "Adyen", "Wise",
      // Individuals
      "Patrick Collison", "Jack Dorsey", "Brian Armstrong", "Vlad Tenev",
      "Max Levchin", "Daniel Ek", "Anne Boden", "Tom Blomfield",
      "Stephen Schwarzman", "Henry Kravis", "Marc Rowan", "David Rubenstein",
      "Jonathan Gray"
    ];

    let mentionCount = 0;
    for (const mention of allMentions) {
      if (postContent.includes(mention)) {
        mentionCount++;
      }
    }

    return mentionCount;
  }
}

module.exports = EnhancedContentGenerator; 