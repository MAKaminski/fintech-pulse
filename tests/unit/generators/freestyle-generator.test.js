const { expect } = require('chai');
const sinon = require('sinon');
const FreestyleGenerator = require('../../../src/generators/freestyle/generator');

describe('FreestyleGenerator', () => {
  let generator;
  let openaiStub;

  beforeEach(() => {
    generator = new FreestyleGenerator();
    openaiStub = sinon.stub(generator.openai.chat.completions, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('generateFreestylePost', () => {
    it('should generate enhanced content from custom prompt', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '🚀 EXCITING NEWS: I just discovered something AMAZING about AI and business! The future is here, and it\'s INCREDIBLE what we can achieve. What do you think about the potential? #AI #Innovation #FutureOfWork'
          }
        }]
      };

      openaiStub.resolves(mockResponse);

      const customPrompt = 'I found something cool about AI';
      const result = await generator.generateFreestylePost(customPrompt);

      expect(result).to.have.property('originalPrompt', customPrompt);
      expect(result).to.have.property('enhancedContent');
      expect(result).to.have.property('metadata');
      expect(result.metadata).to.have.property('type', 'freestyle');
      expect(result.metadata).to.have.property('wordCount');
      expect(result.metadata).to.have.property('characterCount');
      expect(openaiStub.calledOnce).to.be.true;
    });

    it('should handle API errors gracefully', async () => {
      openaiStub.rejects(new Error('API Error'));

      const customPrompt = 'Test prompt';
      
      try {
        await generator.generateFreestylePost(customPrompt);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to generate freestyle post');
      }
    });

    it('should maintain user tone while enhancing content', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '💡 INTERESTING OBSERVATION: I\'ve been thinking about this topic a lot lately, and I believe there\'s something important here. What are your thoughts? #PersonalInsights #Reflection'
          }
        }]
      };

      openaiStub.resolves(mockResponse);

      const customPrompt = 'I think about this topic a lot';
      const result = await generator.generateFreestylePost(customPrompt);

      expect(result.enhancedContent).to.include('I\'ve been thinking');
      expect(result.enhancedContent).to.include('I believe');
      expect(result.enhancedContent).to.include('What are your thoughts');
    });
  });

  describe('generateFreestyleImage', () => {
    let imagesStub;
    let fetchStub;

    beforeEach(() => {
      imagesStub = sinon.stub(generator.openai.images, 'generate');
      fetchStub = sinon.stub(global, 'fetch');
    });

    it('should generate image for freestyle content', async () => {
      const mockImageResponse = {
        data: [{
          url: 'https://example.com/image.png'
        }]
      };

      const mockFetchResponse = {
        arrayBuffer: sinon.stub().resolves(new ArrayBuffer(8))
      };

      imagesStub.resolves(mockImageResponse);
      fetchStub.resolves(mockFetchResponse);

      // Mock fs operations
      const fsStub = sinon.stub(require('fs'));
      fsStub.existsSync.returns(true);
      fsStub.writeFileSync.returns();

      const content = 'Test content for image generation';
      const result = await generator.generateFreestyleImage(content);

      expect(result.success).to.be.true;
      expect(result).to.have.property('imagePath');
      expect(result).to.have.property('filename');
      expect(result).to.have.property('url');
      expect(result).to.have.property('prompt');
      expect(imagesStub.calledOnce).to.be.true;
    });

    it('should handle image generation errors', async () => {
      imagesStub.rejects(new Error('Image generation failed'));

      const content = 'Test content';
      const result = await generator.generateFreestyleImage(content);

      expect(result.success).to.be.false;
      expect(result).to.have.property('error');
      expect(result.error).to.equal('Image generation failed');
    });
  });

  describe('createImagePrompt', () => {
    it('should create appropriate image prompt from content', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Professional business concept with clean, modern design representing innovation and growth'
          }
        }]
      };

      openaiStub.resolves(mockResponse);

      const content = '🚀 EXCITING NEWS: Innovation is driving our future!';
      const result = await generator.createImagePrompt(content);

      expect(result).to.be.a('string');
      expect(result.length).to.be.greaterThan(0);
      expect(openaiStub.calledOnce).to.be.true;
    });

    it('should return fallback prompt on error', async () => {
      openaiStub.rejects(new Error('API Error'));

      const content = 'Test content';
      const result = await generator.createImagePrompt(content);

      expect(result).to.equal('Professional business concept with clean, modern design');
    });
  });

  describe('calculateFreestyleEngagementMetrics', () => {
    it('should calculate engagement metrics correctly', () => {
      const content = '🚀 EXCITING NEWS: I think this is AMAZING! What do you think? #Innovation #Future';
      
      const metrics = generator.calculateFreestyleEngagementMetrics(content);

      expect(metrics).to.have.property('engagementScore');
      expect(metrics).to.have.property('estimatedViews');
      expect(metrics).to.have.property('estimatedClicks');
      expect(metrics).to.have.property('estimatedInteractions');
      expect(metrics).to.have.property('metrics');
      
      expect(metrics.metrics).to.have.property('wordCount');
      expect(metrics.metrics).to.have.property('charCount');
      expect(metrics.metrics).to.have.property('emojiCount');
      expect(metrics.metrics).to.have.property('hasQuestion');
      expect(metrics.metrics).to.have.property('hasCallToAction');
      expect(metrics.metrics).to.have.property('hasHashtags');
      expect(metrics.metrics).to.have.property('hasPersonalVoice');
    });

    it('should detect engagement elements correctly', () => {
      const content = 'I think this is interesting? What do you think? #Test';
      
      const metrics = generator.calculateFreestyleEngagementMetrics(content);

      expect(metrics.metrics.hasQuestion).to.be.true;
      expect(metrics.metrics.hasHashtags).to.be.true;
      expect(metrics.metrics.hasPersonalVoice).to.be.true;
    });

    it('should calculate engagement score based on content quality', () => {
      const goodContent = '🚀 EXCITING NEWS: I think this is AMAZING! What do you think? #Innovation #Future #Growth';
      
      const metrics = generator.calculateFreestyleEngagementMetrics(goodContent);

      expect(metrics.engagementScore).to.be.greaterThan(50);
      expect(metrics.estimatedViews).to.be.greaterThan(0);
    });
  });
}); 