# FintechPulse LinkedIn Agent

> **Project Organization Update (2024):**
> - All guides, profiles, data, and config files are now in their own folders for clarity.
> - The project root is intentionally kept clean for easy navigation and onboarding.
> - See `guides/` for documentation, `profiles/` for writing/persona profiles, `data/` for analytics and tokens, and `config/` for configuration files.

---

## 🗂️ Directory Structure (2024 Refactor)

```
fintech-pulse/
  ├── src/
  │   ├── generators/
  │   │   ├── michael-davis/
  │   │   │   ├── generator.js
  │   │   │   └── cli.js
  │   │   ├── personal/
  │   │   │   └── generator.js
  │   │   ├── fintech/
  │   │   │   ├── generator.js
  │   │   │   ├── adaptive-generator.js
  │   │   │   └── simple-generator.js
  │   ├── scrapers/
  │   │   ├── substack-scraper.js
  │   │   └── scrape-michael-davis.js
  │   ├── utils/
  │   │   ├── database.js
  │   │   ├── linkedin-api.js
  │   │   ├── linkedin-analytics.js
  │   │   ├── auto-optimize.js
  │   │   ├── test-connections.js
  │   │   ├── example-connections.js
  │   │   ├── enhanced-connections.js
  │   │   ├── linkedin-connections.js
  │   │   └── auth.js
  │   ├── dashboards/
  │   │   ├── analytics-dashboard.js
  │   │   └── enhanced-preview.js
  │   ├── cli/
  │   │   ├── unified-post-generator.js
  │   │   ├── analytics-cli.js
  │   │   ├── test-post.js
  │   │   ├── demo-integration.js
  │   │   ├── scheduler.js
  │   │   └── connection-cli.js
  │   ├── web/
  │   │   ├── web-ui.js
  │   │   ├── simple-web-ui.js
  │   │   ├── preview-post.js
  │   │   └── view-images.js
  │   └── index.js
  ├── assets/
  │   └── images/           # All generated images are stored here
  ├── guides/               # All documentation and how-to guides
  ├── profiles/             # All writing and persona profiles
  ├── data/                 # All JSON, DB, and token files
  ├── config/               # All configuration JSON files
  ├── package.json
  ├── README.md
  └── ...
```

- **All generators, CLIs, scrapers, dashboards, and utilities are grouped by type.**
- **All images are now in `assets/images/`.**
- **Guides and profiles are in their own folders for easy access.**
- **All guides, profiles, data, and config files are now in their own folders.**
- **The project root is intentionally kept clean for easy navigation.**
- **See `guides/`, `profiles/`, `data/`, and `config/` for supporting files.**

---

## 🎯 Agent Profile

- **Name**: FintechPulse
- **Purpose**: Promote Fintech & Service Industry Analytics
- **Style**: Analytical, attention-grabbing, professional
- **Audience**: Fintech & PE Executives
- **Content**: Industry insights, statistics, quotes, and actionable insights

---

## 🚀 Quick Start

> **Note:** For documentation, writing style guides, and configuration, see the `guides/`, `profiles/`, and `config/` folders.

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

**Option A: Interactive Setup (Recommended)**
```bash
npm run setup
```

**Option B: Manual Setup**
1. Copy `env.example` to `.env`
2. Edit `.env` with your credentials:
   - LinkedIn Client ID and Secret
   - OpenAI API Key
   - News API Key (optional)

### 3. Set Up LinkedIn Authentication

```bash
npm run auth
```

This will:
- Start a local server on port 8000
- Open LinkedIn authorization URL
- Capture your access token
- Save it to `access_token.txt`

### 4. Test the Setup

```bash
npm run test
```

### 5. Start the Agent

```bash
npm start
```

The agent will now run continuously and post automatically at 8:30 AM and 4:00 PM EST daily.

---

## 📋 Available Commands (2024 Structure)

