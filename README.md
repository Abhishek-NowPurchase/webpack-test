# React Hello World - Module Federation

A simple Hello World React application built with Webpack 5 Module Federation, featuring React Router for navigation and a modern, responsive UI.

## Features

- 🚀 **React 16.8** with hooks support
- 🔄 **Webpack 5 Module Federation** for micro-frontend architecture
- 🛣️ **React Router** for client-side routing
- 📱 **Responsive Design** with modern CSS
- 🎨 **Beautiful UI** with gradient backgrounds and glassmorphism effects

## Project Structure

```
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Home.js
│   │   ├── About.js
│   │   └── Contact.js
│   ├── App.js
│   ├── App.css
│   ├── bootstrap.js
│   └── index.js
├── package.json
├── webpack.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm start
# or
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

Build the production version:
```bash
npm run build
```

## Module Federation Configuration

This app is configured as a **host application** that can consume remote modules from other applications. The webpack configuration includes:

### Shared Dependencies
- React (singleton)
- React DOM (singleton)
- React Router DOM (singleton)

### Remote Configuration
The `webpack.config.js` includes a commented section where you can add remote applications:

```javascript
remotes: {
  // Example: mfApp: 'mfApp@http://localhost:3001/remoteEntry.js',
}
```

## Using as a Remote Module

To use this app as a remote module in another application, modify the webpack config:

```javascript
new ModuleFederationPlugin({
  name: 'helloWorldApp',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App',
    './Home': './src/components/Home',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    'react-router-dom': { singleton: true },
  },
})
```

Then in the host application, add it to remotes:

```javascript
remotes: {
  helloWorldApp: 'helloWorldApp@http://localhost:3000/remoteEntry.js',
}
```

## Pages

- **Home**: Welcome page with feature highlights
- **About**: Information about the app and technologies used
- **Contact**: Demo contact form

## Technologies Used

- **React 16.8**: React with hooks support for compatibility
- **Webpack 5**: Modern bundler with Module Federation
- **React Router**: Client-side routing
- **Babel**: JavaScript transpilation
- **CSS3**: Modern styling with gradients and animations

## Deployment

This app can be deployed to any static hosting service:

- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your repository
- **GitHub Pages**: Use the `dist` folder
- **AWS S3**: Upload the `dist` folder

## Contributing

Feel free to fork this project and submit pull requests for any improvements.

## License

MIT License - feel free to use this project for your own applications. 