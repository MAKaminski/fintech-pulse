const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const MichaelDavisGenerator = require('../../../src/generators/michael-davis/generator');

describe('MichaelDavisGenerator', () => {
  let generator;
  let openaiStub;
  let fsStub;

  beforeEach(() => {
    generator = new MichaelDavisGenerator();
    openaiStub = sinon.stub(generator.openai.chat.completions, 'create');
    fsStub = sinon.stub(fs, 'readFileSync').returns('# Michael Davis Profile\nTest profile content');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('loadProfile', () => {
    it('should load profile from file', () => {
      const profile = generator.loadProfile();
      expect(profile).to.include('Michael Davis Profile');
      expect(fsStub.calledOnce).to.be.true;
    });

    it('should handle file read errors', () => {
      fsStub.throws(new Error('File not found'));
      const profile = generator.loadProfile();
      expect(profile).to.equal('');
    });
  });

  describe('generatePost', () => {
    it('should generate post with proper structure', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'This is a Michael Davis style post about Atlanta real estate.'
          }
        }]
      };
      const mockImageResponse = {
        data: [{
          url: 'https://example.com/image.png'
        }]
      };

      openaiStub.onFirstCall().resolves(mockResponse);
      openaiStub.onSecondCall().resolves({ choices: [{ message: { content: 'Image prompt' } }] });
      
      const imageStub = sinon.stub(generator.openai.images, 'generate').resolves(mockImageResponse);
      const axiosStub = sinon.stub(require('axios'), 'get').resolves({ data: Buffer.from('fake-image') });
      const writeFileStub = sinon.stub(fs, 'writeFileSync');

      const result = await generator.generatePost();

      expect(result.content).to.include('Michael Davis style post');
      expect(result.metadata.topic).to.be.a('string');
      expect(result.metadata.category).to.be.a('string');
      expect(result.image.success).to.be.true;
    });

    it('should handle API errors gracefully', async () => {
      openaiStub.rejects(new Error('API Error'));

      try {
        await generator.generatePost();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('API Error');
      }
    });
  });

  describe('generateTopicSpecificPost', () => {
    it('should generate topic-specific post', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'South Downtown development insights.'
          }
        }]
      };
      const mockImageResponse = {
        data: [{
          url: 'https://example.com/image.png'
        }]
      };

      openaiStub.onFirstCall().resolves(mockResponse);
      openaiStub.onSecondCall().resolves({ choices: [{ message: { content: 'Image prompt' } }] });
      
      const imageStub = sinon.stub(generator.openai.images, 'generate').resolves(mockImageResponse);
      const axiosStub = sinon.stub(require('axios'), 'get').resolves({ data: Buffer.from('fake-image') });
      const writeFileStub = sinon.stub(fs, 'writeFileSync');

      const result = await generator.generateTopicSpecificPost('South Downtown development');

      expect(result.content).to.include('South Downtown');
      expect(result.metadata.topic).to.equal('South Downtown development');
      expect(result.image.success).to.be.true;
    });
  });

  describe('formatPost', () => {
    it('should format post correctly', () => {
      const content = 'This is a **bold** post with *italic* text and # headers';
      const topic = 'Test Topic';
      
      const result = generator.formatPost(content, topic);
      
      expect(result.content).to.not.include('**');
      expect(result.content).to.not.include('*');
      expect(result.content).to.not.include('#');
      expect(result.metadata.topic).to.equal('Test Topic');
      expect(result.metadata.timestamp).to.be.a('string');
    });

    it('should handle object topics', () => {
      const content = 'Test content';
      const topic = { category: 'realEstate', topic: 'Atlanta Housing' };
      
      const result = generator.formatPost(content, topic);
      
      expect(result.metadata.topic).to.equal('Atlanta Housing');
      expect(result.metadata.category).to.equal('realEstate');
    });
  });

  describe('getAvailableTopics', () => {
    it('should return all available topics', () => {
      const topics = generator.getAvailableTopics();
      
      expect(topics).to.have.property('realEstate');
      expect(topics).to.have.property('investment');
      expect(topics).to.have.property('technology');
      expect(topics).to.have.property('policy');
      expect(topics).to.have.property('personalDevelopment');
      
      expect(topics.realEstate).to.be.an('array');
      expect(topics.investment).to.be.an('array');
    });
  });
}); 