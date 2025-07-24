const { expect } = require('chai');

describe('Basic Test', () => {
  it('should work', () => {
    expect(true).to.be.true;
  });

  it('should have chai available', () => {
    expect(expect).to.be.a('function');
  });
}); 