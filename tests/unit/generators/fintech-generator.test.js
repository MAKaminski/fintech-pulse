const { expect } = require('chai');
const sinon = require('sinon');
const EnhancedContentGenerator = require('../../../src/generators/fintech/generator');

describe('EnhancedContentGenerator', () => {
  let generator;
  let openaiStub;

  beforeEach(() => {
    generator = new EnhancedContentGenerator();
    openaiStub = sinon.stub(generator.openai.chat.completions, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('generateOptimizedPost', () => {
    it('should generate a post with proper structure', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'This is a test fintech post with emojis 🚀 and insights.'
          }
        }]
      };
      openaiStub.resolves(mockResponse);

      const result = await generator.generateOptimizedPost();

      expect(result).to.be.a('string');
      expect(result).to.include('test fintech post');
      expect(openaiStub.calledOnce).to.be.true;
    });

    it('should handle API errors gracefully', async () => {
      openaiStub.rejects(new Error('API Error'));

      const result = await generator.generateOptimizedPost();

      expect(result).to.include('Fintech');
      expect(result).to.include('🚨');
    });
  });

  describe('generateImage', () => {
    it('should generate image with proper prompt', async () => {
      const mockImageResponse = {
        data: [{
          url: 'https://example.com/image.png'
        }]
      };
      const mockDownloadResponse = {
        data: Buffer.from('fake-image-data')
      };

      const axiosStub = sinon.stub(require('axios'), 'get').resolves(mockDownloadResponse);
      const imageStub = sinon.stub(generator.openai.images, 'generate').resolves(mockImageResponse);
      const fsStub = sinon.stub(require('fs'), 'writeFileSync');

      const postContent = 'Test fintech content';
      const result = await generator.generateImage(postContent);

      expect(result.success).to.be.true;
      expect(result.filename).to.match(/fintech-pulse-.*\.png/);
      expect(imageStub.calledOnce).to.be.true;
      expect(axiosStub.calledOnce).to.be.true;
      expect(fsStub.calledOnce).to.be.true;
    });
  });

  describe('calculateEngagementMetrics', () => {
    it('should calculate metrics correctly', () => {
      const postContent = 'This is a test post with 🚀 emoji and a question?';
      const metrics = generator.calculateEngagementMetrics(postContent);

      expect(metrics.metrics.wordCount).to.equal(11);
      expect(metrics.metrics.emojiCount).to.equal(1);
      expect(metrics.metrics.hasQuestion).to.be.true;
      expect(metrics.engagementScore).to.be.a('number');
      expect(metrics.estimatedViews).to.be.a('number');
    });
  });
}); 