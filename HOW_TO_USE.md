# How to Use FintechPulse LinkedIn Agent

A complete guide to setting up and using your automated LinkedIn posting agent.

## 🚀 Quick Start (5 Minutes)

### 1. Initial Setup
```bash
# Clone and install
git clone <your-repo>
cd fintech-pulse
npm install

# Configure environment
npm run setup
```

### 2. LinkedIn Authentication
```bash
npm run auth
# Follow the browser prompts to authorize
```

### 3. Launch Web UI (Optional but Recommended)
```bash
npm run web-ui
# Open http://localhost:3000 in your browser
```

### 4. Test Everything
```bash
npm run test
```

### 5. Start the Agent
```bash
npm start
```

**That's it!** Your agent will now post automatically at 8:30 AM and 4:00 PM EST daily.

## 📋 Daily Operations

### **Automatic Mode** (Recommended)
```bash
npm start
```
- Posts automatically at scheduled times
- Runs continuously in background
- Handles content generation and posting

### **Manual Preview Mode**
```bash
npm run enhanced-preview
```
- Generate and review posts before posting
- See actual generated images
- Edit content if needed
- Choose to post, save, or regenerate

### **Multiple Options Mode**
```bash
npm run enhanced-multiple
```
- Generate 3+ post variations
- Compare engagement scores
- Choose the best option

## 🎯 Key Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm start` | Start automatic posting | Daily operations |
| `npm run enhanced-preview` | Preview before posting | Content review |
| `npm run enhanced-multiple` | Multiple post options | Content selection |
| `npm run web-ui` | Web-based configuration | Visual management |
| `npm run view-images` | View generated images | Image management |
| `npm run analytics` | View performance stats | Performance review |
| `npm run auth` | Re-authenticate LinkedIn | Token expired |
| `npm run test` | Test all connections | Troubleshooting |

## 📊 Content Management

### **Post Generation**
- **AI-Powered**: Uses OpenAI GPT-4 for content
- **News Integration**: Includes recent fintech news
- **LinkedIn Mentions**: 0-2 @mentions for engagement
- **Image Generation**: DALL-E 3 creates custom visuals
- **Engagement Optimization**: Algorithm-optimized content

### **Content Themes**
- Lending infrastructure and credit analytics
- Digital transformation in financial services
- Regulatory technology and compliance
- Payment processing and fintech platforms
- Investment trends in fintech
- Customer experience in financial services

### **Quality Control**
- **Similarity Analysis**: Prevents repetitive content
- **Engagement Scoring**: 0-100 performance rating
- **Time Awareness**: Current year/month references
- **Professional Tone**: Executive-level content

## 🖼️ Image Management

### **View Generated Images**
```bash
npm run view-images
```

### **Image Features**
- **DALL-E 3 Generated**: Professional fintech visuals
- **LinkedIn Integration**: Automatically uploaded and included in posts
- **Local Storage**: Saved in `images/` directory
- **Database Tracking**: Linked to specific posts
- **High Quality**: 1024x1024 resolution
- **Brand Consistent**: Blue/white corporate theme
- **Text-Free Design**: Enhanced prompts avoid fake text/numbers for crisp appearance

### **Image Statistics**
- Success rate tracking
- File size monitoring
- Post association
- Creation timestamps

## 🌐 Web-Based Management

### **Web UI Dashboard**
```bash
npm run web-ui
```

**Access**: Open http://localhost:3000 in your browser

### **Web UI Features**
- **Visual Configuration**: Easy API key management
- **Real-time Preview**: Generate and review posts in browser
- **Analytics Dashboard**: Track performance metrics
- **Image Gallery**: Browse all generated images
- **One-Click Posting**: Approve and post directly from web interface

### **Web UI Sections**
- **Dashboard**: Overview of stats and quick actions
- **Configuration**: Manage API keys, custom prompts, settings
- **Preview**: Generate and review posts before posting
- **Analytics**: View performance metrics and trends
- **Images**: Browse generated images with metadata

