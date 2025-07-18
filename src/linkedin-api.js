const axios = require('axios');
const fs = require('fs');
const config = require('../config');

class LinkedInAPI {
  constructor() {
    this.accessToken = this.loadAccessToken();
    this.baseURL = 'https://api.linkedin.com/v2';
  }

  loadAccessToken() {
    try {
      if (fs.existsSync('access_token.txt')) {
        return fs.readFileSync('access_token.txt', 'utf8').trim();
      }
      return null;
    } catch (error) {
      console.error('Error loading access token:', error);
      return null;
    }
  }

  async getProfile() {
    try {
      // Use the OpenID Connect userinfo endpoint
      const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting profile:', error.response?.data || error.message);
      throw error;
    }
  }

  async uploadImage(imagePath) {
    try {
      if (!imagePath || !fs.existsSync(imagePath)) {
        console.log('⚠️  No valid image path provided, skipping image upload');
        return null;
      }

      console.log('📤 Uploading image to LinkedIn...');
      
      // Step 1: Register the upload
      const registerResponse = await axios.post(`${this.baseURL}/assets?action=registerUpload`, {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: 'urn:li:person:' + (await this.getProfile()).sub,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }
          ]
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const asset = registerResponse.data.value.asset;

      // Step 2: Upload the image file
      const imageBuffer = fs.readFileSync(imagePath);
      await axios.post(uploadUrl, imageBuffer, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/octet-stream'
        }
      });

      console.log('✅ Image uploaded successfully!');
      return asset;

    } catch (error) {
      console.error('❌ Error uploading image:', error.response?.data || error.message);
      return null;
    }
  }

  async createPost(text, imagePath = null) {
    try {
      // Get the user's profile to get the author URN
      const profile = await this.getProfile();
      
      // For OpenID Connect, we need to construct the URN differently
      // The sub field contains the LinkedIn member ID
      const authorUrn = `urn:li:person:${profile.sub}`;

      // Upload image if provided
      let mediaAsset = null;
      if (imagePath) {
        mediaAsset = await this.uploadImage(imagePath);
      }

      // Create the post
      const postData = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text
            },
            shareMediaCategory: mediaAsset ? 'IMAGE' : 'NONE',
            ...(mediaAsset && {
              media: [
                {
                  status: 'READY',
                  description: {
                    text: 'FintechPulse generated image'
                  },
                  media: mediaAsset,
                  title: {
                    text: 'FintechPulse'
                  }
                }
              ]
            })
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const response = await axios.post(`${this.baseURL}/ugcPosts`, postData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      console.log('✅ Post created successfully!');
      console.log('Post ID:', response.data.id);
      
      // Log the post content for reference
      console.log('📝 Posted content:');
      console.log(text);
      if (mediaAsset) {
        console.log('🖼️  Image included:', imagePath);
      }
      console.log('---');

      return response.data;

    } catch (error) {
      console.error('❌ Error creating post:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        console.error('🔑 Access token may be expired. Please re-authenticate.');
        console.error('Run: npm run auth');
      }
      
      throw error;
    }
  }

  async testConnection() {
    try {
      const profile = await this.getProfile();
      console.log('✅ LinkedIn API connection successful!');
      console.log('Profile:', profile.localizedFirstName, profile.localizedLastName);
      return true;
    } catch (error) {
      console.error('❌ LinkedIn API connection failed:', error.response?.data || error.message);
      return false;
    }
  }

  async refreshToken() {
    // Note: LinkedIn access tokens typically last 60 days
    // This would require implementing refresh token logic
    console.log('⚠️  Token refresh not implemented. Please re-authenticate manually.');
    console.log('Run: npm run auth');
  }
}

module.exports = LinkedInAPI; 