| Command | Description |
|---------|-------------|
| `npm start` | Start the agent with scheduled posting |
| `npm run setup` | Interactive environment configuration |
| `npm run auth` | Authenticate with LinkedIn |
| `npm run test` | Test content generation and LinkedIn connection |
| `npm run preview` | Basic post preview and editing |
| `npm run enhanced-preview` | Advanced preview with analytics |
| `npm run enhanced-multiple` | Generate multiple optimized options |
| `npm run view-images` | View generated images and stats |
| `npm run web-ui` | Web-based configuration and preview |
| `npm run michael-davis` | Michael Davis-style post generator CLI |
| `npm run md` | Alias for Michael Davis CLI |
| `npm run scrape-md` | Scrape all Michael Davis Substack posts |
| `npm run generate-post` | Unified post generator CLI (choose style) |
| `npm run analytics` | Analytics dashboard |
| `npm run analytics-report` | LinkedIn analytics report |
| `npm run adaptive-preview` | Adaptive content preview |
| `npm run auto-optimize` | Run auto-optimization |
| `npm run demo-integration` | Demo integration CLI |
| `npm run view-images` | View all generated images |
| `npm run connections` | Connection management CLI |
| `npm run example-connections` | Example connections utility |
| `npm run test-connections` | Test LinkedIn connections |

---

## 🆕 Enhanced Features

### 📊 **LinkedIn Optimization**
- **Ideal Word Count**: 50-150 words (optimal: 100)
- **Ideal Character Count**: 300-1300 characters (optimal: 800)
- **Strategic Emoji Usage**: 5-12 emojis for maximum engagement
- **Attention-Grabbing Hooks**: SHOCKING, BREAKING, HOT TAKE, etc.
- **Algorithm-Friendly Content**: Optimized for LinkedIn's feed algorithm

### 🎯 **Engagement Elements**
- **Questions**: Drive comments and interactions
- **Call-to-Actions**: DM, follow, connect, share prompts
- **Statistics**: Data-driven insights for credibility
- **Attention Grabbers**: Controversial statements and hooks
- **LinkedIn Mentions**: 0-2 @mentions of relevant companies/individuals
- **Performance Scoring**: 0-100 engagement score

### 📈 **Performance Metrics**
- **Estimated Views**: Based on engagement score
- **Estimated Clicks**: Projected click-through rates
- **Estimated Interactions**: Likes, comments, shares
- **Real-time Analytics**: Track actual vs. estimated performance

### 🔄 **Content Uniqueness**
- **Similarity Analysis**: Prevents repetitive content
- **Weekly Variation**: Ensures diverse content themes
- **Historical Tracking**: Database of all previous posts

### 📰 **News Integration**
- **Recent Fintech News**: Last 7 days of industry updates
- **NewsAPI Integration**: Real-time news aggregation
- **Fallback News**: Curated content when API unavailable

### 🎨 **Image Generation**
- **DALL-E 3 Integration**: Real AI-generated images for each post
- **LinkedIn Upload**: Images automatically uploaded and included in posts
- **Local Storage**: Images saved to `images/` directory
- **Database Tracking**: Image paths stored in SQLite database
- **Professional Style**: Corporate fintech theme with data visualization
- **Brand Consistency**: Blue/white color scheme, clean design
- **High Quality**: 1024x1024 resolution, photorealistic style
- **Text-Free Design**: Enhanced prompts avoid fake text/numbers for crisp, professional appearance

### 📢 **LinkedIn Mentions**
- **Smart Mention Selection**: 0-2 relevant @mentions per post
- **Fintech Companies**: @Stripe, @Square, @PayPal, @Coinbase, @Robinhood, etc.
- **Industry Leaders**: @PatrickCollison, @JackDorsey, @BrianArmstrong, etc.
- **PE Executives**: @StephenSchwarzman, @HenryKravis, @MarcRowan, etc.
- **Natural Integration**: Mentions woven naturally into content context
- **Engagement Boost**: Mentions drive notifications and interactions

