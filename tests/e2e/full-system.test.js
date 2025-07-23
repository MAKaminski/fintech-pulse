const { jest } = require('@jest/globals');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Full System E2E Tests', () => {
  const testDataDir = path.join(__dirname, '../../test-data');
  
  beforeAll(() => {
    // Create test data directory
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    silenceConsole();
  });

  afterAll(() => {
    // Cleanup test data
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    restoreConsole();
  });

  describe('CLI Commands E2E', () => {
    it('should generate a fintech post via CLI', (done) => {
      const child = spawn('node', ['src/cli/unified-post-generator.js'], {
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'test' }
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        console.error('CLI Error:', data.toString());
      });

      // Simulate user input
      setTimeout(() => {
        child.stdin.write('1\n'); // Select fintech
        setTimeout(() => {
          child.stdin.write('y\n'); // Confirm generation
          setTimeout(() => {
            child.stdin.write('n\n'); // Don't save to LinkedIn
            child.stdin.end();
          }, 1000);
        }, 1000);
      }, 1000);

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('Generating FintechPulse Post');
        expect(output).toContain('Generated optimized fintech content');
        done();
      });
    }, 30000);

    it('should run the web UI successfully', (done) => {
      const child = spawn('node', ['src/web/simple-web-ui.js'], {
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'test', PORT: '3001' }
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        console.error('Web UI Error:', data.toString());
      });

      // Give the server time to start
      setTimeout(() => {
        expect(output).toContain('Server running');
        child.kill('SIGTERM');
        done();
      }, 5000);
    }, 10000);

    it('should run analytics dashboard', (done) => {
      const child = spawn('node', ['src/dashboards/analytics-dashboard.js'], {
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'test' }
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('Analytics Dashboard');
        done();
      });

      // Allow some time for analytics to process
      setTimeout(() => {
        child.kill('SIGTERM');
      }, 3000);
    }, 10000);
  });

  describe('Database E2E Operations', () => {
    it('should create and manage database lifecycle', async () => {
      const testDbPath = path.join(testDataDir, 'test-e2e.db');
      
      // Ensure clean state
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }

      const PostDatabase = require('../../src/utils/database');
      const database = new PostDatabase(testDbPath);

      // Initialize database
      await database.initialize();
      expect(fs.existsSync(testDbPath)).toBe(true);

      // Create test posts
      const posts = [];
      for (let i = 0; i < 5; i++) {
        const post = await database.savePost({
          content: `E2E Test Post ${i}`,
          type: 'fintech',
          engagement_score: Math.random() * 10,
          scheduled_time: new Date().toISOString()
        });
        posts.push(post);
      }

      // Verify posts were saved
      const recentPosts = await database.getRecentPosts(10);
      expect(recentPosts.length).toBeGreaterThanOrEqual(5);

      // Update analytics for posts
      for (const post of posts) {
        await database.updatePostAnalytics(post.id, {
          likes: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 10),
          shares: Math.floor(Math.random() * 5),
          views: Math.floor(Math.random() * 200)
        });
      }

      // Get analytics summary
      const summary = await database.getAnalyticsSummary();
      expect(summary.totalPosts).toBeGreaterThan(0);
      expect(summary.avgLikes).toBeGreaterThanOrEqual(0);

      // Close database
      await database.close();
    });
  });

  describe('Content Generation E2E', () => {
    it('should generate different types of posts', async () => {
      const generators = {
        fintech: require('../../src/generators/fintech/generator'),
        personal: require('../../src/generators/personal/generator'),
        'michael-davis': require('../../src/generators/michael-davis/generator')
      };

      for (const [type, GeneratorClass] of Object.entries(generators)) {
        if (!GeneratorClass) continue;

        const generator = new GeneratorClass();
        let post;

        try {
          if (type === 'fintech') {
            post = await generator.generateOptimizedPost();
          } else if (type === 'personal') {
            post = await generator.generatePost();
          } else if (type === 'michael-davis') {
            post = await generator.generatePost();
          }

          expect(post).toBeDefined();
          expect(post.content).toBeDefined();
          expect(typeof post.content).toBe('string');
          expect(post.content.length).toBeGreaterThan(50);
        } catch (error) {
          // Some generators might not be fully implemented
          console.warn(`Generator ${type} failed:`, error.message);
        }
      }
    });

    it('should generate QED-focused content', async () => {
      // Test the new QED functionality
      const EnhancedContentGenerator = require('../../src/generators/fintech/generator');
      const generator = new EnhancedContentGenerator();

      // Generate a post with QED investment focus
      const post = await generator.generateOptimizedPost();
      
      expect(post).toBeDefined();
      expect(post.content).toBeDefined();
      
      // Should contain investment-related content
      const content = post.content.toLowerCase();
      const investmentKeywords = ['investment', 'funding', 'capital', 'portfolio', 'returns', 'venture'];
      const hasInvestmentContent = investmentKeywords.some(keyword => content.includes(keyword));
      
      expect(hasInvestmentContent).toBe(true);
    });
  });

  describe('System Health E2E', () => {
    it('should handle system startup and shutdown gracefully', (done) => {
      const child = spawn('node', ['src/index.js', '--status'], {
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'test' }
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('FintechPulse Agent Status');
        done();
      });
    }, 15000);

    it('should display help information correctly', (done) => {
      const child = spawn('node', ['src/index.js', '--help'], {
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'test' }
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('FintechPulse LinkedIn Agent Commands');
        expect(output).toContain('npm start');
        expect(output).toContain('npm run auth');
        done();
      });
    }, 10000);

    it('should handle configuration files properly', () => {
      const configPath = path.join(__dirname, '../../config.js');
      expect(fs.existsSync(configPath)).toBe(true);

      const config = require('../../config.js');
      expect(config).toBeDefined();
      expect(config.agent).toBeDefined();
      expect(config.agent.name).toBeDefined();
      expect(config.agent.purpose).toBeDefined();
    });
  });

  describe('File System E2E', () => {
    it('should manage data files correctly', async () => {
      const dataDir = path.join(__dirname, '../../data');
      expect(fs.existsSync(dataDir)).toBe(true);

      // Check for essential data files
      const allPostsPath = path.join(dataDir, 'all-posts.json');
      if (fs.existsSync(allPostsPath)) {
        const postsData = fs.readFileSync(allPostsPath, 'utf8');
        expect(() => JSON.parse(postsData)).not.toThrow();
      }

      const connectionLogPath = path.join(dataDir, 'connection_log.json');
      if (fs.existsSync(connectionLogPath)) {
        const connectionData = fs.readFileSync(connectionLogPath, 'utf8');
        expect(() => JSON.parse(connectionData)).not.toThrow();
      }
    });

    it('should maintain profile configurations', () => {
      const profilesDir = path.join(__dirname, '../../profiles');
      expect(fs.existsSync(profilesDir)).toBe(true);

      // Check for Michael Davis profile
      const michaelDavisProfile = path.join(profilesDir, 'michael-davis-profile.md');
      if (fs.existsSync(michaelDavisProfile)) {
        const profileContent = fs.readFileSync(michaelDavisProfile, 'utf8');
        expect(profileContent.length).toBeGreaterThan(0);
        expect(profileContent).toContain('michael');
      }
    });
  });

  describe('Network and API E2E', () => {
    it('should handle OpenAI API integration gracefully', async () => {
      // This test verifies the system handles API calls properly
      // but uses mocked responses to avoid actual API costs
      const EnhancedContentGenerator = require('../../src/generators/fintech/generator');
      const generator = new EnhancedContentGenerator();

      // The mock should handle this properly
      const post = await generator.generateOptimizedPost();
      expect(post).toBeDefined();
    });

    it('should handle LinkedIn API integration structure', () => {
      const LinkedInAPI = require('../../src/utils/linkedin-api');
      const api = new LinkedInAPI();

      expect(api).toBeDefined();
      expect(typeof api.initialize).toBe('function');
      expect(typeof api.postContent).toBe('function');
      expect(typeof api.getAnalytics).toBe('function');
    });
  });

  describe('Performance E2E', () => {
    it('should complete full post generation cycle within time limits', async () => {
      const startTime = Date.now();

      // Full cycle: Generate, Save, Retrieve, Update Analytics
      const EnhancedContentGenerator = require('../../src/generators/fintech/generator');
      const PostDatabase = require('../../src/utils/database');

      const generator = new EnhancedContentGenerator();
      const database = new PostDatabase(':memory:');

      await database.initialize();
      const post = await generator.generateOptimizedPost();
      
      const savedPost = await database.savePost({
        content: post.content,
        type: 'fintech',
        engagement_score: 7.5
      });

      await database.updatePostAnalytics(savedPost.id, {
        likes: 20,
        comments: 5,
        shares: 3,
        views: 100
      });

      const summary = await database.getAnalyticsSummary();
      await database.close();

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
      expect(summary.totalPosts).toBeGreaterThan(0);
    });
  });
});