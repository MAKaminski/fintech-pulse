const OpenAI = require('openai');
const fs = require('fs');
const config = require('../../../config.js');
const path = require('path');

class MichaelDavisGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.profile = this.loadProfile();
    this.topics = this.loadTopics();
  }

  loadProfile() {
    try {
      const profilePath = path.join(__dirname, '../../../profiles/michael-davis-profile.md');
      const profileContent = fs.readFileSync(profilePath, 'utf8');
      return profileContent;
    } catch (error) {
      console.error('Error loading Michael Davis profile:', error);
      return '';
    }
  }

  loadTopics() {
    return {
      realEstate: [
        'South Downtown development opportunities',
        'Atlanta housing market trends',
        'Tax legislation impact on real estate',
        'Development project case studies',
        'Market timing for real estate investments'
      ],
      investment: [
        'Homegrown investment strategies',
        'Overline venture capital insights',
        'Private equity deal flow',
        'Portfolio management tactics',
        'Market opportunity analysis'
      ],
      technology: [
        'Atlanta Tech Village ecosystem',
        'Startup community building',
        'Tech trends and opportunities',
        'Product development insights',
        'Team building and culture'
      ],
      policy: [
        'Tax policy impact on business',
        'Regulatory changes and market effects',
        'Government relations strategies',
        'Compliance and risk management',
        'Policy-driven investment opportunities'
      ],
      personalDevelopment: [
        'Career advancement strategies',
        'Skill development approaches',
        'Network building tactics',
        'Productivity and time management',
        'Professional growth insights'
      ]
    };
  }

  async generateImage(postContent) {
    try {
      const axios = require('axios');
      // Create images directory if it doesn't exist
      const imagesDir = path.join(__dirname, '..', 'images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      // Generate image prompt
      const imagePrompt = await this.generateImagePrompt(postContent);
      console.log('🎨 Generating image with DALL-E...');
      const enhancedPrompt = `${imagePrompt}\n\nIMPORTANT: Create an image with NO text, numbers, letters, or readable characters. Use abstract geometric shapes, gradients, and professional design elements instead.`;

      // Generate image using DALL-E
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      });

      if (response.data && response.data[0] && response.data[0].url) {
        const imageUrl = response.data[0].url;
        // Download and save the image
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        // Generate unique filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `michael-davis-${timestamp}.png`;
        const imagePath = path.join(imagesDir, filename);
        fs.writeFileSync(imagePath, imageResponse.data);
        console.log(`✅ Image generated and saved: ${filename}`);
        return {
          success: true,
          imagePath: imagePath,
          filename: filename,
          prompt: imagePrompt,
          url: imageUrl
        };
      } else {
        throw new Error('No image URL received from DALL-E');
      }
    } catch (error) {
      console.error('❌ Error generating image:', error.message);
      return {
        success: false,
        imagePath: null,
        filename: null,
        prompt: await this.generateImagePrompt(postContent),
        error: error.message
      };
    }
  }

  async generateImagePrompt(postContent) {
    try {
      const prompt = `Create a professional, business-themed image prompt for a LinkedIn post in the style of Michael Davis.\n\nPost Content:\n${postContent}\n\nRequirements:\n- Professional, modern style\n- Business, real estate, or Atlanta/urban theme\n- Clean, minimalist design\n- Suitable for LinkedIn business audience\n- High-quality, photorealistic style\n- Blue, white, or neutral color scheme\n- NO TEXT, NUMBERS, OR LETTERS in the image\n- NO CHARTS WITH LABELS OR AXES\n- NO SCREENS WITH TEXT\n- Focus on abstract cityscapes, urban development, or professional aesthetics\n- Use gradients, light effects, and modern design elements\n\nReturn only the image prompt, no explanations.`;
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating image prompts for professional business and real estate content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      });
      return completion.choices[0].message.content.trim();
    } catch (error) {
      return "Professional Atlanta cityscape, modern business district, clean design, blue and white color scheme, no text or numbers, abstract urban development.";
    }
  }

  async generatePost(topic = 'auto', style = 'analysis') {
    console.log('🎯 Generating Michael Davis-style post...');
    const selectedTopic = topic === 'auto' ? this.selectRandomTopic() : topic;
    const topicDetails = this.getTopicDetails(selectedTopic);
    const prompt = this.buildPrompt(selectedTopic, topicDetails, style);
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are Michael Davis, author of "Exonomist" on Substack. Write in his distinctive style: direct, conversational, practical, and actionable. Focus on real-world insights from business, investing, and personal development. Always include Atlanta/Southeast perspective when relevant. Use short paragraphs, bullet points, and end with actionable takeaways.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });
      const post = completion.choices[0].message.content;
      const formatted = this.formatPost(post, selectedTopic);
      const image = await this.generateImage(formatted.content);
      return { ...formatted, image };
    } catch (error) {
      console.error('❌ Error generating post:', error);
      throw error;
    }
  }

  selectRandomTopic() {
    const categories = Object.keys(this.topics);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryTopics = this.topics[randomCategory];
    return {
      category: randomCategory,
      topic: categoryTopics[Math.floor(Math.random() * categoryTopics.length)]
    };
  }

  getTopicDetails(topic) {
    if (typeof topic === 'object') {
      return topic;
    }
    
    // Find topic in categories
    for (const [category, topics] of Object.entries(this.topics)) {
      if (topics.includes(topic)) {
        return { category, topic };
      }
    }
    
    return { category: 'general', topic };
  }

  buildPrompt(topic, topicDetails, style) {
    const basePrompt = `
Write a LinkedIn post in Michael Davis's style about: ${topicDetails.topic}

Key requirements:
- Use Michael Davis's conversational, direct tone and writing patterns
- Include personal observations and market insights
- Focus on practical, actionable takeaways
- Reference Atlanta/Southeast when relevant
- Keep paragraphs short and scannable
- Use bullet points for key insights
- End with a clear next step or question
- DO NOT sign off with "Michael" or any signature
- DO NOT pretend to be Michael Davis - be your own person
- For legislation/taxes/housing topics, reference current laws like the Inflation Reduction Act, Infrastructure Bill, or other recent legislation
- DO NOT use markdown formatting (no **bold**, *italic*, or # headers)
- Use ALL CAPS for emphasis instead of bold formatting

Style: ${style}
Category: ${topicDetails.category}

Include specific insights about:
- Current market conditions
- Personal experience or observations
- Actionable recommendations
- Questions for readers to consider
- Recent legislation impact (for policy topics)

Make it feel like you're sharing insights over coffee with a colleague, but be your own authentic voice.
`;

    return basePrompt;
  }

  formatPost(content, topic) {
    const timestamp = new Date().toISOString();
    const topicInfo = typeof topic === 'object' ? topic.topic : topic;
    
    // Clean up any markdown formatting that LinkedIn doesn't support
    let formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
      .replace(/`(.*?)`/g, '$1')       // Remove code markdown
      .replace(/#{1,6}\s/g, '')        // Remove headers
      .replace(/\n{3,}/g, '\n\n')      // Limit consecutive line breaks
      .trim();

    // Add LinkedIn-compatible formatting
    // Use ALL CAPS for emphasis instead of bold
    formattedContent = formattedContent
      .replace(/\b(IMPORTANT|KEY|CRITICAL|ESSENTIAL|MAJOR|SIGNIFICANT)\b/gi, (match) => match.toUpperCase())
      .replace(/\b(NOTE|REMEMBER|FOCUS|PAY ATTENTION)\b/gi, (match) => match.toUpperCase());
    
    return {
      content: formattedContent,
      metadata: {
        author: 'Michael Davis',
        style: 'Exonomist',
        topic: topicInfo,
        category: typeof topic === 'object' ? topic.category : 'general',
        timestamp: timestamp,
        platform: 'LinkedIn'
      }
    };
  }

  async generateMultiplePosts(count = 3, topics = []) {
    console.log(`📝 Generating ${count} Michael Davis-style posts...`);
    
    const posts = [];
    const selectedTopics = topics.length > 0 ? topics : ['auto'];
    
    for (let i = 0; i < count; i++) {
      const topic = selectedTopics[i % selectedTopics.length];
      const styles = ['analysis', 'strategy', 'observation'];
      const style = styles[i % styles.length];
      
      try {
        const post = await this.generatePost(topic, style);
        posts.push(post);
        console.log(`✅ Generated post ${i + 1}/${count}: ${post.metadata.topic}`);
        
        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error generating post ${i + 1}:`, error.message);
      }
    }
    
    return posts;
  }

  async generateTopicSpecificPost(topic, context = '') {
    console.log(`🎯 Generating specific post about: ${topic}`);
    
    const enhancedPrompt = `
Write a LinkedIn post in Michael Davis's style about: ${topic}

Additional context: ${context}

Requirements:
- Start with a personal observation or recent experience
- Include specific data or market insights
- Connect to broader trends or opportunities
- Provide 3-5 actionable takeaways
- Reference Atlanta/Southeast market when relevant
- End with a question or next step for readers
- DO NOT sign off with "Michael" or any signature
- DO NOT pretend to be Michael Davis - be your own person
- For legislation/taxes/housing topics, reference current laws like the Inflation Reduction Act, Infrastructure Bill, CHIPS Act, or other recent legislation
- DO NOT use markdown formatting (no **bold**, *italic*, or # headers)
- Use ALL CAPS for emphasis instead of bold formatting

Make it feel authentic to Michael Davis's voice and expertise, but be your own authentic person.
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are writing in Michael Davis's distinctive style: direct, conversational, practical, and actionable. Focus on real-world insights from business, investing, and personal development. Always include Atlanta/Southeast perspective when relevant. DO NOT pretend to be Michael Davis - be your own person with your own voice.`
          },
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const post = completion.choices[0].message.content;
      const formatted = this.formatPost(post, topic);
      const image = await this.generateImage(formatted.content);
      return { ...formatted, image };
      
    } catch (error) {
      console.error('❌ Error generating topic-specific post:', error);
      throw error;
    }
  }

  getAvailableTopics() {
    const allTopics = {};
    for (const [category, topics] of Object.entries(this.topics)) {
      allTopics[category] = topics;
    }
    return allTopics;
  }

  async generateSouthDowntownPost() {
    return this.generateTopicSpecificPost(
      'South Downtown development opportunities',
      "Focus on Atlanta's emerging district, development potential, and investment opportunities in the area. Reference recent infrastructure investments and development incentives from recent legislation like the Infrastructure Bill and Inflation Reduction Act."
    );
  }

  async generateHousingPost() {
    return this.generateTopicSpecificPost(
      'Atlanta housing market trends and legislation impact',
      'Include current market data, recent legislation like the Inflation Reduction Act and Infrastructure Bill effects, tax implications, and investment strategies for the Atlanta housing market. Reference specific provisions that impact housing affordability and development.'
    );
  }

  async generateHomegrownPost() {
    return this.generateTopicSpecificPost(
      'Homegrown investment strategies and portfolio management',
      'Share insights on investment approaches, portfolio optimization, and market timing strategies.'
    );
  }

  async generateOverlinePost() {
    return this.generateTopicSpecificPost(
      'Overline venture capital insights and startup investing',
      'Focus on venture capital deal flow, startup ecosystem, and investment opportunities in the Southeast.'
    );
  }

  async generateAtlantaTechVillagePost() {
    return this.generateTopicSpecificPost(
      'Atlanta Tech Village ecosystem and community building',
      'Share insights on the startup community, ecosystem development, and opportunities for founders and investors.'
    );
  }
}

module.exports = MichaelDavisGenerator; 