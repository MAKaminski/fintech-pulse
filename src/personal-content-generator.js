const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

class PersonalContentGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  // Generate a personal LinkedIn post following the proven template
  async generatePersonalPost() {
    try {
      const prompt = `Create a personal LinkedIn post following this EXACT structure and style:

PERSONAL POST TEMPLATE:
1. **Engaging Hook**: Start with "Everybody tells you [common belief] sounds boring/overwhelming/etc." followed by "But for me? I actually [your genuine passion]"
2. **Personal Connection**: Add a brief authentic statement about your passion, like "(Yes, I'm that person. No, I'm not [joke]—just [what you actually do])"
3. **What I'm Evaluating Right Now**: 3-4 bullet points with specific skills/areas you're focused on
4. **How I Work**: 3-4 bullet points describing your approach/methodology
5. **Why I'm Posting**: Clear call to action and what you're seeking
6. **TL;DR**: Quick summary with emoji and clear next steps

STYLE REQUIREMENTS:
- Authentic, personal tone (not corporate speak)
- Use "I" statements naturally
- Include specific skills/technologies you know
- Show personality while remaining professional
- Use emojis strategically (not overdone)
- Include clear calls to action
- Follow the exact structure above

CONTENT AREAS TO CHOOSE FROM:
- Full-stack development (frontend, backend, DevOps)
- Business operations (EBITDA, P&L, scaling)
- Growth/marketing strategies
- Product management
- Data analysis/analytics
- Sales/business development
- Leadership/team building
- Industry-specific expertise (fintech, SaaS, etc.)

TECHNICAL REQUIREMENTS:
- Word count: 150-300 words
- Include 8-15 emojis strategically placed
- Use bullet points and clear sections
- End with actionable next steps
- Professional but approachable tone
- Follow the exact template structure above

FORMAT: Return only the post content, no explanations.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating authentic, engaging personal LinkedIn posts that drive meaningful connections and opportunities."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      });

      return completion.choices[0].message.content.trim();

    } catch (error) {
      console.error('Error generating personal content:', error);
      return this.generateFallbackPersonalPost();
    }
  }

  // Fallback personal post if AI generation fails
  generateFallbackPersonalPost() {
    const templates = [
      `Everybody tells you EBITDA growth sounds boring.
But for me? I actually light up when I dive into the P&L—call me cliché, but I really love EBITDA growth. (Yes, I'm that guy. No, I'm not fixing the planet—just building businesses, one margin point at a time.)

🔧 What I'm Evaluating Right Now
Full‑stack builder: fluent in frontend, backend, accounting, legal—literally full‑stack.

EBITDA obsessed: optimizing cost, scaling margins, and squeezing every drop of value.

Growth-oriented: boosting sales, eliminating friction, and deploying capital as if it's my personal game of chess.

🧱 How I Work
Find the friction—then remove it (preferably before someone notices it's gone).

Scale revenue by aligning product, pricing, and process.

Optimize capital deployment—because if you're going to spend, might as well make it count.

Operate end‑to‑end: from drafting legal terms to shipping the finished product—no silos here.

🎯 Why I'm Posting
I'm humbled by what I've learned lately, and excited for where I go next. If you're looking for someone who can speak both JavaScript and GAAP, deploy with one hand while negotiating with the other—and does it all with a smile—let's talk.

Seeking full‑stack growth roles 📈

Open to advisory / operator‑in‑residence gigs

Always fascinated by founders ready to scale smart

TL;DR: EBITDA nerd + full‑stack builder + sales‑growth junkie = ready for your next scaling mission. Interested? Drop a comment, DM me, or pass me to your favorite recruiter or hiring manager 😉`,

      `Everybody tells you that diving deep into code and business metrics is overwhelming.
But for me? I actually thrive in the intersection of technology and business strategy. There's something incredibly satisfying about building solutions that drive real business impact. (Yes, I'm that person who gets excited about both algorithms and P&L statements.)

🔧 What I'm Evaluating Right Now
Technical architecture that supports business growth and scales with demand.

Data analytics that inform strategic decisions and drive measurable outcomes.

Customer experience optimization across all touchpoints and channels.

Market expansion and growth strategies that actually work.

🧱 How I Work
Start with the problem, not the solution—understand the business need first.

Build iteratively and measure everything—data drives decisions, not hunches.

Focus on user needs and business outcomes—not just technical elegance.

Scale what works, iterate on what doesn't—fail fast, learn faster.

🎯 Why I'm Posting
I'm looking for opportunities to work with teams that are building something meaningful. Whether it's a startup scaling up or an established company innovating, I want to be part of the journey.

Seeking roles in product strategy, technical leadership, or growth 📊

Open to advisory positions and strategic consulting

Always excited to learn about new challenges and opportunities

TL;DR: Tech strategist + business builder + growth mindset = ready to tackle your next big challenge. Let's connect! 🚀`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Generate image for personal post
  async generatePersonalImage(postContent) {
    try {
      console.log('🎨 Generating personal image with DALL-E...');
      
      const imagePrompt = await this.generatePersonalImagePrompt(postContent);
      
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
      });

      if (response.data && response.data[0] && response.data[0].url) {
        const imageUrl = response.data[0].url;
        
        // Create images directory if it doesn't exist
        const imagesDir = path.join(process.cwd(), 'images');
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }

        // Download and save image
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        
        // Generate unique filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `personal-post-${timestamp}.png`;
        const imagePath = path.join(imagesDir, filename);
        
        // Save image to local file
        fs.writeFileSync(imagePath, imageResponse.data);
        
        console.log(`✅ Personal image generated and saved: ${filename}`);
        
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
      console.error('❌ Error generating personal image:', error.message);
      return {
        success: false,
        imagePath: null,
        filename: null,
        prompt: await this.generatePersonalImagePrompt(postContent),
        error: error.message
      };
    }
  }

  // Generate image prompt for personal post
  async generatePersonalImagePrompt(postContent) {
    try {
      const prompt = `Create a professional personal branding image prompt based on this LinkedIn post:

${postContent}

Requirements:
- Professional, modern style
- Personal branding theme
- Clean, minimalist design
- Professional headshot or abstract professional imagery
- Suitable for LinkedIn personal profile
- High-quality, photorealistic style
- Professional color scheme (blues, grays, whites)
- Clean, uncluttered composition
- NO TEXT, NUMBERS, OR LETTERS in the image
- NO CHARTS, GRAPHS, OR BUSINESS ELEMENTS
- Focus on professional aesthetics and personal brand
- Use subtle gradients, professional lighting, and modern design elements

Return only the image prompt, no explanations.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating image prompts for professional personal branding content."
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
      return "Professional headshot with modern office background, clean lighting, professional attire, confident pose, blue and gray color scheme";
    }
  }

  // Calculate engagement metrics for personal post
  calculatePersonalEngagementMetrics(postContent) {
    const wordCount = postContent.split(/\s+/).length;
    const charCount = postContent.length;
    const emojiCount = (postContent.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    const hasQuestion = /\?/.test(postContent);
    const hasCallToAction = /\b(DM|connect|talk|comment|message)\b/i.test(postContent);
    const hasPersonalHook = /\b(But for me|I actually|I really|I'm that)\b/i.test(postContent);
    const hasStructuredSections = /\b(What I'm|How I Work|Why I'm|TL;DR)\b/i.test(postContent);

    // Personal post engagement scoring
    let engagementScore = 0;
    
    // Word count optimization (0-20 points)
    if (wordCount >= 150 && wordCount <= 300) {
      engagementScore += 20;
    } else if (wordCount >= 100 && wordCount <= 400) {
      engagementScore += 15;
    }

    // Character count optimization (0-15 points)
    if (charCount >= 800 && charCount <= 1500) {
      engagementScore += 15;
    } else if (charCount >= 600 && charCount <= 2000) {
      engagementScore += 10;
    }

    // Emoji usage (0-15 points)
    if (emojiCount >= 8 && emojiCount <= 15) {
      engagementScore += 15;
    } else if (emojiCount >= 5 && emojiCount <= 20) {
      engagementScore += 10;
    }

    // Personal post elements (0-30 points)
    if (hasPersonalHook) engagementScore += 10;
    if (hasStructuredSections) engagementScore += 10;
    if (hasCallToAction) engagementScore += 10;

    // Engagement elements (0-20 points)
    if (hasQuestion) engagementScore += 10;
    if (hasCallToAction) engagementScore += 10;

    // Estimated metrics based on score
    const baseViews = 300; // Personal posts typically get fewer views than business posts
    const baseClicks = 15;
    const baseInteractions = 10;
    const multiplier = 1 + (engagementScore / 100);
    
    return {
      engagementScore: Math.min(100, engagementScore),
      estimatedViews: Math.round(baseViews * multiplier),
      estimatedClicks: Math.round(baseClicks * multiplier),
      estimatedInteractions: Math.round(baseInteractions * multiplier),
      metrics: {
        wordCount,
        charCount,
        emojiCount,
        hasQuestion,
        hasCallToAction,
        hasPersonalHook,
        hasStructuredSections
      }
    };
  }
}

module.exports = PersonalContentGenerator; 