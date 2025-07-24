const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class FreestyleGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateFreestylePost(customPrompt) {
    try {
      console.log('🤖 Crafting your custom prompt into a LinkedIn post...');

      const systemPrompt = `You are an expert LinkedIn content creator who specializes in transforming raw ideas into engaging, professional posts.

Your task is to take the user's custom prompt and craft it into a LinkedIn post that:
1. Maintains the user's original tone and voice
2. Enhances clarity and readability
3. Improves engagement through better structure and hooks
4. Uses LinkedIn best practices (proper formatting, hashtags, etc.)
5. Keeps the core message and intent intact
6. Adds relevant hashtags and mentions if appropriate

Guidelines:
- Use ALL CAPS for emphasis instead of bold formatting
- Include 3-5 relevant hashtags
- Keep it between 100-300 words for optimal engagement
- Add a compelling hook at the beginning
- End with a question or call-to-action when appropriate
- Maintain the user's personal voice and style
- Make it conversational and authentic

Return the enhanced post content only, no explanations.`;

      const userPrompt = `Please transform this into a LinkedIn post while maintaining my tone but improving clarity and engagement:

${customPrompt}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const enhancedContent = completion.choices[0].message.content.trim();

      return {
        originalPrompt: customPrompt,
        enhancedContent: enhancedContent,
        metadata: {
          type: 'freestyle',
          timestamp: new Date().toISOString(),
          wordCount: enhancedContent.split(/\s+/).length,
          characterCount: enhancedContent.length
        }
      };

    } catch (error) {
      console.error('❌ Error generating freestyle post:', error.message);
      throw new Error('Failed to generate freestyle post');
    }
  }

  async generateFreestyleImage(content) {
    let imagePrompt = '';
    try {
      console.log('🎨 Generating image for your freestyle post...');

      // Extract key themes from the content for image generation
      imagePrompt = await this.createImagePrompt(content);

      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      const imageUrl = response.data[0].url;
      const filename = `freestyle-${Date.now()}.png`;
      const imagePath = path.join(process.cwd(), 'images', filename);

      // Download and save the image
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();

      // Ensure images directory exists
      const imagesDir = path.join(process.cwd(), 'images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      fs.writeFileSync(imagePath, Buffer.from(imageBuffer));

      return {
        success: true,
        imagePath: imagePath,
        filename: filename,
        url: imageUrl,
        prompt: imagePrompt
      };

    } catch (error) {
      console.error('❌ Error generating freestyle image:', error.message);
      return {
        success: false,
        error: error.message,
        prompt: imagePrompt || 'Failed to generate image prompt'
      };
    }
  }

  async createImagePrompt(content) {
    try {
      const systemPrompt = `You are an expert at creating DALL-E image prompts for LinkedIn posts.

Your task is to analyze the LinkedIn post content and create a compelling, professional image prompt that:
1. Represents the main theme or concept of the post
2. Is professional and business-appropriate
3. Would be visually appealing on LinkedIn
4. Avoids text, logos, or specific brand elements
5. Uses clear, descriptive language for DALL-E

Guidelines:
- Focus on abstract concepts, metaphors, or visual representations
- Use professional, clean aesthetics
- Avoid cluttered or complex scenes
- Make it relevant to the post's industry or topic
- Keep it under 100 words

Return only the image prompt, no explanations.`;

      const userPrompt = `Create a DALL-E image prompt for this LinkedIn post:

"${content}"

Focus on the main theme or concept.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      return completion.choices[0].message.content.trim();

    } catch (error) {
      console.error('❌ Error creating image prompt:', error.message);
      return 'Professional business concept with clean, modern design';
    }
  }

  calculateFreestyleEngagementMetrics(content) {
    const wordCount = content.split(/\s+/).length;
    const charCount = content.length;
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    const hasQuestion = content.includes('?');
    const hasCallToAction = /(comment|share|like|follow|connect|message|reach out|let me know|what do you think)/i.test(content);
    const hasHashtags = /#\w+/.test(content);
    const hasMentions = /@\w+/.test(content);
    const hasPersonalVoice = /(i've|i'm|i am|my|me|i think|i believe)/i.test(content);

    // Calculate engagement score
    let engagementScore = 50; // Base score

    if (wordCount >= 50 && wordCount <= 150) engagementScore += 10;
    if (charCount >= 300 && charCount <= 1300) engagementScore += 10;
    if (emojiCount >= 3 && emojiCount <= 8) engagementScore += 5;
    if (hasQuestion) engagementScore += 10;
    if (hasCallToAction) engagementScore += 10;
    if (hasHashtags) engagementScore += 5;
    if (hasPersonalVoice) engagementScore += 5;

    // Estimate performance
    const estimatedViews = Math.floor(engagementScore * 15);
    const estimatedClicks = Math.floor(estimatedViews * 0.03);
    const estimatedInteractions = Math.floor(estimatedViews * 0.05);

    return {
      engagementScore: Math.min(engagementScore, 100),
      estimatedViews,
      estimatedClicks,
      estimatedInteractions,
      metrics: {
        wordCount,
        charCount,
        emojiCount,
        hasQuestion,
        hasCallToAction,
        hasHashtags,
        hasMentions,
        hasPersonalVoice
      }
    };
  }
}

module.exports = FreestyleGenerator; 