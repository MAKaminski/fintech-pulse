const express = require('express');
const path = require('path');
const fs = require('fs');

class SimpleWebUI {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // Main dashboard
    this.app.get('/', (req, res) => {
      res.send(this.getDashboardHTML());
    });

    // Test endpoint
    this.app.get('/test', (req, res) => {
      res.json({ message: 'Web UI is working!' });
    });
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
        .card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .btn { padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; margin: 5px; }
        .btn:hover { background: #5a6fd8; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 FintechPulse Dashboard</h1>
            <p>Advanced LinkedIn posting agent for fintech executives</p>
        </div>

        <div class="grid">
            <div class="card">
                <h3>📊 Quick Stats</h3>
                <p>Total Posts: <span id="totalPosts">Loading...</span></p>
                <p>Posted: <span id="postedPosts">Loading...</span></p>
                <p>Status: <span style="color: #28a745;">Active</span></p>
            </div>

            <div class="card">
                <h3>🚀 Quick Actions</h3>
                <button class="btn" onclick="testConnection()">Test Connection</button>
                <button class="btn" onclick="generatePreview()">Generate Preview</button>
                <button class="btn" onclick="showConfig()">Configure Settings</button>
            </div>

            <div class="card">
                <h3>📅 Next Posts</h3>
                <p>Morning Post: 8:30 AM EST</p>
                <p>Evening Post: 4:00 PM EST</p>
                <p>Next Scheduled: <span id="nextPost">Calculating...</span></p>
            </div>
        </div>

        <div class="card">
            <h3>⚙️ Configuration</h3>
            <p>Use the command line for now:</p>
            <ul>
                <li><code>npm run enhanced-preview</code> - Generate and preview posts</li>
                <li><code>npm run view-images</code> - View generated images</li>
                <li><code>npm run analytics</code> - View performance stats</li>
                <li><code>npm start</code> - Start the scheduler</li>
            </ul>
        </div>

        <div class="card">
            <h3>📝 Recent Activity</h3>
            <div id="recentActivity">
                <p>Loading recent activity...</p>
            </div>
        </div>
    </div>

    <script>
        function testConnection() {
            fetch('/test')
                .then(response => response.json())
                .then(data => {
                    alert('Web UI is working! ' + data.message);
                })
                .catch(error => {
                    alert('Error: ' + error.message);
                });
        }

        function generatePreview() {
            alert('Use: npm run enhanced-preview');
        }

        function showConfig() {
            alert('Use: npm run setup');
        }

        // Update next post time
        function updateNextPost() {
            const now = new Date();
            const morning = new Date(now);
            morning.setHours(8, 30, 0, 0);
            
            const evening = new Date(now);
            evening.setHours(16, 0, 0, 0);
            
            let nextPost;
            if (now < morning) {
                nextPost = morning;
            } else if (now < evening) {
                nextPost = evening;
            } else {
                nextPost = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                nextPost.setHours(8, 30, 0, 0);
            }
            
            document.getElementById('nextPost').textContent = nextPost.toLocaleString();
        }

        // Update stats (mock data for now)
        function updateStats() {
            document.getElementById('totalPosts').textContent = '4';
            document.getElementById('postedPosts').textContent = '4';
        }

        // Initialize
        updateNextPost();
        updateStats();
        setInterval(updateNextPost, 60000); // Update every minute
    </script>
</body>
</html>`;
  }

  async start() {
    this.app.listen(this.port, () => {
      console.log(`🌐 FintechPulse Web UI running on http://localhost:${this.port}`);
      console.log(`📊 Dashboard: http://localhost:${this.port}`);
      console.log(`🧪 Test endpoint: http://localhost:${this.port}/test`);
    });
  }
}

module.exports = SimpleWebUI; 