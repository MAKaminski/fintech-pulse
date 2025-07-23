// Test setup and global mocks
require('dotenv').config({ path: '.env.test' });

// Mock OpenAI API
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Mock AI response for testing'
            }
          }]
        })
      }
    }
  }));
});

// Mock database operations
jest.mock('../src/utils/database', () => {
  return jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(true),
    savePost: jest.fn().mockResolvedValue({ id: 1 }),
    getRecentPosts: jest.fn().mockResolvedValue([]),
    updatePostAnalytics: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true)
  }));
});

// Mock LinkedIn API
jest.mock('../src/utils/linkedin-api', () => {
  return jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(true),
    postContent: jest.fn().mockResolvedValue({ success: true, id: 'mock-post-id' }),
    getAnalytics: jest.fn().mockResolvedValue({ likes: 10, comments: 5, shares: 2 })
  }));
});

// Mock file system operations for tests
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn().mockReturnValue('{}'),
  existsSync: jest.fn().mockReturnValue(true)
}));

// Global test helpers
global.mockDate = (dateString) => {
  const mockDate = new Date(dateString);
  jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
};

global.restoreDate = () => {
  Date.now.mockRestore?.();
  global.Date.mockRestore?.();
};

// Console spy helpers
global.silenceConsole = () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
};

global.restoreConsole = () => {
  console.log.mockRestore?.();
  console.error.mockRestore?.();
  console.warn.mockRestore?.();
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  restoreDate();
  restoreConsole();
});