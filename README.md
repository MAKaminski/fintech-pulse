# FintechPulse LinkedIn Agent

> **Project Organization Update (2024):**
> - All guides, profiles, data, and config files are now in their own folders for clarity.
> - The project root is intentionally kept clean for easy navigation and onboarding.
> - See `guides/` for documentation, `profiles/` for writing/persona profiles, `data/` for analytics and tokens, and `config/` for configuration files.
> - **NEW**: Comprehensive testing framework with Unit, Integration, and E2E tests
> - **NEW**: QED Investors content generator with investment-focused posts

---

## 🗂️ Directory Structure (2024 Refactor)

```
fintech-pulse/
  ├── src/
  │   ├── generators/
  │   │   ├── michael-davis/
  │   │   │   ├── generator.js
  │   │   │   └── cli.js
  │   │   ├── personal/
  │   │   │   └── generator.js
  │   │   ├── fintech/
  │   │   │   ├── generator.js
  │   │   │   ├── adaptive-generator.js
  │   │   │   └── simple-generator.js
  │   │   └── qed/                      # NEW: QED Investors generator
  │   │       └── generator.js
  │   ├── scrapers/
  │   │   ├── substack-scraper.js
  │   │   └── scrape-michael-davis.js
  │   ├── utils/
  │   │   ├── database.js
  │   │   ├── linkedin-api.js
  │   │   ├── linkedin-analytics.js
  │   │   ├── auto-optimize.js
  │   │   ├── test-connections.js
  │   │   ├── example-connections.js
  │   │   ├── enhanced-connections.js
  │   │   ├── linkedin-connections.js
  │   │   └── auth.js
  │   ├── dashboards/
  │   │   ├── analytics-dashboard.js
  │   │   └── enhanced-preview.js
  │   ├── cli/
  │   │   ├── unified-post-generator.js
  │   │   ├── analytics-cli.js
  │   │   ├── test-post.js
  │   │   ├── demo-integration.js
  │   │   ├── scheduler.js
  │   │   ├── connection-cli.js
  │   │   └── qed-generator.js          # NEW: QED CLI
  │   ├── web/
  │   │   ├── web-ui.js
  │   │   ├── simple-web-ui.js
  │   │   ├── preview-post.js
  │   │   └── view-images.js
  │   └── index.js
  ├── tests/                            # NEW: Comprehensive testing framework
  │   ├── unit/                         # Unit tests for individual components
  │   │   ├── generators/
  │   │   │   ├── fintech-generator.test.js
  │   │   │   └── qed-generator.test.js
  │   │   └── utils/
  │   │       └── database.test.js
  │   ├── integration/                  # Integration tests for workflows
  │   │   └── post-generation-flow.test.js
  │   ├── e2e/                          # End-to-end system tests
  │   │   └── full-system.test.js
  │   └── setup.js                      # Test configuration and mocks
  ├── profiles/
  │   ├── michael-davis-profile.md
  │   └── qed-profile.md                # NEW: QED Investors profile
  ├── data/
  │   ├── all-posts.json
  │   ├── connection_log.json
  │   └── mcp-structure.json            # NEW: Model Context Protocol structure
  ├── config/
  │   └── (configuration files)
  ├── guides/
  │   └── (documentation)
  ├── jest.config.js                    # NEW: Jest testing configuration
  ├── .env.test                         # NEW: Test environment variables
  ├── package.json
  ├── setup.js
  └── README.md
```

---

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Basic Usage
```bash
# Start the agent with scheduled posting
npm start

# Generate a single post
npm run generate-post

# NEW: Generate QED Investors post
npm run qed

# Preview generated content
npm run preview

# View analytics dashboard
npm run analytics

# Run comprehensive tests
npm test
```

---

## 🧪 Testing Framework

### NEW: Comprehensive Testing Suite

The project now includes a full testing framework with three levels of testing:

#### Unit Tests
```bash
npm run test:unit
```
- Test individual components in isolation
- Mock external dependencies
- Focus on function-level correctness
- Located in `tests/unit/`

