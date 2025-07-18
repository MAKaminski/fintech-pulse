const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'images')));

// Backend endpoints
app.post('/api/generate-preview', (req, res) => {
  exec('npm run enhanced-preview', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      res.json({ success: false, message: error.message });
      return;
    }
    res.json({ success: true, message: 'Preview generated successfully!', output: stdout });
  });
});

app.post('/api/view-images', (req, res) => {
  exec('npm run view-images', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      res.json({ success: false, message: error.message });
      return;
    }
    res.json({ success: true, message: 'Images viewed successfully!', output: stdout });
  });
});

app.post('/api/view-analytics', (req, res) => {
  exec('npm run analytics', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      res.json({ success: false, message: error.message });
      return;
    }
    res.json({ success: true, message: 'Analytics viewed successfully!', output: stdout });
  });
});

app.get('/api/images', (req, res) => {
  const imagesDir = path.join(__dirname, 'images');
  if (!fs.existsSync(imagesDir)) {
    res.json({ images: [] });
    return;
  }
  
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      res.json({ images: [] });
      return;
    }
    
    const imageFiles = files.filter(file => 
      file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    ).map(file => ({
      name: file,
      url: `/images/${file}`,
      path: path.join(imagesDir, file)
    }));
    
    res.json({ images: imageFiles });
  });
});

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>FintechPulse Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .btn { padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        .btn:hover { background: #5a6fd8; }
        .btn:disabled { background: #ccc; cursor: not-allowed; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 10px 0; }
        .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); }
        .modal-content { background-color: white; margin: 5% auto; padding: 20px; border-radius: 10px; width: 80%; max-width: 600px; max-height: 80%; overflow-y: auto; }
        .close { color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer; }
        .close:hover { color: #000; }
        .image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
        .image-item { text-align: center; }
        .image-item img { max-width: 100%; height: auto; border-radius: 5px; }
        .loading { display: none; color: #667eea; font-weight: bold; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 FintechPulse Dashboard</h1>
            <p>Advanced LinkedIn posting agent for fintech executives</p>
        </div>
        
        <div class="card">
            <h3>📊 Quick Stats</h3>
            <p>✅ System Status: Active</p>
            <p>📝 Total Posts: 4</p>
            <p>🖼️ Images Generated: 4</p>
        </div>
        
        <div class="card">
            <h3>🚀 Quick Actions</h3>
            <button class="btn" onclick="generatePreview()">Generate Preview</button>
            <button class="btn" onclick="viewImages()">View Images</button>
            <button class="btn" onclick="viewAnalytics()">View Analytics</button>
            <div id="loading" class="loading">Processing...</div>
        </div>
        
        <div class="card">
            <h3>📅 Posting Schedule</h3>
            <p>🌅 Morning Post: 8:30 AM EST</p>
            <p>🌆 Evening Post: 4:00 PM EST</p>
            <p>⏰ Next Post: <span id="nextPost">Calculating...</span></p>
        </div>
        
        <div class="card">
            <h3>⚙️ Configuration</h3>
            <p>Use these commands in your terminal:</p>
            <ul>
                <li><code>npm run enhanced-preview</code> - Generate and preview posts</li>
                <li><code>npm run view-images</code> - View generated images</li>
                <li><code>npm run analytics</code> - View performance stats</li>
                <li><code>npm start</code> - Start the scheduler</li>
                <li><code>npm run setup</code> - Configure API keys</li>
            </ul>
        </div>
        
        <div class="card">
            <h3>🎉 Recent Success</h3>
            <p>✅ Image upload to LinkedIn is now working!</p>
            <p>✅ Posts include beautiful DALL-E generated images</p>
            <p>✅ Enhanced prompts avoid fake text/numbers</p>
            <p>✅ Web UI provides easy access to all features</p>
        </div>
    </div>

    <!-- Modal for displaying results -->
    <div id="resultModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2 id="modalTitle">Result</h2>
            <div id="modalContent"></div>
        </div>
    </div>
    
    <script>
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

        function showLoading() {
            document.getElementById('loading').style.display = 'block';
        }

        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
        }

        function showModal(title, content) {
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalContent').innerHTML = content;
            document.getElementById('resultModal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('resultModal').style.display = 'none';
        }

        async function generatePreview() {
            showLoading();
            try {
                const response = await fetch('/api/generate-preview', { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    showModal('Preview Generated', 
                        '<div class="success">✅ ' + result.message + '</div>' +
                        '<pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap;">' + 
                        (result.output || 'Preview generated successfully!') + '</pre>'
                    );
                } else {
                    showModal('Error', '<div class="error">❌ ' + result.message + '</div>');
                }
            } catch (error) {
                showModal('Error', '<div class="error">❌ ' + error.message + '</div>');
            } finally {
                hideLoading();
            }
        }

        async function viewImages() {
            showLoading();
            try {
                const response = await fetch('/api/images');
                const result = await response.json();
                
                if (result.images && result.images.length > 0) {
                    let imageHtml = '<div class="image-grid">';
                    result.images.forEach(image => {
                        imageHtml += 
                            '<div class="image-item">' +
                            '<img src="' + image.url + '" alt="' + image.name + '" onclick="window.open(\'' + image.url + '\', \'_blank\')">' +
                            '<p>' + image.name + '</p>' +
                            '</div>';
                    });
                    imageHtml += '</div>';
                    showModal('Generated Images', imageHtml);
                } else {
                    showModal('No Images', '<div class="error">No images found. Generate a preview first!</div>');
                }
            } catch (error) {
                showModal('Error', '<div class="error">❌ ' + error.message + '</div>');
            } finally {
                hideLoading();
            }
        }

        async function viewAnalytics() {
            showLoading();
            try {
                const response = await fetch('/api/view-analytics', { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    showModal('Analytics', 
                        '<div class="success">✅ ' + result.message + '</div>' +
                        '<pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap;">' + 
                        (result.output || 'Analytics data retrieved successfully!') + '</pre>'
                    );
                } else {
                    showModal('Error', '<div class="error">❌ ' + result.message + '</div>');
                }
            } catch (error) {
                showModal('Error', '<div class="error">❌ ' + error.message + '</div>');
            } finally {
                hideLoading();
            }
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('resultModal');
            if (event.target === modal) {
                closeModal();
            }
        }
        
        updateNextPost();
        setInterval(updateNextPost, 60000);
    </script>
</body>
</html>
  `);
});

app.listen(port, () => {
  console.log(`🌐 FintechPulse Web UI running on http://localhost:${port}`);
  console.log(`📊 Open your browser and go to: http://localhost:${port}`);
}); 