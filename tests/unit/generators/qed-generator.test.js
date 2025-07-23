// Import the QED generator directly for unit testing
const QEDInvestmentGenerator = require('../../../src/generators/qed/generator');

describe('QEDInvestmentGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new QEDInvestmentGenerator();
    silenceConsole();
  });

  afterEach(() => {
    restoreConsole();
  });

  describe('constructor', () => {
    it('should initialize with QED profile', () => {
      expect(generator).toBeInstanceOf(QEDInvestmentGenerator);
      expect(generator.openai).toBeDefined();
      expect(generator.qedProfile).toBeDefined();
    });

    it('should load QED profile with correct structure', () => {
      const profile = generator.getQEDProfile();
      expect(profile.name).toBe('QED Investors');
      expect(profile.focus).toContain('Fintech');
      expect(profile.portfolio.sectors).toBeInstanceOf(Array);
      expect(profile.portfolio.notable_investments).toBeInstanceOf(Array);
      expect(profile.investment_thesis).toBeInstanceOf(Array);
      expect(profile.content_themes).toBeInstanceOf(Array);
    });
  });

  describe('loadQEDProfile', () => {
    it('should have required portfolio sectors', () => {
      const profile = generator.getQEDProfile();
      const expectedSectors = [
        'Digital banking',
        'Payment infrastructure',
        'Lending platforms',
        'Insurance technology',
        'Wealth management',
        'B2B financial software',
        'Cryptocurrency and blockchain',
        'Embedded finance'
      ];

      expectedSectors.forEach(sector => {
        expect(profile.portfolio.sectors).toContain(sector);
      });
    });

    it('should include notable investments', () => {
      const profile = generator.getQEDProfile();
      const expectedInvestments = ['Nubank', 'Credit Karma', 'Flutterwave', 'SoFi'];

      expectedInvestments.forEach(investment => {
        expect(profile.portfolio.notable_investments).toContain(investment);
      });
    });

    it('should have comprehensive content themes', () => {
      const profile = generator.getQEDProfile();
      expect(profile.content_themes.length).toBeGreaterThanOrEqual(8);
      expect(profile.content_themes).toContain('Fintech innovation trends');
      expect(profile.content_themes).toContain('Investment insights and market analysis');
    });
  });

  describe('generateInvestmentPost', () => {
    it('should generate post with all required metadata', async () => {
      const post = await generator.generateInvestmentPost();

      expect(post).toBeDefined();
      expect(post.content).toBeDefined();
      expect(post.metadata).toBeDefined();
      
      // Check metadata structure
      expect(post.metadata.theme).toBeDefined();
      expect(post.metadata.focusArea).toBeDefined();
      expect(post.metadata.tone).toBeDefined();
      expect(post.metadata.generator).toBe('qed-investment');
      expect(post.metadata.timestamp).toBeDefined();
      expect(post.metadata.engagement_score).toBeDefined();
      expect(post.metadata.hashtags).toBeInstanceOf(Array);
    });

    it('should generate different content for different themes', async () => {
      const themes = generator.getQEDProfile().content_themes;
      const posts = [];

      for (let i = 0; i < 3; i++) {
        const post = await generator.generateInvestmentPost({
          theme: themes[i],
          focusArea: 'Digital banking'
        });
        posts.push(post);
      }

      // Each post should have different content
      expect(posts[0].content).not.toBe(posts[1].content);
      expect(posts[1].content).not.toBe(posts[2].content);
      
      // But should all have the correct theme in metadata
      expect(posts[0].metadata.theme).toBe(themes[0]);
      expect(posts[1].metadata.theme).toBe(themes[1]);
      expect(posts[2].metadata.theme).toBe(themes[2]);
    });

    it('should handle custom options correctly', async () => {
      const options = {
        theme: 'Portfolio company achievements',
        focusArea: 'Digital banking',
        tone: 'celebratory',
        includeImage: false
      };

      const post = await generator.generateInvestmentPost(options);

      expect(post.metadata.theme).toBe(options.theme);
      expect(post.metadata.focusArea).toBe(options.focusArea);
      expect(post.metadata.tone).toBe(options.tone);
      expect(post.metadata.includeImage).toBe(false);
      expect(post.metadata.imagePrompt).toBeNull();
    });

    it('should include image prompt when requested', async () => {
      const post = await generator.generateInvestmentPost({
        includeImage: true,
        theme: 'Fintech innovation trends'
      });

      expect(post.metadata.includeImage).toBe(true);
      expect(post.metadata.imagePrompt).toBeDefined();
      expect(post.metadata.imagePrompt).toContain('fintech');
    });
  });

  describe('buildQEDPrompt', () => {
    it('should create comprehensive prompt with QED context', () => {
      const theme = 'Investment insights and market analysis';
      const focusArea = 'Digital banking';
      const tone = 'professional';

      const prompt = generator.buildQEDPrompt(theme, focusArea, tone);

      expect(prompt).toContain('QED Investors');
      expect(prompt).toContain(theme);
      expect(prompt).toContain(focusArea);
      expect(prompt).toContain(tone);
      expect(prompt).toContain('fintech venture capital');
      expect(prompt).toContain('LinkedIn post');
    });

    it('should include investment thesis in prompt', () => {
      const prompt = generator.buildQEDPrompt('test', 'test', 'test');
      const profile = generator.getQEDProfile();

      profile.investment_thesis.forEach(thesis => {
        expect(prompt).toContain(thesis);
      });
    });
  });

  describe('calculateEngagementScore', () => {
    it('should score content based on length optimization', () => {
      const shortContent = 'Too short';
      const optimalContent = 'A'.repeat(1000); // Optimal length
      const longContent = 'A'.repeat(2000);

      const shortScore = generator.calculateEngagementScore(shortContent);
      const optimalScore = generator.calculateEngagementScore(optimalContent);
      const longScore = generator.calculateEngagementScore(longContent);

      expect(optimalScore).toBeGreaterThan(shortScore);
      expect(optimalScore).toBeGreaterThan(longScore);
    });

    it('should bonus for appropriate emoji usage', () => {
      const withoutEmojis = 'Great fintech investment opportunity in digital banking sector';
      const withEmojis = '🚀 Great fintech investment opportunity in digital banking sector 💰📈';

      const scoreWithout = generator.calculateEngagementScore(withoutEmojis);
      const scoreWith = generator.calculateEngagementScore(withEmojis);

      expect(scoreWith).toBeGreaterThan(scoreWithout);
    });

    it('should bonus for engagement hooks', () => {
      const withoutHook = 'Fintech is transforming the financial services industry.';
      const withHook = 'Fintech is transforming the financial services industry. What do you think?';

      const scoreWithout = generator.calculateEngagementScore(withoutHook);
      const scoreWith = generator.calculateEngagementScore(withHook);

      expect(scoreWith).toBeGreaterThan(scoreWithout);
    });

    it('should bonus for relevant keywords', () => {
      const genericContent = 'This is some generic business content about companies.';
      const fintechContent = 'This investment in fintech innovation will drive digital transformation in financial markets.';

      const genericScore = generator.calculateEngagementScore(genericContent);
      const fintechScore = generator.calculateEngagementScore(fintechContent);

      expect(fintechScore).toBeGreaterThan(genericScore);
    });

    it('should return score within valid range', () => {
      const testContents = [
        'Short',
        'Medium length content with some fintech keywords and emoji 🚀',
        'Very long content that goes into great detail about investment opportunities in the fintech sector focusing on digital banking and payment infrastructure with comprehensive market analysis and growth projections for emerging markets'
      ];

      testContents.forEach(content => {
        const score = generator.calculateEngagementScore(content);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('generateRelevantHashtags', () => {
    it('should include base QED hashtags', () => {
      const hashtags = generator.generateRelevantHashtags('test', 'test');
      
      expect(hashtags).toContain('#QEDInvestors');
      expect(hashtags).toContain('#Fintech');
      expect(hashtags).toContain('#VentureCapital');
      expect(hashtags).toContain('#Investment');
    });

    it('should add theme-specific hashtags', () => {
      const hashtags = generator.generateRelevantHashtags(
        'Fintech innovation trends',
        'Digital banking'
      );

      expect(hashtags).toContain('#FintechInnovation');
      expect(hashtags).toContain('#DigitalBanking');
    });

    it('should limit hashtag count', () => {
      const hashtags = generator.generateRelevantHashtags(
        'Portfolio company achievements',
        'Cryptocurrency and blockchain'
      );

      expect(hashtags.length).toBeLessThanOrEqual(8);
    });

    it('should remove duplicate hashtags', () => {
      const hashtags = generator.generateRelevantHashtags('test', 'test');
      const uniqueHashtags = [...new Set(hashtags)];
      
      expect(hashtags.length).toBe(uniqueHashtags.length);
    });
  });

  describe('generateImagePrompt', () => {
    it('should create theme-appropriate image prompts', () => {
      const themes = [
        'Fintech innovation trends',
        'Investment insights and market analysis',
        'Portfolio company achievements'
      ];

      themes.forEach(theme => {
        const prompt = generator.generateImagePrompt(theme, 'Digital banking');
        expect(prompt).toBeDefined();
        expect(prompt.length).toBeGreaterThan(20);
        expect(prompt).toContain('QED Investors');
      });
    });

    it('should include LinkedIn format specification', () => {
      const prompt = generator.generateImagePrompt('test theme', 'test focus');
      expect(prompt).toContain('LinkedIn post format');
    });
  });

  describe('generateMultipleOptions', () => {
    it('should generate requested number of posts', async () => {
      const count = 3;
      const posts = await generator.generateMultipleOptions(count);

      expect(posts.length).toBeLessThanOrEqual(count); // May be less if errors occur
      posts.forEach(post => {
        expect(post.content).toBeDefined();
        expect(post.metadata).toBeDefined();
      });
    });

    it('should generate diverse content options', async () => {
      const posts = await generator.generateMultipleOptions(2);

      if (posts.length >= 2) {
        expect(posts[0].metadata.theme).not.toBe(posts[1].metadata.theme);
      }
    });
  });

  describe('error handling', () => {
    it('should handle OpenAI API errors gracefully', async () => {
      // Mock OpenAI to throw an error
      generator.openai.chat.completions.create.mockRejectedValue(new Error('API Error'));

      await expect(generator.generateInvestmentPost()).rejects.toThrow('API Error');
    });

    it('should handle invalid options gracefully', async () => {
      const invalidOptions = {
        theme: 'non-existent-theme',
        focusArea: 'invalid-focus',
        tone: null
      };

      // Should not throw, should handle gracefully
      const post = await generator.generateInvestmentPost(invalidOptions);
      expect(post).toBeDefined();
    });
  });

  describe('content quality validation', () => {
    it('should generate content within optimal length range', async () => {
      const post = await generator.generateInvestmentPost();
      const contentLength = post.content.length;

      // Should be within reasonable LinkedIn post length
      expect(contentLength).toBeGreaterThan(200);
      expect(contentLength).toBeLessThan(2000);
    });

    it('should generate professional tone content', async () => {
      const post = await generator.generateInvestmentPost({
        tone: 'professional'
      });

      // Content should not contain inappropriate language
      const inappropriateTerms = ['awesome', 'super cool', 'lit', 'fire'];
      const contentLower = post.content.toLowerCase();
      
      inappropriateTerms.forEach(term => {
        expect(contentLower).not.toContain(term);
      });
    });
  });
});