### **Web UI Benefits**
- **No Command Line**: Visual interface for all operations
- **Real-time Updates**: See changes immediately
- **Mobile Friendly**: Access from any device
- **Easy Configuration**: Point-and-click setup
- **Visual Analytics**: Charts and graphs for performance

## 📈 Analytics & Performance

### **View Analytics Dashboard**
```bash
npm run analytics
```

### **Key Metrics**
- **Engagement Scores**: 0-100 rating per post
- **Estimated Performance**: Views, clicks, interactions
- **Actual Performance**: LinkedIn metrics (when available)
- **Success Rates**: Image generation, posting success
- **Trend Analysis**: 30-day performance reports

### **Database Queries**
```sql
-- View all posts
SELECT * FROM posts ORDER BY created_at DESC;

-- View performance metrics
SELECT post_number, engagement_score, estimated_views, post_decision 
FROM posts 
WHERE post_decision = 'posted';

-- View analytics
SELECT * FROM analytics ORDER BY date DESC;
```

## 🔧 Configuration

### **Environment Variables**
```bash
# Required
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
OPENAI_API_KEY=your_openai_api_key

# Optional
NEWS_API_KEY=your_news_api_key
```

### **Posting Schedule**
- **Morning Post**: 8:30 AM EST
- **Evening Post**: 4:00 PM EST
- **Timezone**: America/New_York

### **Content Settings**
- **Word Count**: 50-150 words (optimal: 100)
- **Character Count**: 300-1300 characters (optimal: 800)
- **Emojis**: 5-12 strategic emojis
- **Mentions**: 0-2 LinkedIn @mentions
- **Hashtags**: 3-5 relevant hashtags

## 🛠️ Troubleshooting

### **Common Issues**

**LinkedIn Authentication Failed**
```bash
npm run auth
```

**Content Generation Failed**
- Check OpenAI API key
- Agent uses fallback content automatically

**Image Generation Failed**
- Check OpenAI API key
- Images are optional, posts work without them

**Database Issues**
- Check file permissions for `fintech_pulse.db`
- Ensure SQLite is properly installed

**Scheduler Not Working**
- Verify timezone settings
- Check system time and timezone

### **Logs & Debugging**
```bash
# View detailed logs
npm start

# Test individual components
npm run test

# Check database status
node src/index.js --status
```

## 🔄 Maintenance

### **Regular Tasks**
1. **Monthly**: Check LinkedIn app permissions
2. **Every 60 days**: Re-authenticate with LinkedIn (`npm run auth`)
3. **Weekly**: Review analytics dashboard
4. **As needed**: Update content themes and statistics

### **Updates**
```bash
# Update dependencies
npm update

# Check for new features
git pull origin main
npm install
```

## 📱 Mobile Access

### **Remote Management**
- Run on cloud server (AWS, DigitalOcean, etc.)
- Access via SSH for management
- Use `screen` or `tmux` for background operation

### **Monitoring**
- Set up alerts for posting failures
- Monitor disk space for images
- Track API usage limits

## 🎯 Best Practices

### **Content Strategy**
- Review posts weekly for quality
- Adjust content themes based on performance
- Monitor engagement trends
- Keep mentions relevant and current

### **Technical Management**
- Regular backups of database
- Monitor API usage and costs
- Keep dependencies updated
- Test new features in preview mode

### **Performance Optimization**
- Use News API for current content
- Monitor image generation success rates
- Track engagement score trends
- Optimize posting times based on analytics

## 🆘 Support

### **Getting Help**
1. Check troubleshooting section
2. Review console logs for errors
3. Test with `npm run test`
4. Use preview mode to debug content
5. Check database for post history

### **Emergency Stop**
```bash
# Stop the agent
Ctrl+C

# Kill all processes
pkill -f "node src/index.js"
```

---

**FintechPulse** - Advanced automated fintech insights for executives 