#### Integration Tests
```bash
npm run test:integration
```
- Test component interactions
- Use in-memory database
- Verify data flow between modules
- Located in `tests/integration/`

#### End-to-End Tests
```bash
npm run test:e2e
```
- Test complete system workflows
- Simulate real user interactions
- Verify CLI commands and file operations
- Located in `tests/e2e/`

#### Test Coverage
```bash
npm run test:coverage
```
- Generate detailed coverage reports
- Target: 85% overall coverage
- Critical components: 90% coverage

---

## 🎯 Content Generators

### 1. FintechPulse Posts (Enhanced)
```bash
npm run generate-post
# Select option 1 for fintech posts
```
- Business and industry-focused content
- LinkedIn optimization
- Analytics integration
- Engagement scoring

### 2. Personal Branding Posts
```bash
npm run generate-post
# Select option 2 for personal posts
```
- Personal branding opportunities
- Career-focused content
- Professional development themes

### 3. Michael Davis Style (Economist)
```bash
npm run michael-davis
# or
npm run md
```
- Economic analysis style
- Data-driven insights
- Market commentary

### 4. Continuing Education
```bash
npm run generate-post
# Select option 4 for education posts
```
- Course recommendations
- Learning path suggestions
- Professional development

### 5. 🆕 QED Investors (Investment-Focused)
```bash
npm run qed
# or
npm run qed-post
```
- Venture capital perspective
- Investment insights and market analysis
- Portfolio company achievements
- Financial inclusion impact
- Fintech innovation trends
- **Includes image generation prompts**

---

## 🎯 QED Investors Generator Features

### Investment-Focused Content
The QED generator specializes in venture capital and investment content:

- **8 Content Themes**: From innovation trends to portfolio achievements
- **8 Focus Areas**: Digital banking, payments, lending, insurtech, etc.
- **Professional Tone**: Authoritative voice for VC industry
- **Global Perspective**: US, UK, Brazil, and emerging markets
- **Portfolio Integration**: References to Nubank, Credit Karma, Flutterwave, SoFi, etc.

### Usage Examples
```bash
# Interactive QED generator
npm run qed

# Quick QED post via unified generator
npm run generate-post
# Select option 5 for QED posts

# Test QED functionality
npm run test:unit -- --testPathPattern=qed
```

### Sample QED Post Output
```
🚀 Exciting developments in the fintech space! 

QED Investors is thrilled to see the continued innovation in digital banking 
infrastructure. Our portfolio company Nubank continues to lead the charge in 
financial inclusion across Latin America. 💳

The embedded finance revolution is transforming how businesses integrate 
financial services. What trends are you most excited about in fintech? 🤖

#QEDInvestors #Fintech #VentureCapital #Investment #DigitalBanking
```

---

## 📊 Analytics & Optimization

### Performance Tracking
- Post engagement scoring (0-10 scale)
- Character and word count optimization
- Hashtag relevance analysis
- LinkedIn algorithm optimization

### Analytics Commands
```bash
npm run analytics              # View analytics dashboard
npm run analytics-report       # Generate detailed report
npm run auto-optimize          # AI-powered optimization suggestions
```

---

## 🔧 Development & Testing

### Development Workflow
```bash
# Development mode with auto-reload
npm run dev

# Preview posts before publishing
npm run preview
npm run preview-multiple

# Enhanced preview with analytics
npm run enhanced-preview
```

### Testing Workflow
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Generate coverage report
npm run test:coverage

