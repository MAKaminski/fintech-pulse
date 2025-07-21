const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const COURSES = [
  {
    institution: 'MIT OCW',
    title: '6.006 – Introduction to Algorithms',
    focus: 'Algorithms & Data Structures',
    cert: 'No (OCW materials only)',
    link: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/'
  },
  {
    institution: 'MIT OCW / MITx (edX)',
    title: '6.0001 – Intro to CS & Programming in Python',
    focus: 'Programming Foundations',
    cert: 'No OCW; MITx certificate opt.',
    link: 'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/'
  },
  {
    institution: 'MITx (edX)',
    title: '6.0002 – Intro to Computational Thinking & Data Science',
    focus: 'Data Science & Algorithms',
    cert: 'Yes via edX',
    link: 'https://www.edx.org/course/introduction-to-computational-thinking-and-data-science'
  },
  {
    institution: 'Stanford University',
    title: 'MS&E 476 (formerly 71SI) – Entrepreneurship Through the Lens of VC',
    focus: 'VC & Startup Strategy',
    cert: 'No',
    link: 'https://web.stanford.edu/class/msande476/'
  },
  {
    institution: 'HarvardX (Harvard University, edX)',
    title: 'FinTech (VPAL, HarvardX)',
    focus: 'FinTech Strategy & Innovation',
    cert: 'Audit free; certificate opt.',
    link: 'https://pll.harvard.edu/course/fintech'
  },
  {
    institution: 'HBS Online (Harvard Business School)',
    title: 'Investing in Private Equity (Sample Lesson)',
    focus: 'Private Equity Fundamentals',
    cert: '',
    link: 'https://online.hbs.edu/courses/private-equity/'
  }
];

function getRandomCourse() {
  return COURSES[Math.floor(Math.random() * COURSES.length)];
}

class ContinuingEducationGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateEducationPost() {
    try {
      const course = getRandomCourse();
      const prompt = `You are a practical, direct Atlanta-based founder who just completed the following course:\n\nCourse: ${course.title} (${course.institution})\nFocus: ${course.focus}\nLink: ${course.link}\n\nWrite a short LinkedIn post (max 120 words) about ONE way you’ve used (or could use) this course in a real project, case study, or business scenario relevant to Atlanta or the Southeast.\n- Make it sound like a real, local founder (not cheesy, not generic, not overly enthusiastic).\n- Reference Atlanta or the Southeast in the use-case.\n- No lists, no roundups, no rah-rah.\n- End with a practical question for other local founders or autodidacts.\n- Use ALL CAPS for emphasis if needed, but no Markdown.\n- Return only the post content, no explanations.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You write concise, practical LinkedIn posts for Atlanta/Southeast founders and autodidacts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });
      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating education content:', error);
      return this.generateFallbackEducationPost();
    }
  }

  generateFallbackEducationPost() {
    const course = getRandomCourse();
    return `Finished ${course.title} (${course.institution}). Used what I learned to build a data pipeline for a fintech project here in Atlanta. If you’re in the Southeast and want to turn theory into traction, this course is worth a look. Anyone else applying new skills to local projects?`;
  }

  async generateImage(postContent) {
    try {
      const imagesDir = path.join(__dirname, '..', '..', '..', 'assets', 'images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      const imagePrompt = await this.generateImagePrompt(postContent);
      const enhancedPrompt = `${imagePrompt}\n\nIMPORTANT: Create an image with NO text, numbers, letters, or readable characters. Use abstract geometric shapes, gradients, and professional design elements instead.`;
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural'
      });
      if (response.data && response.data[0] && response.data[0].url) {
        const imageUrl = response.data[0].url;
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `continuing-education-${timestamp}.png`;
        const imagePath = path.join(imagesDir, filename);
        fs.writeFileSync(imagePath, imageResponse.data);
        return { success: true, imagePath, filename, prompt: imagePrompt, url: imageUrl };
      } else {
        throw new Error('No image URL received from DALL-E');
      }
    } catch (error) {
      console.error('Error generating education image:', error.message);
      return { success: false, imagePath: null, filename: null, prompt: await this.generateImagePrompt(postContent), error: error.message };
    }
  }

  async generateImagePrompt(postContent) {
    return `A vibrant, modern, abstract illustration representing lifelong learning, online courses, and the joy of self-education. No text, no numbers, just energetic colors and shapes.`;
  }
}

module.exports = ContinuingEducationGenerator; 