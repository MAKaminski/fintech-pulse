const { expect } = require('chai');

describe('Testing Setup', () => {
  it('should have chai expect available', () => {
    expect(expect).to.be.a('function');
  });

  it('should have sinon available', () => {
    expect(sinon).to.be.a('object');
  });

  it('should have test environment variables set', () => {
    expect(process.env.NODE_ENV).to.equal('test');
    expect(process.env.OPENAI_API_KEY).to.equal('test-openai-key');
  });

  it('should have test utilities available', () => {
    expect(createMockResponse).to.be.a('function');
    expect(createMockError).to.be.a('function');
  });

  it('should create mock responses correctly', () => {
    const mockResponse = createMockResponse({ test: 'data' });
    expect(mockResponse.data.test).to.equal('data');
    expect(mockResponse.status).to.equal(200);
  });

  it('should create mock errors correctly', () => {
    const mockError = createMockError('Test error', 500);
    expect(mockError.message).to.equal('Test error');
    expect(mockError.response.status).to.equal(500);
  });
}); 