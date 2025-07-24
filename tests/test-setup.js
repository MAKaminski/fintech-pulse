const chai = require('chai');
const sinon = require('sinon');

// Configure chai (sinon-chai is optional)
try {
  const sinonChai = require('sinon-chai');
  chai.use(sinonChai);
} catch (error) {
  // sinon-chai not available, continue without it
  console.log('sinon-chai not available, continuing without it');
}

// Global test configuration
global.expect = chai.expect;
global.sinon = sinon;

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.LINKEDIN_CLIENT_ID = 'test-linkedin-client-id';
process.env.LINKEDIN_CLIENT_SECRET = 'test-linkedin-client-secret';

// Suppress console output during tests unless explicitly needed
if (process.env.NODE_ENV === 'test') {
  // Don't suppress console for now to see what's happening
  // console.log = () => {};
  // console.error = () => {};
  // console.warn = () => {};
}

// Test utilities
global.createMockResponse = (data = {}) => ({
  data,
  status: 200,
  headers: {}
});

global.createMockError = (message = 'Test error', status = 500) => ({
  message,
  response: {
    data: { message, status },
    status
  }
});

// Cleanup after each test - only if mocha hooks are available
if (typeof afterEach === 'function') {
  afterEach(() => {
    sinon.restore();
  });
} 