# Run CI-friendly tests
npm run test:ci
```

### Quality Assurance
- **Test Coverage Target**: 85% overall, 90% for critical components
- **Performance Standards**: <30s generation time, <1s database ops
- **Code Quality**: ESLint, Prettier, JSDoc documentation
- **Continuous Integration**: Automated testing on every commit

---

## 🌐 Web Interfaces

### Simple Web UI
```bash
npm run simple-ui
```
- Clean, minimal interface
- Quick post generation
- Real-time preview

### Enhanced Dashboard
```bash
npm run dashboard
```
- Advanced analytics
- Multiple generator access
- Performance metrics

### Image Viewer
```bash
npm run view-images
```
- Browse generated image prompts
- Visual content management

---

## 🔗 LinkedIn Integration

### Authentication
```bash
npm run auth
```
- OAuth setup for LinkedIn API
- Secure token management
- Connection testing

### Connection Management
```bash
npm run connections          # Interactive connection manager
npm run connect             # Quick connect mode
npm run campaign            # Connection campaigns
npm run test-connections    # Test connection functionality
```

---

## 📁 Data Organization (MCP Structure)

The project follows a Model Context Protocol (MCP) structure for organized data management:

### Data Categories
- **Test Data**: `tests/` - Comprehensive testing framework
- **Content Data**: `data/` - Posts, analytics, connections
- **Profile Data**: `profiles/` - Content personas and brand guidelines
- **Configuration**: `config/` - Application settings and API configurations

### MCP Benefits
- **Organized Structure**: Clear separation of concerns
- **Scalable Architecture**: Easy to extend and maintain
- **Testing Integration**: Seamless test data management
- **Version Control**: Tracked changes and data evolution

---

## 🎪 Advanced Features

### Adaptive Content Generation
```bash
npm run adaptive-preview
```
- AI-powered content adaptation
- Audience-specific optimization
- Performance-based learning

### Auto-Optimization
```bash
npm run auto-optimize
```
- Machine learning insights
- Performance pattern analysis
- Automated improvement suggestions

### Demo Integration
```bash
npm run demo-integration
```
- Full workflow demonstration
- Integration testing
- Feature showcases

---

## 🏗️ Architecture

### Generator Pattern
Each content type has its own specialized generator:
- **Modular Design**: Independent, reusable components
- **Consistent Interface**: Standardized generation methods
- **Extensible Framework**: Easy to add new generators
- **Testing Support**: Comprehensive test coverage for each generator

### Database Layer
- **SQLite Backend**: Lightweight, file-based storage
- **Analytics Integration**: Built-in performance tracking
- **Migration Support**: Schema evolution and data integrity
- **Test-Friendly**: In-memory database for testing

### API Integration
- **LinkedIn API**: OAuth-based authentication and posting
- **OpenAI API**: AI-powered content generation
- **Rate Limiting**: Respectful API usage patterns
- **Error Handling**: Graceful degradation and retry logic

---

## 📋 Configuration

### Environment Variables
```bash
# Copy and customize environment file
cp .env.example .env

# Required variables:
OPENAI_API_KEY=your_openai_api_key
LINKEDIN_ACCESS_TOKEN=your_linkedin_token
```

### Agent Configuration
Edit `config/config.js` for:
- Agent personality and style
- Target audience settings
- Posting schedule configuration
- Content optimization parameters

---

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run tests: `npm test`
5. Start development: `npm run dev`

### Testing Guidelines
- Write unit tests for all new functions
- Add integration tests for new workflows
- Update E2E tests for new CLI commands
- Maintain >85% test coverage

### Code Standards
- Follow existing code style
- Add JSDoc documentation
- Write descriptive commit messages
- Test all changes before submitting

---

## 📚 Documentation

### Guides
- `guides/` - Detailed documentation and tutorials
- `profiles/` - Content strategy and persona guidelines
- `data/mcp-structure.json` - Complete project organization reference

### API Documentation
- Function-level JSDoc comments
- Module usage examples
- Integration patterns and best practices

---

## 🔮 Future Roadmap

### Planned Features
- Advanced A/B testing framework
- Real-time performance monitoring
- Multi-platform posting support (Twitter, Medium)
- AI-powered content optimization
- Advanced analytics dashboard

### Testing Enhancements
- Performance testing under load
- Security testing for API integrations
- Accessibility testing for web UI
- Cross-browser compatibility tests

---

## 📞 Support

### Getting Help
- Check the `guides/` directory for detailed documentation
- Review test files for usage examples
- Run `npm run help` for command reference
- Use `npm run demo-integration` for feature demonstration

### Troubleshooting
- Verify environment variables are set correctly
- Check LinkedIn API credentials and permissions
- Run `npm run test` to verify system integrity
- Review logs in the console output

---

**Ready to generate amazing fintech content with comprehensive testing! 🚀** 