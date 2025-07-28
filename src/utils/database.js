const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('../../config.js');

class PostDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, '..', 'fintech_pulse.db');
  }

  async initialize() {
    await this.init();
    await this.migrateDatabase();
  }

  async migrateDatabase() {
    return new Promise((resolve, reject) => {
      // Check if actual_engagement_rate column exists
      this.db.get("PRAGMA table_info(posts)", [], (err, rows) => {
        if (err) {
          console.error('Error checking table schema:', err.message);
          reject(err);
          return;
        }

        // Check if actual_engagement_rate column exists
        this.db.all("PRAGMA table_info(posts)", [], (err, columns) => {
          if (err) {
            console.error('Error checking table schema:', err.message);
            reject(err);
            return;
          }

          const hasEngagementRate = columns.some(col => col.name === 'actual_engagement_rate');
          const hasPostType = columns.some(col => col.name === 'post_type');

          if (!hasEngagementRate) {
            console.log('🔄 Adding actual_engagement_rate column to posts table...');
            this.db.run("ALTER TABLE posts ADD COLUMN actual_engagement_rate REAL", (err) => {
              if (err) {
                console.error('Error adding actual_engagement_rate column:', err.message);
                reject(err);
              } else {
                console.log('✅ Added actual_engagement_rate column successfully');
                resolve();
              }
            });
          } else if (!hasPostType) {
            console.log('🔄 Adding post_type column to posts table...');
            this.db.run("ALTER TABLE posts ADD COLUMN post_type TEXT DEFAULT 'fintech'", (err) => {
              if (err) {
                console.error('Error adding post_type column:', err.message);
                reject(err);
              } else {
                console.log('✅ Added post_type column successfully');
                resolve();
              }
            });
          } else {
            resolve();
          }
        });
      });
    });
  }

  async init() {
    // Create database directory if it doesn't exist
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, async (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          try {
            await this.createTables();
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  createTables() {
    return new Promise((resolve, reject) => {
      const createPostsTable = `
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_number INTEGER NOT NULL,
          content TEXT NOT NULL,
          image_prompt TEXT,
          image_path TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          scheduled_time DATETIME,
          posted_at DATETIME,
          post_decision TEXT DEFAULT 'pending',
          time_of_day TEXT,
          day_of_week TEXT,
          word_count INTEGER,
          character_count INTEGER,
          emoji_count INTEGER,
          engagement_score INTEGER,
          estimated_views INTEGER,
          estimated_clicks INTEGER,
          estimated_interactions INTEGER,
          similarity_score REAL,
          has_question BOOLEAN,
          has_call_to_action BOOLEAN,
          has_stats BOOLEAN,
          has_attention_grabber BOOLEAN,
          linkedin_post_id TEXT,
          actual_views INTEGER,
          actual_clicks INTEGER,
          actual_likes INTEGER,
          actual_comments INTEGER,
          actual_shares INTEGER,
          actual_engagement_rate REAL,
          post_type TEXT DEFAULT 'fintech',
          notes TEXT
        )
      `;

      const createAnalyticsTable = `
        CREATE TABLE IF NOT EXISTS analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date DATE,
          total_posts INTEGER,
          total_views INTEGER,
          total_engagement INTEGER,
          avg_engagement_rate REAL,
          best_performing_post_id INTEGER,
          worst_performing_post_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createNewsTable = `
        CREATE TABLE IF NOT EXISTS news_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          url TEXT,
          published_at DATETIME,
          used_in_posts TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.serialize(() => {
        this.db.run(createPostsTable, (err) => {
          if (err) {
            console.error('Error creating posts table:', err.message);
            reject(err);
          }
        });

        this.db.run(createAnalyticsTable, (err) => {
          if (err) {
            console.error('Error creating analytics table:', err.message);
            reject(err);
          }
        });

        this.db.run(createNewsTable, (err) => {
          if (err) {
            console.error('Error creating news table:', err.message);
            reject(err);
          } else {
            console.log('✅ Database tables created successfully');
            resolve();
          }
        });
      });
    });
  }



  // Save a new post
  async savePost(postData) {
    return new Promise((resolve, reject) => {
      const {
        postNumber,
        content,
        imagePrompt,
        imagePath,
        scheduledTime,
        timeOfDay,
        dayOfWeek,
        wordCount,
        characterCount,
        emojiCount,
        engagementScore,
        estimatedViews,
        estimatedClicks,
        estimatedInteractions,
        similarityScore,
        hasQuestion,
        hasCallToAction,
        hasStats,
        hasAttentionGrabber,
        postType,
        notes
      } = postData;

      const sql = `
        INSERT INTO posts (
          post_number, content, image_prompt, image_path, scheduled_time,
          time_of_day, day_of_week, word_count, character_count, emoji_count,
          engagement_score, estimated_views, estimated_clicks, estimated_interactions,
          similarity_score, has_question, has_call_to_action, has_stats,
          has_attention_grabber, post_type, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        postNumber, content, imagePrompt, imagePath, scheduledTime,
        timeOfDay, dayOfWeek, wordCount, characterCount, emojiCount,
        engagementScore, estimatedViews, estimatedClicks, estimatedInteractions,
        similarityScore, hasQuestion, hasCallToAction, hasStats,
        hasAttentionGrabber, postType, notes
      ], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  // Update post after it's been posted
  async updatePostPosted(postId, linkedinPostId, postedAt) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE posts 
        SET post_decision = 'posted', linkedin_post_id = ?, posted_at = ?
        WHERE id = ?
      `;

      this.db.run(sql, [linkedinPostId, postedAt, postId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  // Update post decision
  async updatePostDecision(postId, decision) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE posts SET post_decision = ? WHERE id = ?`;
      this.db.run(sql, [decision, postId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  // Get next post number
  async getNextPostNumber() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT MAX(post_number) as max_number FROM posts`;
      this.db.get(sql, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve((row?.max_number || 0) + 1);
        }
      });
    });
  }

  // Get previous posts for similarity analysis
  async getPreviousPosts(limit = 10) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT content FROM posts 
        WHERE post_decision = 'posted' 
        ORDER BY posted_at DESC 
        LIMIT ?
      `;

      this.db.all(sql, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => row.content));
        }
      });
    });
  }

  // Get post statistics
  async getPostStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_posts,
          COUNT(CASE WHEN post_decision = 'posted' THEN 1 END) as posted_posts,
          COUNT(CASE WHEN post_decision = 'rejected' THEN 1 END) as rejected_posts,
          AVG(engagement_score) as avg_engagement_score,
          AVG(estimated_views) as avg_estimated_views,
          AVG(estimated_clicks) as avg_estimated_clicks,
          AVG(estimated_interactions) as avg_estimated_interactions,
          AVG(actual_views) as avg_actual_views,
          AVG(actual_likes) as avg_actual_likes,
          AVG(actual_comments) as avg_actual_comments,
          AVG(actual_shares) as avg_actual_shares,
          AVG(actual_engagement_rate) as avg_actual_engagement_rate
        FROM posts
      `;

      this.db.get(sql, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get posts with LinkedIn IDs
  async getPostsWithLinkedInIds() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, post_number, content, linkedin_post_id, engagement_score, 
               estimated_views, estimated_clicks, estimated_interactions,
               actual_views, actual_likes, actual_comments, actual_shares, actual_engagement_rate
        FROM posts 
        WHERE linkedin_post_id IS NOT NULL AND post_decision = 'posted'
        ORDER BY created_at DESC
      `;

      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Update post analytics with actual LinkedIn metrics
  async updatePostAnalytics(postId, views, likes, comments, shares, clicks, engagementRate) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE posts 
        SET actual_views = ?, actual_likes = ?, actual_comments = ?, 
            actual_shares = ?, actual_clicks = ?, actual_engagement_rate = ?
        WHERE id = ?
      `;

      this.db.run(sql, [views, likes, comments, shares, clicks, engagementRate, postId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Get recent posts
  async getRecentPosts(limit = 5) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM posts 
        ORDER BY created_at DESC 
        LIMIT ?
      `;

      this.db.all(sql, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get post by post number
  async getPostByNumber(postNumber) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM posts 
        WHERE post_number = ?
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      this.db.get(sql, [postNumber], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Save news item
  async saveNewsItem(newsData) {
    return new Promise((resolve, reject) => {
      const { title, description, url, publishedAt } = newsData;

      const sql = `
        INSERT INTO news_items (title, description, url, published_at)
        VALUES (?, ?, ?, ?)
      `;

      this.db.run(sql, [title, description, url, publishedAt], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  // Get recent news items
  async getRecentNewsItems(limit = 10) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM news_items 
        ORDER BY published_at DESC 
        LIMIT ?
      `;

      this.db.all(sql, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Generate analytics report
  async generateAnalyticsReport() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_posts,
          AVG(engagement_score) as avg_engagement_score,
          AVG(estimated_views) as avg_estimated_views,
          AVG(estimated_clicks) as avg_estimated_clicks,
          AVG(estimated_interactions) as avg_estimated_interactions
        FROM posts 
        WHERE created_at >= date('now', '-30 days')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;

      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Close database connection
  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed');
      }
    });
  }
}

module.exports = PostDatabase; 