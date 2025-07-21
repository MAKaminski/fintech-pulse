const fs = require('fs');
const path = require('path');
const PostDatabase = require('./database');

class ImageViewer {
  constructor() {
    this.database = new PostDatabase();
    this.imagesDir = path.join(__dirname, '..', 'images');
  }

  async initialize() {
    await this.database.initialize();
  }

  async listImages() {
    console.log('🖼️  FintechPulse Generated Images');
    console.log('==================================\n');

    try {
      // Check if images directory exists
      if (!fs.existsSync(this.imagesDir)) {
        console.log('❌ No images directory found. Generate some posts first!');
        return;
      }

      // Get all image files
      const imageFiles = fs.readdirSync(this.imagesDir)
        .filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file))
        .sort((a, b) => {
          // Sort by creation time (newest first)
          const statA = fs.statSync(path.join(this.imagesDir, a));
          const statB = fs.statSync(path.join(this.imagesDir, b));
          return statB.mtime.getTime() - statA.mtime.getTime();
        });

      if (imageFiles.length === 0) {
        console.log('❌ No images found. Generate some posts first!');
        return;
      }

      console.log(`📁 Found ${imageFiles.length} generated images:\n`);

      // Get posts with images from database
      const postsWithImages = await this.getPostsWithImages();

      imageFiles.forEach((filename, index) => {
        const filePath = path.join(this.imagesDir, filename);
        const stats = fs.statSync(filePath);
        const fileSize = (stats.size / 1024 / 1024).toFixed(2); // MB
        
        console.log(`${index + 1}. 📸 ${filename}`);
        console.log(`   📏 Size: ${fileSize} MB`);
        console.log(`   📅 Created: ${stats.mtime.toLocaleString()}`);
        
        // Find associated post
        const post = postsWithImages.find(p => p.image_path && p.image_path.includes(filename));
        if (post) {
          console.log(`   📝 Post #${post.post_number}: ${post.content.substring(0, 100)}...`);
          console.log(`   🎯 Engagement Score: ${post.engagement_score}/100`);
          console.log(`   📊 Status: ${post.post_decision}`);
        } else {
          console.log(`   📝 No associated post found in database`);
        }
        console.log('');
      });

      console.log('💡 To view an image, open the file path shown above in your file explorer.');
      console.log('💡 Images are stored in the `images/` directory.');

    } catch (error) {
      console.error('❌ Error listing images:', error.message);
    }
  }

  async getPostsWithImages() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT post_number, content, image_path, engagement_score, post_decision, created_at
        FROM posts 
        WHERE image_path IS NOT NULL 
        ORDER BY created_at DESC
      `;

      this.database.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async showImageStats() {
    console.log('\n📊 Image Generation Statistics');
    console.log('==============================\n');

    try {
      const totalPosts = await this.getTotalPosts();
      const postsWithImages = await this.getPostsWithImages();
      const imageFiles = fs.existsSync(this.imagesDir) ? 
        fs.readdirSync(this.imagesDir).filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file)) : [];

      console.log(`📈 Total Posts: ${totalPosts}`);
      console.log(`🖼️  Posts with Images: ${postsWithImages.length}`);
      console.log(`📁 Image Files: ${imageFiles.length}`);
      console.log(`📊 Image Success Rate: ${totalPosts > 0 ? ((postsWithImages.length / totalPosts) * 100).toFixed(1) : 0}%`);

      if (postsWithImages.length > 0) {
        const avgEngagement = postsWithImages.reduce((sum, post) => sum + (post.engagement_score || 0), 0) / postsWithImages.length;
        console.log(`🎯 Average Engagement (with images): ${avgEngagement.toFixed(1)}/100`);
      }

    } catch (error) {
      console.error('❌ Error getting image stats:', error.message);
    }
  }

  async getTotalPosts() {
    return new Promise((resolve, reject) => {
      this.database.db.get('SELECT COUNT(*) as count FROM posts', (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.count : 0);
        }
      });
    });
  }
}

async function main() {
  const viewer = new ImageViewer();
  await viewer.initialize();
  await viewer.listImages();
  await viewer.showImageStats();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ImageViewer; 