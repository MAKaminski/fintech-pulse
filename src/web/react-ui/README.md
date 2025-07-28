# FintechPulse React UI

A modern, interactive web interface for the FintechPulse LinkedIn content generation tool.

## Features

### 🎯 Interactive Workflow
- **Post Type Selection**: Choose from 6 specialized content generators
- **Custom Prompts**: Input your own prompts for freestyle posts
- **Real-time Generation**: Watch as AI creates content, images, and metrics
- **Preview & Confirm**: See exactly how your post will appear on LinkedIn
- **One-click Publishing**: Post directly to LinkedIn with a single click

### 📊 Content Types
1. **FintechPulse Post** - Business/Industry focused content
2. **Personal Post** - Personal branding and opportunities
3. **Michael Davis Post** - Economist style with data-driven insights
4. **Continuing Education Post** - Course recommendations and learning
5. **QED Investors Post** - Investment and VC focused content
6. **Freestyle Post** - Custom content from your prompts

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Feedback**: Loading states, progress indicators, and animations
- **LinkedIn Preview**: See exactly how your post will look
- **Engagement Metrics**: View performance predictions and optimization tips
- **Image Generation**: AI-generated images displayed in real-time

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- All FintechPulse dependencies installed

### Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the React UI**
   ```bash
   npm run build-ui
   ```

3. **Start the React UI Server**
   ```bash
   npm run react-ui
   ```

4. **Open in Browser**
   Navigate to `http://localhost:3000`

### Development Mode

For development with hot reloading:

```bash
# Terminal 1: Start the backend server
npm run react-ui

# Terminal 2: Start the React dev server
npm run dev-ui
```

Then open `http://localhost:3001` for the React dev server.

## Usage Workflow

### 1. Select Post Type
Choose from the 6 available content generators:
- Each type is optimized for different audiences and purposes
- Hover over cards to see detailed features
- Click to proceed to content generation

### 2. Generate Content
- **For Freestyle Posts**: Enter your custom prompt
- **For Other Types**: Click "Generate Post" to create content
- Watch real-time progress as AI generates:
  - Optimized content
  - Custom image
  - Engagement metrics

### 3. Preview & Confirm
- **LinkedIn Preview**: See exactly how your post will appear
- **Engagement Metrics**: View performance predictions
- **Generated Image**: Preview the AI-created image
- **Actions Available**:
  - Copy content to clipboard
  - Regenerate if needed
  - Post to LinkedIn

### 4. Success & Next Steps
- **Confirmation**: See your published post
- **Quick Stats**: View engagement metrics
- **Next Actions**: Create another post, view analytics, or share success

## API Endpoints

The React UI communicates with the backend via these endpoints:

- `POST /api/generate-post` - Generate content, image, and metrics
- `POST /api/post-to-linkedin` - Publish to LinkedIn
- `POST /api/save-post` - Save to database
- `GET /api/stats` - Get posting statistics
- `GET /api/recent-posts` - Get recent posts
- `GET /api/images/:filename` - Serve generated images

## File Structure

```
src/web/react-ui/
├── components/           # React components
│   ├── Header.js        # Navigation header
│   ├── PostTypeSelector.js  # Post type selection
│   ├── ContentGenerator.js  # Content generation
│   ├── PreviewAndConfirm.js # Preview and actions
│   └── SuccessScreen.js     # Success confirmation
├── context/
│   └── PostContext.js   # React context for state management
├── App.js               # Main app component
├── App.css              # Custom styles
├── index.js             # React entry point
├── index.css            # Tailwind CSS
└── index.html           # HTML template
```

## Customization

### Styling
- Uses Tailwind CSS for styling
- Custom components defined in `index.css`
- Responsive design with mobile-first approach

### Adding New Post Types
1. Add the type to `PostTypeSelector.js`
2. Add generation logic to `react-ui-server.js`
3. Update the API endpoint to handle the new type

### Modifying the Workflow
- Edit components in the `components/` directory
- Update state management in `PostContext.js`
- Modify the main flow in `App.js`

## Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port Conflicts**
```bash
# Change port in react-ui-server.js
this.port = process.env.PORT || 3001;
```

**Image Loading Issues**
- Ensure images directory exists
- Check file permissions
- Verify image paths in API responses

### Development Tips

1. **Hot Reloading**: Use `npm run dev-ui` for faster development
2. **API Testing**: Test endpoints directly with tools like Postman
3. **Console Logs**: Check browser console for React errors
4. **Network Tab**: Monitor API calls in browser dev tools

## Contributing

1. Follow the existing component structure
2. Use Tailwind CSS classes for styling
3. Maintain responsive design
4. Add proper error handling
5. Test on multiple screen sizes

## License

MIT License - see main project license 