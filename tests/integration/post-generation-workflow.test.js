const { expect } = require('chai');
const sinon = require('sinon');
const UnifiedPostGenerator = require('../../src/cli/unified-post-generator');
const EnhancedContentGenerator = require('../../src/generators/fintech/generator');
const MichaelDavisGenerator = require('../../src/generators/michael-davis/generator');
const ContinuingEducationGenerator = require('../../src/generators/education/generator');
const LinkedInAPI = require('../../src/utils/linkedin-api');

describe('Post Generation Workflow Integration', () => {
  let unifiedGenerator;
  let consoleStub;

  beforeEach(async () => {
    unifiedGenerator = new UnifiedPostGenerator();
    consoleStub = sinon.stub(console, 'log');
    
    // Initialize database
    await unifiedGenerator.initialize();
    
    // Mock database methods
    sinon.stub(unifiedGenerator.database, 'getNextPostNumber').resolves(1);
    sinon.stub(unifiedGenerator.database, 'savePost').resolves();
    
    // Mock readline to prevent hanging
    const mockReadline = {
      question: sinon.stub().callsArgWith(1, '1'), // Default to approve and post
      close: sinon.stub()
    };
    unifiedGenerator.rl = mockReadline;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Complete FintechPulse Workflow', () => {
    it('should generate, analyze, and prepare fintech post for posting', async () => {
      // Mock the generators
      const mockPostContent = '🚀 FintechPulse: The future of banking is here!';
      const mockImageResult = { 
        success: true, 
        imagePath: '/test/fintech-image.png',
        filename: 'fintech-pulse-test.png'
      };
      const mockMetrics = { 
        engagementScore: 85, 
        estimatedViews: 1000,
        metrics: {
          wordCount: 10,
          charCount: 50,
          emojiCount: 2,
          hasQuestion: true,
          hasCallToAction: true
        }
      };

      sinon.stub(unifiedGenerator.enhancedGenerator, 'generateOptimizedPost').resolves(mockPostContent);
      sinon.stub(unifiedGenerator.enhancedGenerator, 'generateImage').resolves(mockImageResult);
      sinon.stub(unifiedGenerator.enhancedGenerator, 'calculateEngagementMetrics').returns(mockMetrics);

      // Test the complete workflow
      await unifiedGenerator.generateFintechPost();

      expect(unifiedGenerator.enhancedGenerator.generateOptimizedPost.calledOnce).to.be.true;
      expect(unifiedGenerator.enhancedGenerator.generateImage.calledOnce).to.be.true;
      expect(unifiedGenerator.enhancedGenerator.calculateEngagementMetrics.calledOnce).to.be.true;
    });
  });

  describe('Complete Michael Davis Workflow', () => {
    it('should generate, analyze, and prepare Michael Davis post for posting', async () => {
      // Mock the Michael Davis generator
      const mockPostContent = {
        content: 'South Downtown development insights from a local perspective.',
        metadata: { 
          topic: 'South Downtown development', 
          category: 'realEstate',
          timestamp: new Date().toISOString()
        },
        image: { 
          success: true, 
          imagePath: '/test/michael-davis-image.png',
          filename: 'michael-davis-test.png'
        }
      };

      sinon.stub(unifiedGenerator.michaelDavisGenerator, 'generatePost').resolves(mockPostContent);

      // Test the complete workflow
      await unifiedGenerator.generateMichaelDavisPost();

      expect(unifiedGenerator.michaelDavisGenerator.generatePost.calledOnce).to.be.true;
    });
  });

  describe('Complete Education Workflow', () => {
    it('should generate, analyze, and prepare education post for posting', async () => {
      // Mock the education generator
      const mockPostContent = 'Just finished MIT 6.006. Applied algorithms to optimize our Atlanta fintech pipeline.';
      const mockImageResult = { 
        success: true, 
        imagePath: '/test/education-image.png',
        filename: 'education-test.png'
      };
      const mockMetrics = { 
        engagementScore: 80, 
        estimatedViews: 800,
        metrics: {
          wordCount: 15,
          charCount: 120,
          emojiCount: 0,
          hasQuestion: false,
          hasCallToAction: true
        }
      };

      sinon.stub(unifiedGenerator.educationGenerator, 'generateEducationPost').resolves(mockPostContent);
      sinon.stub(unifiedGenerator.educationGenerator, 'generateImage').resolves(mockImageResult);
      sinon.stub(unifiedGenerator.enhancedGenerator, 'calculateEngagementMetrics').returns(mockMetrics);

      // Test the complete workflow
      await unifiedGenerator.generateEducationPost();

      expect(unifiedGenerator.educationGenerator.generateEducationPost.calledOnce).to.be.true;
      expect(unifiedGenerator.educationGenerator.generateImage.calledOnce).to.be.true;
      expect(unifiedGenerator.enhancedGenerator.calculateEngagementMetrics.calledOnce).to.be.true;
    });
  });

  describe('LinkedIn Integration', () => {
    it('should handle successful LinkedIn posting with image', async () => {
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

      sinon.stub(unifiedGenerator.enhancedGenerator, 'generateOptimizedPost').resolves(mockPostContent);
      sinon.stub(unifiedGenerator.enhancedGenerator, 'generateImage').resolves(mockImageResult);
      sinon.stub(unifiedGenerator.enhancedGenerator, 'calculateEngagementMetrics').returns(mockMetrics);
      sinon.stub(unifiedGenerator.linkedinAPI, 'testConnection').resolves(true);
      sinon.stub(unifiedGenerator.linkedinAPI, 'createPost').resolves({ success: true, id: 'test-post-id' });

      await unifiedGenerator.generateFintechPost();

      expect(unifiedGenerator.linkedinAPI.createPost.calledOnce).to.be.true;
      const createPostCall = unifiedGenerator.linkedinAPI.createPost.getCall(0);
      expect(createPostCall.args[0]).to.equal(mockPostContent);
      expect(createPostCall.args[1]).to.equal('/test/image.png');
    });

    it('should handle LinkedIn authentication failures', async () => {
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

      sinon.stub(unifiedGenerator.enhancedGenerator, 'generateOptimizedPost').resolves(mockPostContent);
      sinon.stub(unifiedGenerator.enhancedGenerator, 'generateImage').resolves(mockImageResult);
      sinon.stub(unifiedGenerator.enhancedGenerator, 'calculateEngagementMetrics').returns(mockMetrics);
      sinon.stub(unifiedGenerator.linkedinAPI, 'testConnection').resolves(false);
      sinon.stub(unifiedGenerator.linkedinAPI, 'createPost').resolves({ success: true, id: 'test-id' });

      await unifiedGenerator.generateFintechPost();

      expect(unifiedGenerator.linkedinAPI.testConnection.calledOnce).to.be.true;
      expect(unifiedGenerator.linkedinAPI.createPost.called).to.be.false;
    });
  });

  describe('Database Integration', () => {
    it('should save post data to database after successful posting', async () => {
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

      sinon.stub(unifiedGenerator.enhancedGenerator, 'generateOptimizedPost').resolves(mockPostContent);
      sinon.stub(unifiedGenerator.enhancedGenerator, 'generateImage').resolves(mockImageResult);
      sinon.stub(unifiedGenerator.enhancedGenerator, 'calculateEngagementMetrics').returns(mockMetrics);
      sinon.stub(unifiedGenerator.linkedinAPI, 'testConnection').resolves(true);
      sinon.stub(unifiedGenerator.linkedinAPI, 'createPost').resolves({ success: true, id: 'test-post-id' });

      await unifiedGenerator.generateFintechPost();

      expect(unifiedGenerator.database.savePost.calledOnce).to.be.true;
      const savePostCall = unifiedGenerator.database.savePost.getCall(0);
      expect(savePostCall.args[0]).to.include({
        content: mockPostContent,
        imagePath: '/test/image.png',
        postType: 'fintech',
        postDecision: 'posted',
        linkedinPostId: 'test-post-id'
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle generator failures gracefully', async () => {
      sinon.stub(unifiedGenerator.enhancedGenerator, 'generateOptimizedPost').rejects(new Error('Generator failed'));

      try {
        await unifiedGenerator.generateFintechPost();
      } catch (error) {
        expect(error.message).to.include('Generator failed');
      }
    });

    it('should handle image generation failures gracefully', async () => {
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

      sinon.stub(unifiedGenerator.enhancedGenerator, 'generateOptimizedPost').resolves(mockPostContent);
      sinon.stub(unifiedGenerator.enhancedGenerator, 'generateImage').resolves(mockImageResult);
      sinon.stub(unifiedGenerator.enhancedGenerator, 'calculateEngagementMetrics').returns(mockMetrics);
      sinon.stub(unifiedGenerator.linkedinAPI, 'testConnection').resolves(true);
      sinon.stub(unifiedGenerator.linkedinAPI, 'createPost').resolves({ success: true, id: 'test-post-id' });

      await unifiedGenerator.generateFintechPost();

      // Should still post successfully even without image
      expect(unifiedGenerator.linkedinAPI.createPost.calledOnce).to.be.true;
      const createPostCall = unifiedGenerator.linkedinAPI.createPost.getCall(0);
      expect(createPostCall.args[1]).to.be.null; // No image path
    });
  });

  describe('Content Analysis Integration', () => {
    it('should analyze post content and provide metrics', async () => {
      const mockPostContent = '🚀 FintechPulse: The future of banking is here! What do you think?';
      const mockImageResult = { success: true, imagePath: '/test/image.png' };
      const mockMetrics = { 
        engagementScore: 85, 
        estimatedViews: 1000,
        metrics: {
          wordCount: 12,
          charCount: 60,
          emojiCount: 2,
          hasQuestion: true,
          hasCallToAction: true
        }
      };

      sinon.stub(unifiedGenerator.enhancedGenerator, 'generateOptimizedPost').resolves(mockPostContent);
      sinon.stub(unifiedGenerator.enhancedGenerator, 'generateImage').resolves(mockImageResult);
      sinon.stub(unifiedGenerator.enhancedGenerator, 'calculateEngagementMetrics').returns(mockMetrics);

      await unifiedGenerator.generateFintechPost();

      expect(unifiedGenerator.enhancedGenerator.calculateEngagementMetrics.calledOnce).to.be.true;
      const metricsCall = unifiedGenerator.enhancedGenerator.calculateEngagementMetrics.getCall(0);
      expect(metricsCall.args[0]).to.equal(mockPostContent);
    });
  });
}); 