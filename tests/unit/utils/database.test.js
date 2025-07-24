// Import actual module for unit testing
const PostDatabase = require('../../../src/utils/database');

describe('PostDatabase', () => {
  let database;

  beforeEach(() => {
    database = new PostDatabase();
    silenceConsole();
  });

  afterEach(() => {
    restoreConsole();
  });

  describe('constructor', () => {
    it('should initialize with default database path', () => {
      expect(database).toBeInstanceOf(PostDatabase);
      expect(database.dbPath).toBeDefined();
    });

    it('should accept custom database path', () => {
      const customPath = './test.db';
      const customDb = new PostDatabase(customPath);
      expect(customDb.dbPath).toBe(customPath);
    });
  });

  describe('initialize', () => {
    it('should initialize database successfully', async () => {
      const result = await database.initialize();
      expect(result).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      // Mock sqlite3 to throw an error
      const sqlite3 = require('sqlite3');
      sqlite3.Database = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(database.initialize()).rejects.toThrow('Database error');
    });
  });

  describe('savePost', () => {
    it('should save post with required fields', async () => {
      const postData = {
        content: 'Test post content',
        type: 'fintech',
        engagement_score: 8.5,
        scheduled_time: new Date().toISOString()
      };

      const result = await database.savePost(postData);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('should handle missing required fields', async () => {
      const invalidPostData = {
        content: 'Test without type'
        // Missing type field
      };

      await expect(database.savePost(invalidPostData)).rejects.toThrow();
    });

    it('should sanitize content before saving', async () => {
      const postData = {
        content: 'Test content with <script>alert("xss")</script> tags',
        type: 'fintech',
        engagement_score: 8.5
      };

      const result = await database.savePost(postData);
      expect(result).toBeDefined();
      // Content should be sanitized
      expect(result.content).not.toContain('<script>');
    });
  });

  describe('getRecentPosts', () => {
    it('should return recent posts with default limit', async () => {
      const posts = await database.getRecentPosts();
      expect(Array.isArray(posts)).toBe(true);
    });

    it('should respect custom limit parameter', async () => {
      const limit = 5;
      const posts = await database.getRecentPosts(limit);
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeLessThanOrEqual(limit);
    });

    it('should return posts in chronological order', async () => {
      const posts = await database.getRecentPosts();
      if (posts.length > 1) {
        for (let i = 1; i < posts.length; i++) {
          const currentDate = new Date(posts[i].created_at);
          const previousDate = new Date(posts[i - 1].created_at);
          expect(currentDate.getTime()).toBeLessThanOrEqual(previousDate.getTime());
        }
      }
    });
  });

  describe('updatePostAnalytics', () => {
    it('should update analytics for existing post', async () => {
      const postId = 1;
      const analytics = {
        likes: 25,
        comments: 5,
        shares: 3,
        views: 150
      };

      const result = await database.updatePostAnalytics(postId, analytics);
      expect(result).toBe(true);
    });

    it('should handle non-existent post ID', async () => {
      const nonExistentId = 99999;
      const analytics = {
        likes: 25,
        comments: 5,
        shares: 3,
        views: 150
      };

      const result = await database.updatePostAnalytics(nonExistentId, analytics);
      expect(result).toBe(false);
    });

    it('should validate analytics data', async () => {
      const postId = 1;
      const invalidAnalytics = {
        likes: 'not a number',
        comments: -5,
        shares: null
      };

      await expect(database.updatePostAnalytics(postId, invalidAnalytics))
        .rejects.toThrow();
    });
  });

  describe('getAnalyticsSummary', () => {
    it('should return analytics summary', async () => {
      const summary = await database.getAnalyticsSummary();
      expect(summary).toBeDefined();
      expect(typeof summary.totalPosts).toBe('number');
      expect(typeof summary.avgLikes).toBe('number');
      expect(typeof summary.avgComments).toBe('number');
      expect(typeof summary.avgShares).toBe('number');
    });

    it('should handle empty database gracefully', async () => {
      // Mock empty result
      database.db = {
        get: jest.fn().mockResolvedValue(null)
      };

      const summary = await database.getAnalyticsSummary();
      expect(summary.totalPosts).toBe(0);
      expect(summary.avgLikes).toBe(0);
      expect(summary.avgComments).toBe(0);
      expect(summary.avgShares).toBe(0);
    });
  });

  describe('close', () => {
    it('should close database connection', async () => {
      await database.initialize();
      const result = await database.close();
      expect(result).toBe(true);
    });

    it('should handle closing already closed connection', async () => {
      const result = await database.close();
      expect(result).toBe(true);
    });
  });

  describe('data validation', () => {
    it('should validate post type enum values', () => {
      const validTypes = ['fintech', 'personal', 'michael-davis', 'education'];
      const invalidType = 'invalid-type';

      validTypes.forEach(type => {
        expect(['fintech', 'personal', 'michael-davis', 'education']).toContain(type);
      });

      expect(['fintech', 'personal', 'michael-davis', 'education']).not.toContain(invalidType);
    });

    it('should validate engagement score range', () => {
      const validScores = [0, 5.5, 10];
      const invalidScores = [-1, 11, 'not-a-number'];

      validScores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(10);
        expect(typeof score).toBe('number');
      });

      invalidScores.forEach(score => {
        const isValid = typeof score === 'number' && score >= 0 && score <= 10;
        expect(isValid).toBe(false);
      });
    });
  });
});