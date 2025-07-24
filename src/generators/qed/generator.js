const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class QEDInvestmentGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.qedProfile = this.loadQEDProfile();
  }

  // Load QED investment profile and focus areas
  loadQEDProfile() {
    const profilePath = path.join(__dirname, '../../../profiles/qed-profile.md');
    
    const defaultProfile = {
      name: "QED Investors",
      focus: "Fintech and financial services investments",
      stage: "Series A to Series C",
      geography: "Global with focus on US, UK, Brazil, and emerging markets",
      portfolio: {
        sectors: [
          "Digital banking",
          "Payment infrastructure", 
          "Lending platforms",
          "Insurance technology",
          "Wealth management",
          "B2B financial software",
          "Cryptocurrency and blockchain",
          "Embedded finance"
        ],
        notable_investments: [
          "Nubank",
          "Credit Karma", 
          "Flutterwave",
          "SoFi",
          "QuintoAndar",
          "Klarna",
          "Current",
          "Remitly"
        ]
      },
      investment_thesis: [
        "Financial inclusion and accessibility",
        "Infrastructure that enables financial innovation",
        "Consumer-centric financial products",
        "B2B solutions that modernize financial services",
        "Emerging market fintech opportunities"
      ],
      content_themes: [
        "Fintech innovation trends",
        "Investment insights and market analysis", 
        "Portfolio company achievements",
        "Financial inclusion impact",
        "Emerging market opportunities",
        "Regulatory developments in fintech",
        "Partnership announcements",
        "Industry thought leadership"
      ]
    };

    try {
      if (fs.existsSync(profilePath)) {
        const profileContent = fs.readFileSync(profilePath, 'utf8');
        return { ...defaultProfile, profileContent };
      }
    } catch (error) {
      console.log('📝 Using default QED profile');
    }
    
    return defaultProfile;
  }

  // Generate QED investment-focused post
  async generateInvestmentPost(options = {}) {
    const {
      theme = 'random',
      includeImage = true,
      tone = 'professional',
      focusArea = 'random'
    } = options;

    try {
      console.log('🎯 Generating QED investment post...');

      const selectedTheme = theme === 'random' 
        ? this.qedProfile.content_themes[Math.floor(Math.random() * this.qedProfile.content_themes.length)]
        : theme;

      const selectedFocus = focusArea === 'random'
        ? this.qedProfile.portfolio.sectors[Math.floor(Math.random() * this.qedProfile.portfolio.sectors.length)]
        : focusArea;

      const prompt = this.buildQEDPrompt(selectedTheme, selectedFocus, tone);
      const content = await this.generateContentWithAI(prompt);
      
      const post = {
        content: content,
        metadata: {
          theme: selectedTheme,
          focusArea: selectedFocus,
          tone: tone,
          includeImage: includeImage,
          generator: 'qed-investment',
          timestamp: new Date().toISOString(),
          engagement_score: this.calculateEngagementScore(content),
          hashtags: this.generateRelevantHashtags(selectedTheme, selectedFocus),
          imagePrompt: includeImage ? this.generateImagePrompt(selectedTheme, selectedFocus) : null
        }
      };

      console.log('✅ QED investment post generated successfully');
      return post;

    } catch (error) {
      console.error('❌ Error generating QED post:', error);
      throw error;
    }
  }

  // Build comprehensive prompt for QED content
  buildQEDPrompt(theme, focusArea, tone) {
    return `
You are creating a LinkedIn post for QED Investors, a leading global fintech venture capital firm.

QED Profile:
- Focus: ${this.qedProfile.focus}
- Investment Stage: ${this.qedProfile.stage}
- Geography: ${this.qedProfile.geography}
- Key Sectors: ${this.qedProfile.portfolio.sectors.join(', ')}

Content Requirements:
- Theme: ${theme}
- Focus Area: ${focusArea}
- Tone: ${tone}
- Length: 800-1200 characters
- Include relevant emojis and hashtags
- Maintain QED's authoritative voice in fintech

Content should demonstrate:
1. Deep fintech expertise and market insights
2. Investment perspective and value creation
3. Industry thought leadership
4. Global market awareness
5. Support for portfolio companies when relevant

Notable Portfolio Companies: ${this.qedProfile.portfolio.notable_investments.join(', ')}

Investment Thesis Focus Areas:
${this.qedProfile.investment_thesis.map(thesis => `- ${thesis}`).join('\n')}

Generate a compelling LinkedIn post that showcases QED's expertise and provides value to the fintech community.

The post should be engaging, informative, and aligned with QED's position as a leading fintech investor.
`;
  }

  // Generate content using OpenAI
  async generateContentWithAI(prompt) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a content strategist for QED Investors, specializing in fintech venture capital content that engages industry professionals, entrepreneurs, and investors."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  }

  // Calculate engagement score based on content analysis
  calculateEngagementScore(content) {
    let score = 5.0; // Base score

    // Length optimization
    const charCount = content.length;
    if (charCount >= 800 && charCount <= 1200) score += 1.0;
    else if (charCount >= 600 && charCount <= 1400) score += 0.5;

    // Emoji usage
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
    if (emojiCount >= 2 && emojiCount <= 5) score += 0.5;

    // Question or engagement hook
    if (content.includes('?') || content.includes('What do you think') || content.includes('Thoughts?')) {
      score += 0.5;
    }

    // Investment/fintech keywords
    const keywords = ['investment', 'fintech', 'funding', 'innovation', 'portfolio', 'growth', 'market', 'digital', 'financial'];
    const keywordCount = keywords.filter(keyword => 
      content.toLowerCase().includes(keyword)
    ).length;
    score += Math.min(keywordCount * 0.2, 1.0);

    // Call to action
    if (content.includes('Learn more') || content.includes('Read more') || content.includes('Connect')) {
      score += 0.3;
    }

    return Math.min(score, 10.0);
  }

  // Generate relevant hashtags
  generateRelevantHashtags(theme, focusArea) {
    const baseHashtags = ['#QEDInvestors', '#Fintech', '#VentureCapital', '#Investment'];
    
    const themeHashtags = {
      'Fintech innovation trends': ['#FintechInnovation', '#DigitalTransformation', '#TechTrends'],
      'Investment insights and market analysis': ['#MarketAnalysis', '#Investment', '#VCInsights'],
      'Portfolio company achievements': ['#Portfolio', '#Growth', '#Success'],
      'Financial inclusion impact': ['#FinancialInclusion', '#Impact', '#Access'],
      'Emerging market opportunities': ['#EmergingMarkets', '#GlobalFintech', '#Growth'],
      'Regulatory developments in fintech': ['#Regulation', '#Compliance', '#FintechRegulation'],
      'Partnership announcements': ['#Partnership', '#Collaboration', '#Growth'],
      'Industry thought leadership': ['#ThoughtLeadership', '#Industry', '#Insights']
    };

    const focusHashtags = {
      'Digital banking': ['#DigitalBanking', '#Neobank', '#Banking'],
      'Payment infrastructure': ['#Payments', '#PaymentTech', '#Infrastructure'],
      'Lending platforms': ['#Lending', '#Credit', '#LendingTech'],
      'Insurance technology': ['#InsurTech', '#Insurance', '#Technology'],
      'Wealth management': ['#WealthTech', '#Investment', '#WealthManagement'],
      'B2B financial software': ['#B2BFintech', '#Enterprise', '#Software'],
      'Cryptocurrency and blockchain': ['#Crypto', '#Blockchain', '#DeFi'],
      'Embedded finance': ['#EmbeddedFinance', '#API', '#Integration']
    };

    const hashtags = [
      ...baseHashtags,
      ...(themeHashtags[theme] || []),
      ...(focusHashtags[focusArea] || [])
    ];

    return [...new Set(hashtags)].slice(0, 8); // Remove duplicates and limit to 8
  }

  // Generate image prompt for visual content
  generateImagePrompt(theme, focusArea) {
    const imagePrompts = {
      'Fintech innovation trends': 'Modern fintech dashboard with growth charts and digital payment icons, professional blue and green color scheme',
      'Investment insights and market analysis': 'Professional investment analysis visualization with global market data and growth metrics',
      'Portfolio company achievements': 'Success celebration visual with upward trending charts and achievement badges',
      'Financial inclusion impact': 'Diverse hands holding mobile phones with financial apps, representing global access',
      'Emerging market opportunities': 'World map highlighting emerging markets with fintech growth indicators',
      'Regulatory developments in fintech': 'Legal documents and technology icons representing fintech compliance',
      'Partnership announcements': 'Handshake with digital overlay representing fintech partnerships',
      'Industry thought leadership': 'Professional speaker at fintech conference with audience engagement'
    };

    const basePrompt = imagePrompts[theme] || 'Professional fintech investment visualization';
    return `${basePrompt}, high quality, modern design, LinkedIn post format, QED Investors branding colors`;
  }

  // Get QED profile information
  getQEDProfile() {
    return this.qedProfile;
  }

  // Generate multiple post options
  async generateMultipleOptions(count = 3, options = {}) {
    console.log(`🎯 Generating ${count} QED post options...`);
    
    const posts = [];
    for (let i = 0; i < count; i++) {
      try {
        const post = await this.generateInvestmentPost({
          ...options,
          theme: 'random', // Ensure variety
          focusArea: 'random'
        });
        posts.push(post);
        
        // Small delay to avoid rate limiting
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Error generating post ${i + 1}:`, error.message);
      }
    }

    return posts;
  }
}

module.exports = QEDInvestmentGenerator;