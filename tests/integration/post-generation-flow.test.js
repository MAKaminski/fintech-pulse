const request = require('supertest');

// Mock external dependencies but test actual integration

const UnifiedPostGenerator = require('../../src/cli/unified-post-generator');
const PostDatabase = require('../../src/utils/database');
const EnhancedContentGenerator = require('../../src/generators/fintech/generator');

describe('Post Generation Integration Flow', () => {
  let generator;
  let database;

  beforeEach(async () => {
    generator = new UnifiedPostGenerator();
    database = new PostDatabase(':memory:'); // Use in-memory database for tests
    await database.initialize();
    silenceConsole();
  });

  afterEach(async () => {
    await database.close();
    restoreConsole();
  });

  describe('End-to-End Post Generation', () => {
    it('should generate and save a fintech post successfully', async () => {
      // Mock the readline interface to simulate user input
      const mockRl = {
        question: jest.fn(),
        close: jest.fn()
      };

      // Simulate user selecting fintech post type
      mockRl.question
        .mockImplementationOnce((prompt, callback) => callback('1'))
        .mockImplementationOnce((prompt, callback) => callback('y'))
        .mockImplementationOnce((prompt, callback) => callback('n'));

      generator.rl = mockRl;

      // Generate post
      const contentGenerator = new EnhancedContentGenerator();
      const post = await contentGenerator.generateOptimizedPost();

      // Verify post structure
      expect(post).toBeDefined();
      expect(post.content).toBeDefined();
      expect(post.metadata).toBeDefined();
      expect(typeof post.content).toBe('string');
      expect(post.content.length).toBeGreaterThan(0);

      // Save to database
      const savedPost = await database.savePost({
        content: post.content,
        type: 'fintech',
        engagement_score: post.metadata?.engagement_score || 5.0,
        metadata: JSON.stringify(post.metadata)
      });

      expect(savedPost.id).toBeDefined();
      expect(savedPost.content).toBe(post.content);
    });

    it('should handle the complete post lifecycle', async () => {
      // 1. Generate post
      const contentGenerator = new EnhancedContentGenerator();
      const post = await contentGenerator.generateOptimizedPost();

      // 2. Save post
      const savedPost = await database.savePost({
        content: post.content,
        type: 'fintech',
        engagement_score: 7.5,
        scheduled_time: new Date().toISOString()
      });

      // 3. Retrieve recent posts
      const recentPosts = await database.getRecentPosts(1);
      expect(recentPosts).toHaveLength(1);
      expect(recentPosts[0].id).toBe(savedPost.id);

      // 4. Update analytics
      const analytics = {
        likes: 15,
        comments: 3,
        shares: 2,
        views: 85
      };

      const updateResult = await database.updatePostAnalytics(savedPost.id, analytics);
      expect(updateResult).toBe(true);

      // 5. Get analytics summary
      const summary = await database.getAnalyticsSummary();
      expect(summary.totalPosts).toBeGreaterThan(0);
      expect(summary.avgLikes).toBeGreaterThanOrEqual(0);
    });

    it('should validate content quality standards', async () => {
      const contentGenerator = new EnhancedContentGenerator();
      const post = await contentGenerator.generateOptimizedPost();

      // Check LinkedIn optimization standards
      const optimization = contentGenerator.getLinkedInOptimization();
      const wordCount = post.content.split(' ').length;
      const charCount = post.content.length;

      // Content should meet quality standards
      expect(wordCount).toBeGreaterThanOrEqual(optimization.idealWordCount.min);
      expect(wordCount).toBeLessThanOrEqual(optimization.idealWordCount.max);
      expect(charCount).toBeGreaterThanOrEqual(optimization.idealCharCount.min);
      expect(charCount).toBeLessThanOrEqual(optimization.idealCharCount.max);

      // Should contain engaging elements
      const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(post.content);
      expect(hasEmoji).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database connection failures gracefully', async () => {
      const invalidDatabase = new PostDatabase('/invalid/path/database.db');
      
      await expect(invalidDatabase.initialize()).rejects.toThrow();
    });

    it('should handle API rate limiting', async () => {
      // Mock OpenAI API to simulate rate limiting
      const contentGenerator = new EnhancedContentGenerator();
      contentGenerator.openai.chat.completions.create = jest.fn()
        .mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(contentGenerator.generateOptimizedPost())
        .rejects.toThrow('Rate limit exceeded');
    });

    it('should validate post data before saving', async () => {
      const invalidPostData = {
        content: '', // Empty content
        type: 'invalid-type', // Invalid type
        engagement_score: 15 // Out of range
      };

      await expect(database.savePost(invalidPostData)).rejects.toThrow();
    });
  });

  describe('Performance Integration', () => {
    it('should generate posts within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const contentGenerator = new EnhancedContentGenerator();
      await contentGenerator.generateOptimizedPost();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 30 seconds
      expect(duration).toBeLessThan(30000);
    });

    it('should handle multiple concurrent generations', async () => {
      const contentGenerator = new EnhancedContentGenerator();
      
      const promises = Array(3).fill().map(() => 
        contentGenerator.generateOptimizedPost()
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach(post => {
        expect(post.content).toBeDefined();
        expect(post.content.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Consistency Integration', () => {
    it('should maintain data integrity across operations', async () => {
      // Create multiple posts
      const posts = [];
      for (let i = 0; i < 3; i++) {
        const post = await database.savePost({
          content: `Test post ${i}`,
          type: 'fintech',
          engagement_score: 5.0 + i
        });
        posts.push(post);
      }

      // Verify all posts were saved
      const recentPosts = await database.getRecentPosts(10);
      expect(recentPosts.length).toBeGreaterThanOrEqual(3);

      // Update analytics for each post
      for (const post of posts) {
        const updateResult = await database.updatePostAnalytics(post.id, {
          likes: 10,
          comments: 2,
          shares: 1,
          views: 50
        });
        expect(updateResult).toBe(true);
      }

      // Verify analytics summary reflects all updates
      const summary = await database.getAnalyticsSummary();
      expect(summary.totalPosts).toBeGreaterThanOrEqual(3);
      expect(summary.avgLikes).toBeGreaterThan(0);
    });

    it('should handle transaction rollbacks properly', async () => {
      const initialPostCount = await database.getRecentPosts(100);
      
      try {
        // Attempt to save invalid data that should fail
        await database.savePost({
          content: null, // Invalid content
          type: 'fintech'
        });
      } catch (error) {
        // Expected to fail
      }

      // Verify database state unchanged
      const finalPostCount = await database.getRecentPosts(100);
      expect(finalPostCount.length).toBe(initialPostCount.length);
    });
  });
});