### 💾 **Database Analytics**
- **SQLite Database**: Complete post history and analytics
- **Performance Tracking**: Engagement scores, views, interactions
- **Decision Logging**: Approved, rejected, saved posts
- **Trend Analysis**: 30-day performance reports

---

## 📊 Content Features

### Automatic Content Generation
- Industry statistics and market data
- Relevant fintech quotes from industry leaders
- Analytical insights for executives
- Professional call-to-actions
- Strategic hashtags
- **NEW**: Attention-grabbing hooks and controversy
- **NEW**: Recent news integration
- **NEW**: Engagement-optimized formatting
- **NEW**: LinkedIn mentions (@company/@individual) for interaction
- **NEW**: DALL-E 3 generated images for visual impact

### Content Themes
- Lending infrastructure and credit analytics
- Digital transformation in financial services
- Regulatory technology and compliance
- Payment processing and fintech platforms
- Investment trends in fintech
- Customer experience in financial services
- Risk management and fraud prevention
- Embedded finance and API ecosystems

### Enhanced Fallback Content
If OpenAI is unavailable, the agent uses pre-written templates with:
- Curated industry statistics
- Professional fintech quotes
- Structured analytical content
- Consistent branding
- **NEW**: Optimized engagement elements

---

## 🔧 Technical Details

### Architecture
- **Enhanced Content Generator**: AI-powered and fallback content creation
- **LinkedIn API**: Direct posting via official LinkedIn API
- **Scheduler**: Cron-based scheduling with timezone support
- **Authentication**: OAuth 2.0 flow with token management
- **Database**: SQLite for analytics and post tracking
- **News Integration**: Real-time fintech news aggregation

### Dependencies
- `express`: Web server for OAuth callback
- `axios`: HTTP client for API requests
- `node-cron`: Job scheduling
- `openai`: AI content generation
- `moment-timezone`: Timezone handling
- `sqlite3`: Database for analytics
- `readline`: Interactive CLI interface

### Security
- **Environment Variables**: All sensitive data stored in `.env` file (not committed to git)
- **Access Tokens**: Stored locally in `access_token.txt` (not committed to git)
- **OAuth 2.0**: Secure authentication flow with LinkedIn
- **Database**: SQLite database with local storage only
- **Git Ignore**: Sensitive files automatically excluded from version control
- **No Hardcoded Secrets**: All credentials loaded from environment variables

---

## 🌐 Web-Based Configuration

### Web UI Dashboard
```bash
npm run web-ui
```

**Features:**
- **Visual Dashboard**: Modern web interface at http://localhost:3000
- **Configuration Management**: Easy API key and settings management
- **Real-time Preview**: Generate and preview posts in the browser
- **Analytics View**: Track performance and engagement metrics
- **Image Gallery**: View all generated images with metadata
- **One-Click Posting**: Approve and post directly from the web interface

### Web UI Sections
- **Dashboard**: Overview of stats and quick actions
- **Configuration**: Manage API keys, custom prompts, and settings
- **Preview**: Generate and review posts before posting
- **Analytics**: View performance metrics and trends
- **Images**: Browse generated images and their associated posts

---

## 📈 Enhanced Preview System

### Interactive Post Review
```bash
npm run enhanced-preview
```

**Features:**
- **Complete Preview**: Post content + generated image + analytics
- **Real-time Analysis**: Engagement score, estimated performance
- **Similarity Check**: Prevents repetitive content
- **Performance Rating**: EXCELLENT/GOOD/FAIR/POOR
- **Edit Mode**: Manual content editing with live metrics
- **Multiple Options**: Generate 3+ variations
- **Analytics Dashboard**: View historical performance
- **Image Generation**: DALL-E 3 creates custom visuals for each post

