require('dotenv').config();

module.exports = {
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || 'your_linkedin_client_id_here',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'your_linkedin_client_secret_here',
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:8000/callback',
    scope: 'openid profile w_member_social email'
  },
  posting: {
    morningTime: process.env.MORNING_POST_TIME || '08:30',
    eveningTime: process.env.EVENING_POST_TIME || '16:00',
    timezone: process.env.TIMEZONE || 'America/New_York'
  },
  agent: {
    name: 'FintechPulse',
    purpose: 'Promote Fintech & Service Industry Analytics',
    style: 'Analytical',
    audience: 'Fintech & PE Execs',
    includeCTA: true,
    useQuotesAndStats: true
  }
}; 