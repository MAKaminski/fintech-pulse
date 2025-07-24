# Testing Documentation

This document outlines the comprehensive testing strategy for the FintechPulse LinkedIn content generation tool.

## Test Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── generators/         # Content generator tests
│   ├── utils/             # Utility function tests
│   └── cli/               # CLI component tests
├── integration/            # Integration tests for component interactions
├── e2e/                   # End-to-end workflow tests
├── fixtures/              # Test data and mock files
├── test-setup.js          # Global test configuration
├── mocha.opts             # Mocha test runner configuration
└── README.md              # This file
```

## Test Types

### 1. Unit Tests
- **Purpose**: Test individual functions and classes in isolation
- **Coverage**: 100% of core business logic
- **Location**: `tests/unit/`
- **Examples**:
  - Content generator methods
  - LinkedIn API wrapper functions
  - Database operations
  - Image generation utilities

### 2. Integration Tests
- **Purpose**: Test interactions between components
- **Coverage**: All major component interactions
- **Location**: `tests/integration/`
- **Examples**:
  - Unified post generator workflow
  - Database integration with generators
  - API integration with content generation

### 3. End-to-End Tests
- **Purpose**: Test complete user workflows
- **Coverage**: Full user journeys from CLI to LinkedIn posting
- **Location**: `tests/e2e/`
- **Examples**:
  - Complete post generation and posting flow
  - Error handling in real scenarios
  - Image generation and attachment

## Running Tests

### Prerequisites
```bash
npm install
```

### Test Commands
```bash
# Run all tests
npm run test:all

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # End-to-end tests only

# Run with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Individual Test Files
```bash
# Run specific test file
npx mocha tests/unit/generators/fintech-generator.test.js

# Run tests with verbose output
npx mocha tests/unit/generators/fintech-generator.test.js --reporter spec
```

## Test Coverage Requirements

- **Lines**: 80% minimum
- **Functions**: 80% minimum
- **Branches**: 80% minimum
- **Statements**: 80% minimum

## Mocking Strategy

### External APIs
- **OpenAI API**: Mocked with sinon stubs
- **LinkedIn API**: Mocked responses for all endpoints
- **File System**: Mocked for image operations

### Environment Variables
- Test environment variables set in `test-setup.js`
- No real API calls during testing
- Isolated test database

## Test Data

### Fixtures
- Sample LinkedIn posts
- Mock API responses
- Test images
- Database schemas

### Test Utilities
- `createMockResponse()`: Create mock API responses
- `createMockError()`: Create mock error objects
- Global sinon configuration

## Best Practices

### Writing Tests
1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear test descriptions
3. **Isolation**: Each test should be independent
4. **Mocking**: Mock external dependencies
5. **Error Cases**: Test both success and failure scenarios

### Test Organization
1. **Group Related Tests**: Use describe blocks effectively
2. **Setup/Teardown**: Use beforeEach/afterEach appropriately
3. **Shared State**: Avoid shared state between tests
4. **Cleanup**: Always clean up mocks and stubs

### Performance
1. **Fast Execution**: Unit tests should run quickly
2. **Parallel Execution**: Tests should be able to run in parallel
3. **Resource Management**: Clean up resources after tests

## Continuous Integration

### GitHub Actions
- Run tests on every push
- Generate coverage reports
- Fail builds on test failures
- Upload coverage to Codecov

### Pre-commit Hooks
- Run unit tests before commits
- Check code coverage
- Lint code quality

## Debugging Tests

### Common Issues
1. **Async/Await**: Ensure proper async test handling
2. **Mock Cleanup**: Reset mocks between tests
3. **Environment**: Check test environment variables
4. **File Paths**: Use absolute paths for file operations

### Debug Commands
```bash
# Run tests with debug output
DEBUG=* npm run test:unit

# Run single test with verbose output
npx mocha tests/unit/generators/fintech-generator.test.js --reporter spec --timeout 30000
```

## Test Maintenance

### Regular Tasks
1. **Update Mocks**: Keep mocks in sync with API changes
2. **Review Coverage**: Ensure coverage targets are met
3. **Refactor Tests**: Keep tests clean and maintainable
4. **Update Dependencies**: Keep testing dependencies current

### Adding New Tests
1. **Follow Naming Convention**: `*.test.js`
2. **Place in Correct Directory**: Unit/integration/e2e
3. **Add to Coverage**: Ensure new code is tested
4. **Update Documentation**: Document new test scenarios

## Troubleshooting

### Test Failures
1. **Check Environment**: Verify test environment setup
2. **Review Mocks**: Ensure mocks are properly configured
3. **Check Async**: Verify async/await usage
4. **Review Dependencies**: Check for dependency conflicts

### Performance Issues
1. **Optimize Mocks**: Use efficient mocking strategies
2. **Parallel Execution**: Enable parallel test execution
3. **Resource Cleanup**: Ensure proper cleanup
4. **Test Isolation**: Avoid shared state

## Future Enhancements

### Planned Improvements
1. **Visual Regression Tests**: For image generation
2. **Performance Tests**: For API response times
3. **Load Tests**: For concurrent operations
4. **Security Tests**: For API key handling

### Test Automation
1. **Auto-generate Tests**: For new generators
2. **Test Templates**: Standardize test structure
3. **Coverage Alerts**: Automated coverage reporting
4. **Test Metrics**: Track test quality metrics 