### Post Analysis Output
```
📝 Generated Post:
==================
[Post content with mentions and engagement elements]

🖼️  Generated Image:
==================
📁 File: fintech-pulse-2025-07-18T13-27-53-224Z.png
📍 Path: /path/to/images/fintech-pulse-2025-07-18T13-27-53-224Z.png
🔗 URL: [DALL-E generated image URL]

📊 Post Analysis:
=================
Post #: 1
Word Count: 105 (Ideal: 50-150)
Character Count: 671 (Ideal: 300-1300)
Emoji Count: 15 (Ideal: 5-12)
Engagement Score: 100/100

🎯 Engagement Elements:
✅ Has Question: Yes
✅ Has Call-to-Action: No
✅ Has Statistics: Yes
✅ Has Attention Grabber: Yes

📈 Estimated Performance:
👁️  Estimated Views: 1,000
🖱️  Estimated Clicks: 50
💬 Estimated Interactions: 30

🏆 Performance Rating: EXCELLENT (100/100)
💡 Recommendation: Post immediately - high viral potential
```

---

## 🛠️ Troubleshooting

### Common Issues

**LinkedIn Authentication Failed**
```bash
npm run auth
```

**Access Token Expired**
- LinkedIn tokens expire after 60 days
- Re-authenticate using `npm run auth`

**Content Generation Failed**
- Check OpenAI API key if using AI generation
- Agent will use fallback content automatically

**Database Issues**
- Check file permissions for `fintech_pulse.db`
- Ensure SQLite is properly installed

**Scheduler Not Working**
- Verify timezone settings in `config.js`
- Check system time and timezone

### Logs
The agent provides detailed console logging:
- ✅ Success indicators
- ❌ Error messages
- 📝 Content previews
- ⏰ Scheduling information
- 📊 Performance metrics

---

## 📈 Monitoring & Analytics

### Status Check
```bash
node src/index.js --status
```

### Manual Posting
```bash
node src/index.js --manual-post
```

### Enhanced Preview
```bash
npm run enhanced-preview
```

### Analytics Dashboard
Access via enhanced preview menu option 6

### Database Queries
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

---

## 🔄 Maintenance

### Regular Tasks
1. **Monthly**: Check LinkedIn app permissions
2. **Every 60 days**: Re-authenticate with LinkedIn
3. **Weekly**: Review analytics dashboard
4. **As needed**: Update content themes and statistics

### Updates
- Keep dependencies updated: `npm update`
- Monitor LinkedIn API changes
- Review and refresh content themes
- Analyze performance trends

---

## 📝 License

MIT License - see LICENSE file for details.

---

## 🔒 Security & Privacy

### Protected Files
The following files are automatically excluded from version control:
- `.env` - Contains all API keys and credentials
- `access_token.txt` - LinkedIn access token
- `fintech_pulse.db` - Local database with post history
- `*.db`, `*.sqlite`, `*.sqlite3` - Database files

### Environment Variables
All sensitive data is stored in environment variables:
- `LINKEDIN_CLIENT_ID` - Your LinkedIn app client ID
- `LINKEDIN_CLIENT_SECRET` - Your LinkedIn app secret
- `OPENAI_API_KEY` - Your OpenAI API key
- `NEWS_API_KEY` - Your News API key (optional)

### Making the Repository Public
When you publish this repository to GitHub:
1. ✅ All sensitive files are already in `.gitignore`
2. ✅ No hardcoded credentials in source code
3. ✅ All secrets loaded from environment variables
4. ✅ Database files excluded from version control
5. ✅ Access tokens stored locally only

### For New Users
When someone clones your public repository:
1. They'll need to create their own `.env` file
2. Use `npm run setup` for interactive configuration
3. Or copy `env.example` to `.env` and edit manually
4. All their credentials will be stored locally

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs for error details
3. Verify LinkedIn app configuration
4. Test with enhanced preview first
5. Check database for post history

---

**FintechPulse** - Advanced automated fintech insights for executives 