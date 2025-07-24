const { expect } = require('chai');
const sinon = require('sinon');
const readline = require('readline');
const UnifiedPostGenerator = require('../../src/cli/unified-post-generator');

describe('UnifiedPostGenerator Integration', () => {
  let generator;
  let readlineStub;
  let consoleStub;

  beforeEach(async () => {
    // Create a proper mock readline interface
    const mockReadline = {
      question: sinon.stub(),
      close: sinon.stub()
    };
    
    readlineStub = sinon.stub(readline, 'createInterface').returns(mockReadline);
    consoleStub = sinon.stub(console, 'log');
    
    generator = new UnifiedPostGenerator();
    
    // Initialize database
    await generator.initialize();
    
    // Mock database methods
    sinon.stub(generator.database, 'getNextPostNumber').resolves(1);
    sinon.stub(generator.database, 'savePost').resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Post Type Selection', () => {
    it('should handle fintech post selection', async () => {
      const mockReadline = generator.rl;
      
      // Mock user input sequence
      mockReadline.question.onFirstCall().callsArgWith(1, '1'); // Select fintech
      mockReadline.question.onSecondCall().callsArgWith(1, '1'); // Approve and post

      // Mock the generators
      const mockPostContent = 'Test fintech post content';
      const mockImageResult = { success: true, imagePath: '/test/image.png' };
      const mockMetrics = { 
        engagementScore: 85, 
        estimatedViews: 1000,
        metrics: {
          wordCount: 5,
          charCount: 25,
          emojiCount: 1,
          hasQuestion: true,
          hasCallToAction: true
        }
      };

      sinon.stub(generator.enhancedGenerator, 'generateOptimizedPost').resolves(mockPostContent);
      sinon.stub(generator.enhancedGenerator, 'generateImage').resolves(mockImageResult);
      sinon.stub(generator.enhancedGenerator, 'calculateEngagementMetrics').returns(mockMetrics);
      sinon.stub(generator.linkedinAPI, 'testConnection').resolves(true);
      sinon.stub(generator.linkedinAPI, 'createPost').resolves({ success: true, id: 'test-id' });

      await generator.generateFintechPost();

      expect(generator.enhancedGenerator.generateOptimizedPost.calledOnce).to.be.true;
      expect(generator.enhancedGenerator.generateImage.calledOnce).to.be.true;
      expect(generator.linkedinAPI.createPost.calledOnce).to.be.true;
    });

    it('should handle Michael Davis post selection', async () => {
      const mockReadline = generator.rl;
      
      // Mock user input sequence
      mockReadline.question.onFirstCall().callsArgWith(1, '1'); // Select random topic
      mockReadline.question.onSecondCall().callsArgWith(1, '1'); // Approve and post

      // Mock the Michael Davis generator
      const mockPostContent = {
        content: 'Test Michael Davis post content',
        metadata: { topic: 'Test Topic', category: 'realEstate' },
        image: { success: true, imagePath: '/test/image.png' }
      };

      sinon.stub(generator.michaelDavisGenerator, 'generatePost').resolves(mockPostContent);
      sinon.stub(generator.linkedinAPI, 'testConnection').resolves(true);
      sinon.stub(generator.linkedinAPI, 'createPost').resolves({ success: true, id: 'test-id' });

      await generator.generateMichaelDavisPost();

      expect(generator.michaelDavisGenerator.generatePost.calledOnce).to.be.true;
      expect(generator.linkedinAPI.createPost.calledOnce).to.be.true;
    });

    it('should handle education post selection', async () => {
      const mockReadline = generator.rl;
      
      // Mock user input sequence
      mockReadline.question.onFirstCall().callsArgWith(1, '1'); // Approve and post

      // Mock the education generator
      const mockPostContent = 'Test education post content';
      const mockImageResult = { success: true, imagePath: '/test/image.png' };
      const mockMetrics = { 
        engagementScore: 80, 
        estimatedViews: 800,
        metrics: {
          wordCount: 5,
          charCount: 25,
          emojiCount: 0,
          hasQuestion: false,
          hasCallToAction: true
        }
      };

      sinon.stub(generator.educationGenerator, 'generateEducationPost').resolves(mockPostContent);
      sinon.stub(generator.educationGenerator, 'generateImage').resolves(mockImageResult);
      sinon.stub(generator.enhancedGenerator, 'calculateEngagementMetrics').returns(mockMetrics);
      sinon.stub(generator.linkedinAPI, 'testConnection').resolves(true);
      sinon.stub(generator.linkedinAPI, 'createPost').resolves({ success: true, id: 'test-id' });

      await generator.generateEducationPost();

      expect(generator.educationGenerator.generateEducationPost.calledOnce).to.be.true;
      expect(generator.educationGenerator.generateImage.calledOnce).to.be.true;
      expect(generator.linkedinAPI.createPost.calledOnce).to.be.true;
    });
  });

  describe('Error Handling', () => {
    it('should handle LinkedIn API errors gracefully', async () => {
      const mockReadline = generator.rl;
      
      // Mock user input sequence
      mockReadline.question.onFirstCall().callsArgWith(1, '1'); // Approve and post

      const mockPostContent = 'Test post content';
      const mockImageResult = { success: true, imagePath: '/test/image.png' };
      const mockMetrics = { 
        engagementScore: 85, 
        estimatedViews: 1000,
        metrics: {
          wordCount: 4,
          charCount: 20,
          emojiCount: 0,
          hasQuestion: false,
          hasCallToAction: false
        }
      };

      sinon.stub(generator.enhancedGenerator, 'generateOptimizedPost').resolves(mockPostContent);
      sinon.stub(generator.enhancedGenerator, 'generateImage').resolves(mockImageResult);
      sinon.stub(generator.enhancedGenerator, 'calculateEngagementMetrics').returns(mockMetrics);
      sinon.stub(generator.linkedinAPI, 'testConnection').resolves(true);
      sinon.stub(generator.linkedinAPI, 'createPost').resolves({ success: false, error: 'API Error' });

      await generator.generateFintechPost();

      expect(generator.linkedinAPI.createPost.calledOnce).to.be.true;
    });

    it('should handle authentication failures', async () => {
      const mockReadline = generator.rl;
      
      // Mock user input sequence
      mockReadline.question.onFirstCall().callsArgWith(1, '1'); // Approve and post

      const mockPostContent = 'Test post content';
      const mockImageResult = { success: true, imagePath: '/test/image.png' };
      const mockMetrics = { 
        engagementScore: 85, 
        estimatedViews: 1000,
        metrics: {
          wordCount: 4,
          charCount: 20,
          emojiCount: 0,
          hasQuestion: false,
          hasCallToAction: false
        }
      };

      sinon.stub(generator.enhancedGenerator, 'generateOptimizedPost').resolves(mockPostContent);
      sinon.stub(generator.enhancedGenerator, 'generateImage').resolves(mockImageResult);
      sinon.stub(generator.enhancedGenerator, 'calculateEngagementMetrics').returns(mockMetrics);
      sinon.stub(generator.linkedinAPI, 'testConnection').resolves(false);
      sinon.stub(generator.linkedinAPI, 'createPost').resolves({ success: true, id: 'test-id' });

      await generator.generateFintechPost();

      expect(generator.linkedinAPI.testConnection.calledOnce).to.be.true;
      expect(generator.linkedinAPI.createPost.called).to.be.false;
    });
  });

  describe('Image Handling', () => {
    it('should handle posts with images correctly', async () => {
      const mockReadline = generator.rl;
      
      // Mock user input sequence
      mockReadline.question.onFirstCall().callsArgWith(1, '1'); // Approve and post

      const mockPostContent = 'Test post content';
      const mockImageResult = { 
        success: true, 
        imagePath: '/test/image.png',
        filename: 'test-image.png'
      };
      const mockMetrics = { 
        engagementScore: 85, 
        estimatedViews: 1000,
        metrics: {
          wordCount: 4,
          charCount: 20,
          emojiCount: 0,
          hasQuestion: false,
          hasCallToAction: false
        }
      };

      sinon.stub(generator.enhancedGenerator, 'generateOptimizedPost').resolves(mockPostContent);
      sinon.stub(generator.enhancedGenerator, 'generateImage').resolves(mockImageResult);
      sinon.stub(generator.enhancedGenerator, 'calculateEngagementMetrics').returns(mockMetrics);
      sinon.stub(generator.linkedinAPI, 'testConnection').resolves(true);
      sinon.stub(generator.linkedinAPI, 'createPost').resolves({ success: true, id: 'test-id' });

      await generator.generateFintechPost();

      const createPostCall = generator.linkedinAPI.createPost.getCall(0);
      expect(createPostCall.args[1]).to.equal('/test/image.png'); // imagePath should be passed
    });

    it('should handle posts without images correctly', async () => {
      const mockReadline = generator.rl;
      
      // Mock user input sequence
      mockReadline.question.onFirstCall().callsArgWith(1, '1'); // Approve and post

      const mockPostContent = 'Test post content';
      const mockImageResult = { success: false, error: 'Image generation failed' };
      const mockMetrics = { 
        engagementScore: 85, 
        estimatedViews: 1000,
        metrics: {
          wordCount: 4,
          charCount: 20,
          emojiCount: 0,
          hasQuestion: false,
          hasCallToAction: false
        }
      };

      sinon.stub(generator.enhancedGenerator, 'generateOptimizedPost').resolves(mockPostContent);
      sinon.stub(generator.enhancedGenerator, 'generateImage').resolves(mockImageResult);
      sinon.stub(generator.enhancedGenerator, 'calculateEngagementMetrics').returns(mockMetrics);
      sinon.stub(generator.linkedinAPI, 'testConnection').resolves(true);
      sinon.stub(generator.linkedinAPI, 'createPost').resolves({ success: true, id: 'test-id' });

      await generator.generateFintechPost();

      const createPostCall = generator.linkedinAPI.createPost.getCall(0);
      expect(createPostCall.args[1]).to.be.null; // imagePath should be null
    });
  });
}); 