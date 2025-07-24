const { expect } = require('chai');
const sinon = require('sinon');
const ContinuingEducationGenerator = require('../../../src/generators/education/generator');

describe('ContinuingEducationGenerator', () => {
  let generator;
  let openaiStub;

  beforeEach(() => {
    generator = new ContinuingEducationGenerator();
    openaiStub = sinon.stub(generator.openai.chat.completions, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('generateEducationPost', () => {
    it('should generate education post with random course', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Just finished MIT 6.006. Used the algorithms to optimize a data pipeline for a fintech project here in Atlanta.'
          }
        }]
      };
      openaiStub.resolves(mockResponse);

      const result = await generator.generateEducationPost();

      expect(result).to.be.a('string');
      expect(result).to.include('MIT');
      expect(result).to.include('Atlanta');
      expect(openaiStub.calledOnce).to.be.true;
    });

    it('should handle API errors gracefully', async () => {
      openaiStub.rejects(new Error('API Error'));

      const result = await generator.generateEducationPost();

      expect(result).to.include('Finished');
      expect(result).to.include('Atlanta');
    });
  });

  describe('generateImage', () => {
    it('should generate image for education post', async () => {
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

      const postContent = 'Test education content';
      const result = await generator.generateImage(postContent);

      expect(result.success).to.be.true;
      expect(result.filename).to.match(/education-.*\.png/);
      expect(imageStub.calledOnce).to.be.true;
      expect(axiosStub.calledOnce).to.be.true;
      expect(fsStub.calledOnce).to.be.true;
    });

    it('should handle image generation errors', async () => {
      const imageStub = sinon.stub(generator.openai.images, 'generate').rejects(new Error('Image generation failed'));

      const postContent = 'Test education content';
      const result = await generator.generateImage(postContent);

      expect(result.success).to.be.false;
      expect(result.error).to.include('Image generation failed');
    });
  });

  describe('generateImagePrompt', () => {
    it('should generate appropriate image prompt', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Professional education and learning environment with modern design elements'
          }
        }]
      };
      openaiStub.resolves(mockResponse);

      const postContent = 'Test education post about algorithms';
      const result = await generator.generateImagePrompt(postContent);

      expect(result).to.be.a('string');
      expect(result.length).to.be.greaterThan(0);
    });
  });

  describe('getRandomCourse', () => {
    it('should return a valid course from the list', () => {
      const ContinuingEducationGenerator = require('../../../src/generators/education/generator');
      const course = ContinuingEducationGenerator.getRandomCourse();
      
      expect(course).to.have.property('institution');
      expect(course).to.have.property('title');
      expect(course).to.have.property('focus');
      expect(course).to.have.property('link');
      
      // Verify it's one of the expected courses
      const expectedInstitutions = ['MIT OCW', 'MITx (edX)', 'MIT OCW / MITx (edX)', 'Stanford University', 'HarvardX (Harvard University, edX)', 'HBS Online (Harvard Business School)'];
      expect(expectedInstitutions).to.include(course.institution);
    });
  });
}); 