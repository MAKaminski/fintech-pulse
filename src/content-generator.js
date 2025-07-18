const OpenAI = require('openai');
const config = require('../config');

class ContentGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  // Fintech industry statistics and quotes
  getFintechStats() {
    const stats = [
      "Global fintech market expected to reach $324B by 2026",
      "Digital payments market growing at 13.7% CAGR",
      "78% of consumers prefer digital banking solutions",
      "AI in fintech to save $1T annually by 2030",
      "Embedded finance market projected at $7.2T by 2030",
      "RegTech spending to reach $19.5B by 2026",
      "Neobank adoption increased 300% since 2020",
      "Blockchain in fintech market to hit $87B by 2030"
    ];
    return stats[Math.floor(Math.random() * stats.length)];
  }

  getFintechQuotes() {
    const quotes = [
      { text: "The future of banking is not a place you go, but something you do.", author: "Brett King" },
      { text: "Fintech is not just about technology, it's about democratizing financial services.", author: "Vikram Pandit" },
      { text: "Data is the new oil, and fintech companies are the refineries.", author: "Unknown" },
      { text: "The best fintech solutions are invisible to the user.", author: "Chris Skinner" },
      { text: "Innovation in fintech is not optional, it's survival.", author: "Unknown" }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  getContentThemes() {
    return [
      "lending infrastructure and credit analytics",
      "digital transformation in financial services",
      "regulatory technology and compliance",
      "payment processing and fintech platforms",
      "investment trends in fintech",
      "customer experience in financial services",
      "risk management and fraud prevention",
      "embedded finance and API ecosystems"
    ];
  }

  getCallToActions() {
    return [
      "Follow for more fintech insights and analytics",
      "DM to discuss fintech opportunities",
      "Share if you found this valuable",
      "Connect for fintech partnerships",
      "Comment with your thoughts on this trend"
    ];
  }

  async generatePost() {
    try {
      const theme = this.getContentThemes()[Math.floor(Math.random() * this.getContentThemes().length)];
      const stat = this.getFintechStats();
      const quote = this.getFintechQuotes();
      const cta = this.getCallToActions()[Math.floor(Math.random() * this.getCallToActions().length)];

      const prompt = `Generate a LinkedIn post for FintechPulse with the following requirements:

Agent Profile:
- Name: FintechPulse
- Purpose: Promote Fintech & Service Industry Analytics
- Style: Analytical and professional
- Audience: Fintech & PE Executives
- Content Theme: ${theme}

Requirements:
- Include this industry statistic: "${stat}"
- Include this quote: "${quote.text}" - ${quote.author}
- Include this call-to-action: "${cta}"
- No em dashes (use regular dashes instead)
- Keep it professional but engaging
- Maximum 1300 characters
- Start with a compelling hook
- Use bullet points or numbered lists where appropriate
- End with the CTA

Format the post for LinkedIn with proper spacing and structure.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are FintechPulse, an analytical fintech content creator targeting executives and investors. Create engaging, data-driven posts that provide value and insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return completion.choices[0].message.content.trim();

    } catch (error) {
      console.error('Error generating content:', error);
      
      // Fallback content if OpenAI fails
      const stat = this.getFintechStats();
      const quote = this.getFintechQuotes();
      const cta = this.getCallToActions()[Math.floor(Math.random() * this.getCallToActions().length)];
      
      return `📊 Fintech Market Update

The fintech landscape continues to evolve rapidly, with ${stat.toLowerCase()}.

Key insights for executives:
• Digital transformation is accelerating across all financial services
• Customer expectations are driving innovation in user experience
• Regulatory compliance remains a critical success factor
• Data analytics is becoming the competitive advantage

"${quote.text}" - ${quote.author}

As we navigate this dynamic market, staying ahead requires both strategic vision and operational excellence.

${cta}

#Fintech #FinancialServices #Innovation #Analytics #DigitalTransformation`;
    }
  }

  // Generate post without OpenAI (for testing)
  generateFallbackPost() {
    const stat = this.getFintechStats();
    const quote = this.getFintechQuotes();
    const cta = this.getCallToActions()[Math.floor(Math.random() * this.getCallToActions().length)];
    const theme = this.getContentThemes()[Math.floor(Math.random() * this.getContentThemes().length)];
    
    return `📈 Fintech Analytics Insight

${stat}

Today's focus: ${theme}

Key observations for fintech executives:
• Market dynamics are shifting toward embedded solutions
• Customer acquisition costs are rising across the board
• Regulatory clarity is improving in key markets
• Technology stack consolidation is accelerating

"${quote.text}" - ${quote.author}

The companies that adapt quickly to these trends will capture the most value in the coming quarters.

${cta}

#Fintech #Analytics #FinancialServices #Innovation #DigitalBanking`;
  }
}

module.exports = ContentGenerator; 