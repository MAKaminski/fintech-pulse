const express = require('express');
const path = require('path');
const fs = require('fs');
const PostDatabase = require('../utils/database');
const EnhancedContentGenerator = require('../generators/fintech/generator');

class WebUI {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.database = new PostDatabase();
    this.contentGenerator = new EnhancedContentGenerator();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  setupRoutes() {
    // Main dashboard
    this.app.get('/', (req, res) => {
      res.send(this.getDashboardHTML());
    });

    // Save configuration
    this.app.post('/save-config', async (req, res) => {
      try {
        await this.saveConfiguration(req.body);
        res.json({ success: true, message: 'Configuration saved successfully!' });
      } catch (error) {
        res.json({ success: false, message: error.message });
      }
    });

    // Generate preview
    this.app.post('/generate-preview', async (req, res) => {
      try {
        const preview = await this.generatePreview(req.body);
        res.json({ success: true, data: preview });
      } catch (error) {
        res.json({ success: false, message: error.message });
      }
    });

    // API endpoints
    this.app.get('/api/stats', async (req, res) => {
      try {
        const stats = await this.database.getPostStats();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/recent-posts', async (req, res) => {
      try {
        const posts = await this.database.getRecentPosts(10);
        res.json(posts);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  async saveConfiguration(configData) {
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const updates = {
      'LINKEDIN_CLIENT_ID': configData.linkedinClientId,
      'LINKEDIN_CLIENT_SECRET': configData.linkedinClientSecret,
      'OPENAI_API_KEY': configData.openaiApiKey,
      'NEWS_API_KEY': configData.newsApiKey,
      'CUSTOM_POST_PROMPT': configData.customPostPrompt
    };

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        const regex = new RegExp(`^${key}=.*`, 'm');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
      }
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n');
  }

  async generatePreview(configData) {
    if (configData.customPostPrompt) {
      this.contentGenerator.customPrompt = configData.customPostPrompt;
    }

    const postContent = await this.contentGenerator.generateOptimizedPost();
    const imageResult = await this.contentGenerator.generateImage(postContent);
    const engagementMetrics = this.contentGenerator.calculateEngagementMetrics(postContent);

    return {
      content: postContent,
      image: imageResult,
      metrics: engagementMetrics
    };
  }

  getDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FintechPulse Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .nav { display: flex; gap: 15px; margin-bottom: 30px; }
        .nav a { padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; transition: background 0.3s; }
        .nav a:hover { background: #5a6fd8; }
        .nav a.active { background: #4a5fc7; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .card h3 { color: #333; margin-bottom: 15px; font-size: 1.3em; }
        .btn { padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; transition: background 0.3s; }
        .btn:hover { background: #5a6fd8; }
        .section { display: none; }
        .section.active { display: block; }
        input, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 FintechPulse Dashboard</h1>
            <p>Advanced LinkedIn posting agent for fintech executives</p>
        </div>

        <div class="nav">
            <a href="#" class="active" onclick="showSection('dashboard')">Dashboard</a>
            <a href="#" onclick="showSection('config')">Configuration</a>
            <a href="#" onclick="showSection('preview')">Preview</a>
        </div>

        <div id="dashboard" class="section active">
            <div class="grid">
                <div class="card">
                    <h3>📊 Quick Stats</h3>
                    <div id="quickStats">Loading...</div>
                </div>
                <div class="card">
                    <h3>🚀 Quick Actions</h3>
                    <button class="btn" onclick="generatePreview()">Generate Preview</button>
                    <button class="btn" onclick="showSection('config')">Configure Settings</button>
                </div>
            </div>
        </div>

        <div id="config" class="section">
            <div class="card">
                <h3>⚙️ Configuration</h3>
                <form id="configForm">
                    <label>LinkedIn Client ID</label>
                    <input type="text" name="linkedinClientId">
                    
                    <label>LinkedIn Client Secret</label>
                    <input type="password" name="linkedinClientSecret">
                    
                    <label>OpenAI API Key</label>
                    <input type="password" name="openaiApiKey">
                    
                    <label>News API Key (Optional)</label>
                    <input type="password" name="newsApiKey">
                    
                    <label>Custom Post Prompt (Optional)</label>
                    <textarea name="customPostPrompt" rows="4" placeholder="Custom instructions for post generation..."></textarea>
                    
                    <button type="submit" class="btn">Save Configuration</button>
                </form>
            </div>
        </div>

        <div id="preview" class="section">
            <div class="card">
                <h3>👀 Post Preview</h3>
                <button class="btn" onclick="generatePreview()">Generate New Preview</button>
                <div id="previewContent">Click "Generate New Preview" to create a post</div>
            </div>
        </div>
    </div>

    <script>
        function showSection(sectionId) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active'));
            event.target.classList.add('active');
        }

        async function generatePreview() {
            const previewContent = document.getElementById('previewContent');
            previewContent.innerHTML = 'Generating preview...';

            try {
                const response = await fetch('/generate-preview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                
                const result = await response.json();
                
                if (result.success) {
                    const imageHtml = result.data.image.success 
                        ? '<h4>🖼️ Generated Image</h4><div>File: ' + result.data.image.filename + '</div>'
                        : '<div style="color: red;">Image generation failed: ' + result.data.image.error + '</div>';
                    
                    previewContent.innerHTML = 
                        '<div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 15px 0;">' +
                        '<h4>📝 Generated Content</h4>' +
                        '<pre style="white-space: pre-wrap;">' + result.data.content + '</pre>' +
                        imageHtml +
                        '<h4>📊 Engagement Score: ' + result.data.metrics.engagementScore + '/100</h4>' +
                        '</div>';
                } else {
                    previewContent.innerHTML = 'Error: ' + result.message;
                }
            } catch (error) {
                previewContent.innerHTML = 'Error: ' + error.message;
            }
        }

        document.getElementById('configForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const configData = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch('/save-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(configData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Configuration saved successfully!');
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    </script>
</body>
</html>`;
  }

  async start() {
    await this.database.initialize();
    
    this.app.listen(this.port, () => {
      console.log(`🌐 FintechPulse Web UI running on http://localhost:${this.port}`);
    });
  }
}

module.exports = WebUI; 