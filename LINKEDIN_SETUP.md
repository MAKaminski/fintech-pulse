# LinkedIn Analytics Setup Guide

This guide will help you set up real LinkedIn analytics data collection for **YOUR posts** in FintechPulse.

## 🔐 Option 1: LinkedIn API (Recommended)

### Step 1: Create LinkedIn App
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create App"
3. Fill in the required information:
   - App name: `FintechPulse Analytics`
   - LinkedIn Page: Your company page
   - App Logo: Upload a logo
4. Submit for review

### Step 2: Configure App Settings
1. In your app dashboard, go to "Auth" tab
2. Add redirect URL: `http://localhost:8000/callback`
3. Add scopes: `openid profile w_member_social email`
4. Save changes

### Step 3: Get Credentials
1. Copy your **Client ID** and **Client Secret**
2. Create a `.env` file in the project root:

```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:8000/callback
LINKEDIN_EMAIL=your_linkedin_email@example.com
LINKEDIN_PASSWORD=your_linkedin_password
```

### Step 4: Authenticate
```bash
npm run auth
```
Follow the prompts to authenticate with LinkedIn.

## 🤖 Option 2: Selenium Scraper (Fallback)

If LinkedIn API doesn't work, use the Selenium scraper:

### Step 1: Set Environment Variables
```env
LINKEDIN_EMAIL=your_linkedin_email@example.com
LINKEDIN_PASSWORD=your_linkedin_password
```

### Step 2: Install Dependencies
```bash
npm install puppeteer
```

## 🚀 Usage

### Manual Analytics Collection
```bash
# Run the analytics collector CLI
npm run analytics-collector

# Or run specific collection methods
npm run scrape-analytics  # Selenium scraper only
```

### Automated Collection
```bash
# Start daily scheduler (runs at 2:00 AM EST)
npm run daily-analytics

# Or use the CLI to start schedulers
npm run analytics-collector
# Then choose option 4 (Daily) or 5 (Hourly)
```

## 📊 What Data is Collected (YOUR Posts Only)

### LinkedIn API Data (YOUR Posts)
- YOUR post views, likes, comments, shares
- YOUR engagement rates
- YOUR click-through rates
- YOUR audience demographics (if available)

### Selenium Scraper Data (YOUR Posts)
- YOUR post content and timestamps
- YOUR view counts
- YOUR like counts
- YOUR comment counts
- YOUR share counts
- YOUR engagement rates

## 🔧 Troubleshooting

### LinkedIn API Issues
1. **Invalid Credentials**: Check your Client ID and Secret
2. **Scope Issues**: Ensure you have `w_member_social` scope
3. **Rate Limits**: LinkedIn has rate limits, wait between requests

### Selenium Issues
1. **Login Failed**: Check your email/password
2. **Browser Issues**: Update Chrome/Chromium
3. **Detection**: LinkedIn may detect automation, use headless mode

### Database Issues
1. **No Data**: Run analytics collection first
2. **Connection Errors**: Check SQLite database file
3. **Permission Issues**: Ensure write permissions

## 📈 Analytics Dashboard

Once data is collected, view it in the web UI:
1. Start the server: `npm run react-ui`
2. Open: http://localhost:8000
3. Click "Analytics" button
4. View real LinkedIn performance data

## 🔄 Daily Automation

To set up daily automated collection:

### Using Cron (Linux/Mac)
```bash
# Add to crontab
0 2 * * * cd /path/to/fintech-pulse && npm run daily-analytics
```

### Using Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to daily at 2:00 AM
4. Set action to run: `npm run daily-analytics`

## 📊 Data Retention

Analytics data is stored in:
- **Database**: `fintech_pulse.db` (SQLite)
- **Reports**: `analytics-report-YYYY-MM-DD.json`

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use environment variables for sensitive data
- Consider using a dedicated LinkedIn account for automation
- Monitor for LinkedIn policy changes

## 🆘 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your LinkedIn credentials
3. Ensure all dependencies are installed
4. Check LinkedIn's API status page 