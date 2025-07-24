#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Test configuration
const testConfig = {
  unit: {
    pattern: 'tests/unit/**/*.test.js',
    timeout: 10000,
    description: 'Unit Tests'
  },
  integration: {
    pattern: 'tests/integration/**/*.test.js',
    timeout: 15000,
    description: 'Integration Tests'
  },
  e2e: {
    pattern: 'tests/e2e/**/*.test.js',
    timeout: 30000,
    description: 'End-to-End Tests'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTestSuite(suiteName, config) {
  return new Promise((resolve, reject) => {
    log(`\n${colors.bright}Running ${config.description}...${colors.reset}`, 'cyan');
    
    const mochaProcess = spawn('npx', [
      'mocha',
      config.pattern,
      '--timeout', config.timeout.toString(),
      '--reporter', 'spec',
      '--colors',
      '--require', 'tests/test-setup.js'
    ], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    mochaProcess.on('close', (code) => {
      if (code === 0) {
        log(`✅ ${config.description} passed!`, 'green');
        resolve();
      } else {
        log(`❌ ${config.description} failed with code ${code}`, 'red');
        reject(new Error(`${config.description} failed with code ${code}`));
      }
    });

    mochaProcess.on('error', (error) => {
      log(`❌ Error running ${config.description}: ${error.message}`, 'red');
      reject(error);
    });
  });
}

async function runAllTests() {
  const startTime = Date.now();
  log(`${colors.bright}🚀 Starting FintechPulse Test Suite${colors.reset}`, 'magenta');
  log(`📁 Test directory: ${path.resolve('tests')}`, 'blue');
  
  try {
    // Run unit tests first
    await runTestSuite('unit', testConfig.unit);
    
    // Run integration tests
    await runTestSuite('integration', testConfig.integration);
    
    // Run e2e tests last
    await runTestSuite('e2e', testConfig.e2e);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log(`\n${colors.bright}🎉 All tests passed!${colors.reset}`, 'green');
    log(`⏱️  Total duration: ${duration}s`, 'blue');
    
  } catch (error) {
    log(`\n${colors.bright}💥 Test suite failed!${colors.reset}`, 'red');
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const testType = args[0];

if (testType && testConfig[testType]) {
  // Run specific test type
  runTestSuite(testType, testConfig[testType])
    .then(() => {
      log(`\n✅ ${testConfig[testType].description} completed successfully!`, 'green');
    })
    .catch((error) => {
      log(`\n❌ ${testConfig[testType].description} failed: ${error.message}`, 'red');
      process.exit(1);
    });
} else if (testType) {
  log(`❌ Unknown test type: ${testType}`, 'red');
  log(`Available types: ${Object.keys(testConfig).join(', ')}`, 'yellow');
  process.exit(1);
} else {
  // Run all tests
  runAllTests();
} 