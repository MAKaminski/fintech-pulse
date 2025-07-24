// Import the class directly without mocks for unit testing
const EnhancedContentGenerator = require('../../../src/generators/fintech/generator');

describe('EnhancedContentGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new EnhancedContentGenerator();
    silenceConsole();
  });

  afterEach(() => {
    restoreConsole();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(generator).toBeInstanceOf(EnhancedContentGenerator);
      expect(generator.openai).toBeDefined();
    });

    it('should load optimization configuration', () => {
      const optimization = generator.getLinkedInOptimization();
      expect(optimization).toBeDefined();
      expect(optimization.idealWordCount).toBeDefined();
      expect(optimization.idealCharCount).toBeDefined();
      expect(optimization.attentionGrabbers).toBeInstanceOf(Array);
      expect(optimization.highEngagementEmojis).toBeInstanceOf(Array);
      expect(optimization.fintechEmojis).toBeInstanceOf(Array);
    });
  });

  describe('getLinkedInOptimization', () => {
    it('should return proper word count constraints', () => {
      const optimization = generator.getLinkedInOptimization();
      expect(optimization.idealWordCount.min).toBe(50);
      expect(optimization.idealWordCount.max).toBe(150);
      expect(optimization.idealWordCount.optimal).toBe(100);
    });

    it('should return proper character count constraints', () => {
      const optimization = generator.getLinkedInOptimization();
      expect(optimization.idealCharCount.min).toBe(300);
      expect(optimization.idealCharCount.max).toBe(1300);
      expect(optimization.idealCharCount.optimal).toBe(800);
    });

    it('should include fintech-specific emojis', () => {
      const optimization = generator.getLinkedInOptimization();
      expect(optimization.fintechEmojis).toContain('💳');
      expect(optimization.fintechEmojis).toContain('🏦');
      expect(optimization.fintechEmojis).toContain('📱');
      expect(optimization.fintechEmojis).toContain('🔐');
    });

    it('should include attention-grabbing phrases', () => {
      const optimization = generator.getLinkedInOptimization();
      expect(optimization.attentionGrabbers).toContain('🚨 SHOCKING:');
      expect(optimization.attentionGrabbers).toContain('💥 BREAKING:');
      expect(optimization.attentionGrabbers).toContain('🔥 HOT TAKE:');
    });
  });

  describe('loadOptimizationConfig', () => {
    it('should handle missing optimization config gracefully', () => {
      const fs = require('fs');
      fs.existsSync.mockReturnValue(false);
      
      const config = generator.loadOptimizationConfig();
      expect(config).toBeNull();
    });

    it('should load existing optimization config', () => {
      const fs = require('fs');
      const mockConfig = { test: 'data' };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));
      
      const config = generator.loadOptimizationConfig();
      expect(config).toEqual(mockConfig);
    });

    it('should handle JSON parse errors gracefully', () => {
      const fs = require('fs');
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid json');
      
      const config = generator.loadOptimizationConfig();
      expect(config).toBeNull();
    });
  });

  describe('generateOptimizedPost', () => {
    it('should generate a post with proper structure', async () => {
      const post = await generator.generateOptimizedPost();
      
      expect(post).toBeDefined();
      expect(typeof post).toBe('object');
      expect(post.content).toBeDefined();
      expect(post.metadata).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      // Mock OpenAI to throw an error
      generator.openai.chat.completions.create.mockRejectedValue(new Error('API Error'));
      
      await expect(generator.generateOptimizedPost()).rejects.toThrow('API Error');
    });
  });

  describe('content validation', () => {
    it('should validate word count constraints', () => {
      const shortContent = 'Too short';
      const longContent = 'This is a very long content that exceeds the maximum word count limit for LinkedIn posts and should be rejected by the validation function because it contains too many words and will not perform well on the platform due to user attention spans being limited and the algorithm favoring shorter more engaging content that gets to the point quickly without unnecessary verbosity or excessive length that might cause users to scroll past without engaging with the post content effectively reducing overall reach and engagement metrics which are crucial for successful social media marketing campaigns and business growth strategies.';
      
      const optimization = generator.getLinkedInOptimization();
      const shortWordCount = shortContent.split(' ').length;
      const longWordCount = longContent.split(' ').length;
      
      expect(shortWordCount).toBeLessThan(optimization.idealWordCount.min);
      expect(longWordCount).toBeGreaterThan(optimization.idealWordCount.max);
    });

    it('should validate character count constraints', () => {
      const optimization = generator.getLinkedInOptimization();
      const shortContent = 'Short';
      const longContent = 'A'.repeat(1400);
      
      expect(shortContent.length).toBeLessThan(optimization.idealCharCount.min);
      expect(longContent.length).toBeGreaterThan(optimization.idealCharCount.max);
    });
  });
});
