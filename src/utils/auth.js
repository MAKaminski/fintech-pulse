const express = require('express');
const axios = require('axios');
const config = require('../../config.js');

const app = express();
const PORT = 8000;

// Store the authorization code
let authCode = null;

app.get('/auth', (req, res) => {
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${config.linkedin.clientId}&` +
    `redirect_uri=${encodeURIComponent(config.linkedin.redirectUri)}&` +
    `scope=${encodeURIComponent(config.linkedin.scope)}&` +
    `state=random_state_string`;

  console.log('🔗 Please visit this URL to authorize the app:');
  console.log(authUrl);
  console.log('\nAfter authorization, you will be redirected to localhost:8000/callback');
  
  res.send(`
    <h1>LinkedIn Authorization</h1>
    <p>Please visit this URL to authorize the app:</p>
    <a href="${authUrl}" target="_blank">Authorize LinkedIn App</a>
    <p>After authorization, you will be redirected back here.</p>
  `);
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (code) {
    console.log('✅ Authorization code received:', code);
    
    try {
      // Exchange code for access token
      const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
        params: {
          grant_type: 'authorization_code',
          code: code,
          client_id: config.linkedin.clientId,
          client_secret: config.linkedin.clientSecret,
          redirect_uri: config.linkedin.redirectUri
        }
      });

      const { access_token, expires_in } = tokenResponse.data;
      
      console.log('🎉 Access token received!');
      console.log('Access Token:', access_token);
      console.log('Expires in:', expires_in, 'seconds');
      
      // Save token to file
      const fs = require('fs');
      fs.writeFileSync('access_token.txt', access_token);
      
      res.send(`
        <h1>✅ Authorization Successful!</h1>
        <p>Access token has been saved to access_token.txt</p>
        <p>You can now run the main application with: npm start</p>
      `);
      
      // Close server after 5 seconds
      setTimeout(() => {
        process.exit(0);
      }, 5000);
      
    } catch (error) {
      console.error('❌ Error exchanging code for token:', error.response?.data || error.message);
      res.send(`
        <h1>❌ Authorization Failed</h1>
        <p>Error: ${error.response?.data?.error_description || error.message}</p>
      `);
    }
  } else {
    res.send(`
      <h1>❌ Authorization Failed</h1>
      <p>No authorization code received.</p>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Auth server running on http://localhost:${PORT}`);
  console.log(`📝 Visit http://localhost:${PORT}/auth to start authorization`);
}); 