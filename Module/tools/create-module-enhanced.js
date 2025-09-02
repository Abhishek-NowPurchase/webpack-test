#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 🚀 ENHANCED MODULE CREATION SYSTEM
class ModuleCreator {
  constructor() {
    this.appsDir = path.resolve(__dirname, '..', 'apps');
    this.toolsDir = path.resolve(__dirname, '..', 'tools');
    this.webpackConfigPath = path.resolve(this.toolsDir, 'webpack-smart.config.js');
  }

  // 🔍 DISCOVER EXISTING MODULES
  discoverModules() {
    if (!fs.existsSync(this.appsDir)) {
      return [];
    }

    return fs.readdirSync(this.appsDir)
      .filter(dir => {
        const modulePath = path.join(this.appsDir, dir);
        const packageJsonPath = path.join(modulePath, 'package.json');
        return fs.statSync(modulePath).isDirectory() && fs.existsSync(packageJsonPath);
      })
      .map(moduleName => {
        const modulePath = path.join(this.appsDir, moduleName);
        const packageJsonPath = path.join(modulePath, 'package.json');
        
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          return {
            name: moduleName,
            path: modulePath,
            packageJson,
            hasValidStructure: fs.existsSync(path.join(modulePath, 'src', 'app', 'mount.js'))
          };
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean);
  }

  // 🎯 ASSIGN NEXT AVAILABLE PORT
  getNextPort() {
    const existingModules = this.discoverModules();
    const basePort = 3105;
    return basePort + existingModules.length;
  }

  // 📦 CREATE MODULE STRUCTURE
  async createModuleStructure(moduleName) {
    // 🔧 VALIDATE MODULE NAME FOR WEBPACK COMPATIBILITY
    const validatedModuleName = this.validateModuleName(moduleName);
    if (validatedModuleName !== moduleName) {
      console.log(`⚠️  Module name '${moduleName}' contains invalid characters for webpack`);
      console.log(`✅ Converting to valid name: '${validatedModuleName}'`);
    }
    
    const modulePath = path.join(this.appsDir, validatedModuleName);
    const nextPort = this.getNextPort();

    console.log(`🚀 Creating module: ${validatedModuleName}`);
    console.log(`📍 Port assigned: ${nextPort}`);

    // Create directory structure
    fs.mkdirSync(modulePath, { recursive: true });
    fs.mkdirSync(path.join(modulePath, 'src'), { recursive: true });
    fs.mkdirSync(path.join(modulePath, 'src/app'), { recursive: true });
    fs.mkdirSync(path.join(modulePath, 'public'), { recursive: true });

    // Create package.json
    const packageJson = {
      name: validatedModuleName,
      private: true,
      version: "0.1.0",
      scripts: {
        dev: `webpack serve --config ../../tools/webpack-smart.config.js`,
        build: `webpack --config ../../tools/webpack-smart.config.js`,
        clean: "rimraf dist"
      },
      peerDependencies: {
        "react": "^18.3.1",
        "react-dom": "^18.3.1"
      },
      devDependencies: {
        "html-webpack-plugin": "^5.6.0",
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "rimraf": "^5.0.10",
        "webpack": "^5.93.0",
        "webpack-cli": "^5.1.4",
        "webpack-dev-server": "^5.0.4"
      },
      dependencies: {
        "@babel/core": "^7.28.3",
        "@babel/preset-env": "^7.28.3",
        "@babel/preset-react": "^7.27.1",
        "babel-loader": "^10.0.0",
        "css-loader": "^7.1.2",
        "events": "^3.3.0",
        "now-design-atoms": "^1.0.46",
        "now-design-icons": "^1.0.5",
        "now-design-molecules": "^1.0.10",
        "now-design-organisms": "^1.0.11",
        "now-design-styles": "^1.0.7",
        "now-design-theme": "^1.0.5",
        "now-design-tokens": "^1.0.10",
        "style-loader": "^4.0.0"
      }
    };

    fs.writeFileSync(
      path.join(modulePath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create App.jsx
    const appJsx = `import React from "react";
import 'now-design-tokens/dist/css/variables.css';
import 'now-design-styles/dist/index.css';
import { ThemeProvider } from 'now-design-theme';
import { Button } from 'now-design-atoms';
import { TextInput } from 'now-design-molecules';
import { SystemSearchLine } from 'now-design-icons';

export const App = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <div style={{
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1 style={{
          marginBottom: '20px',
          color: 'var(--primary-color, #2196F3)'
        }}>
          Welcome to ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Module
        </h1>

        <div style={{ marginBottom: '20px' }}>
          <Button
            onClick={() => alert('DS Button clicked!')}
            style={{ marginRight: '10px' }}
          >
            DS Button
          </Button>
          <Button
            variant="secondary"
            onClick={() => alert('Secondary clicked!')}
          >
            Secondary
          </Button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <TextInput
            label="${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Name"
            placeholder="Enter ${moduleName} name..."
            value=""
            onChange={() => {}}
            icon={<SystemSearchLine />}
          />
        </div>

        <p style={{
          color: 'var(--text-secondary, #666)',
          fontSize: '14px'
        }}>
          This module is using Now Design System components with React 18 and Module Federation.
        </p>
      </div>
    </ThemeProvider>
  );
};
`;

    fs.writeFileSync(path.join(modulePath, 'src/app/App.jsx'), appJsx);

    // Create mount.js
    const mountJs = `import { createRoot } from "react-dom/client";
import React from "react";
import { App } from "./App.jsx";

let root = null;

export async function mount(container, props) {
  try {
    if (!root) {
      root = createRoot(container);
    }
    root.render(React.createElement(App, props));

    return () => {
      if (root) {
        root.unmount();
        root = null;
      }
    };
  } catch (error) {
    console.error("Error mounting module:", error);
    // Fallback rendering
    if (!root) {
      root = createRoot(container);
    }
    root.render(React.createElement(App, props));
    
    return () => {
      if (root) {
        root.unmount();
        root = null;
      }
    };
  }
}
`;

    fs.writeFileSync(path.join(modulePath, 'src/app/mount.js'), mountJs);

    // Create index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Module</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

    fs.writeFileSync(path.join(modulePath, 'public/index.html'), indexHtml);

    // Create README.md
    const readme = `# ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Module

This is a micro-frontend module built with React 18 and Module Federation.

## Development

\`\`\`bash
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## Structure

- \`src/app/App.jsx\` - Main React component
- \`src/app/mount.js\` - Module Federation entry point
- \`public/index.html\` - HTML template

## Integration

This module is designed to be injected into the Agnipariksha host application via Module Federation.

## Port

This module runs on port ${nextPort}.

## Remote Entry

\`\`\`javascript
// In Agnipariksha config-overrides.js
remotes: {
  '${moduleName}': \`${moduleName}@\${process.env.REACT_APP_${moduleName.toUpperCase()}_URL}/remoteEntry.js\`
}

// In Agnipariksha .env
REACT_APP_${moduleName.toUpperCase()}_URL=http://localhost:${nextPort}
\`\`\`
`;

    fs.writeFileSync(path.join(modulePath, 'README.md'), readme);

    console.log(`✅ Module structure created successfully!`);
    
            // 🔧 AUTOMATICALLY UPDATE GLOBAL WEBPACK CONFIG
        await this.updateGlobalWebpackConfig(validatedModuleName, nextPort);
        
        // 🚀 RUN THE BULLETPROOF WEBPACK CONFIG UPDATER
        try {
          const { execSync } = require('child_process');
          console.log('🔧 Running bulletproof webpack config updater...');
          execSync('node tools/auto-update-webpack.js', { 
            cwd: path.join(__dirname, '..'), 
            stdio: 'inherit',
            shell: true 
          });
          console.log('✅ Bulletproof webpack config update completed!');
        } catch (error) {
          console.log(`⚠️  Bulletproof updater failed: ${error.message}`);
        }

    return { modulePath, nextPort, validatedModuleName };
  }

  // 🔧 VALIDATE MODULE NAME FOR WEBPACK COMPATIBILITY
  validateModuleName(moduleName) {
    // Replace hyphens and other invalid characters with underscores
    return moduleName.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  // 🔧 UPDATE GLOBAL WEBPACK CONFIG AUTOMATICALLY
  async updateGlobalWebpackConfig(moduleName, port) {
    try {
      const webpackConfigPath = path.join(__dirname, 'webpack-smart.config.js');
      let webpackConfig = await fs.promises.readFile(webpackConfigPath, 'utf8');
      
      // Add new module to the discovered modules list
      const moduleEntry = `  { name: '${moduleName}', port: ${port} }`;
      
      // Find the modules array and add the new module
      if (webpackConfig.includes('const modules = [')) {
        const modulesArrayStart = webpackConfig.indexOf('const modules = [');
        const modulesArrayEnd = webpackConfig.indexOf('];', modulesArrayEnd);
        
        if (modulesArrayEnd !== -1) {
          const beforeModules = webpackConfig.substring(0, modulesArrayEnd);
          const afterModules = webpackConfig.substring(modulesArrayEnd);
          
          // Add new module before the closing bracket
          webpackConfig = beforeModules + ',\n' + moduleEntry + afterModules;
          
                // Write updated config
      await fs.promises.writeFile(webpackConfigPath, webpackConfig);
      console.log(`✅ Global webpack config updated with ${moduleName}`);
      
      // 🔧 ALSO UPDATE THE OLD WEBPACK.CONFIG.JS
      const oldWebpackConfigPath = path.join(__dirname, 'webpack.config.js');
      if (fs.existsSync(oldWebpackConfigPath)) {
        try {
          let oldWebpackConfig = await fs.promises.readFile(oldWebpackConfigPath, 'utf8');
          
          // Add new module to the portMap
          const portMapEntry = `    '${moduleName}': ${port}`;
          
          if (oldWebpackConfig.includes('const portMap = {')) {
            const portMapStart = oldWebpackConfig.indexOf('const portMap = {');
            const portMapEnd = oldWebpackConfig.indexOf('};', portMapStart);
            
            if (portMapEnd !== -1) {
              const beforePortMap = oldWebpackConfig.substring(0, portMapEnd);
              const afterPortMap = oldWebpackConfig.substring(portMapEnd);
              
              // Add new module before the closing brace
              oldWebpackConfig = beforePortMap + ',\n' + portMapEntry + afterPortMap;
              
              // Write updated config
              await fs.promises.writeFile(oldWebpackConfigPath, oldWebpackConfig);
              console.log(`✅ Old webpack config updated with ${moduleName} on port ${port}`);
            }
          }
        } catch (oldConfigError) {
          console.log(`⚠️  Could not update old webpack config: ${oldConfigError.message}`);
        }
      }
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not update global webpack config: ${error.message}`);
    }
  }

  // 🔧 INSTALL DEPENDENCIES
  async installDependencies(modulePath) {
    console.log(`📥 Installing dependencies...`);
    
    try {
      execSync('npm install', { 
        cwd: modulePath, 
        stdio: 'inherit',
        shell: true 
      });
      console.log(`✅ Dependencies installed successfully!`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to install dependencies:`, error.message);
      return false;
    }
  }

  // 🚀 START DEVELOPMENT SERVER
  startDevServer(modulePath) {
    console.log(`🚀 Starting development server...`);
    console.log(`💡 Module will be available at the next available port`);
    console.log(`💡 Check the terminal output for the exact URL`);
    
    try {
      execSync('npm run dev', { 
        cwd: modulePath, 
        stdio: 'inherit',
        shell: true 
      });
    } catch (error) {
      console.log(`ℹ️  Development server stopped or encountered an error`);
    }
  }

  // 📋 SHOW INTEGRATION STEPS
  showIntegrationSteps(moduleName, port) {
    console.log(`\n🎯 Next steps to integrate with Agnipariksha:`);
    console.log(`1. Add to config-overrides.js:`);
    console.log(`   remotes: { '${moduleName}': \`${moduleName}@\${process.env.REACT_APP_${moduleName.toUpperCase()}_URL}/remoteEntry.js\` }`);
    console.log(``);
    console.log(`2. Add environment variable in Agnipariksha/.env:`);
    console.log(`   REACT_APP_${moduleName.toUpperCase()}_URL=http://localhost:${port}`);
    console.log(``);
    console.log(`3. Add route in AppRoute.js:`);
    console.log(`   <Route path="/${moduleName}" element={<${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}POC />} />`);
    console.log(``);
    console.log(`4. Create loader component (copy from GradePOC.jsx and modify)`);
    console.log(``);
    console.log(`💡 The module will automatically run on port ${port}!`);
  }

  // 🎯 MAIN CREATION PROCESS
  async createModule(moduleName) {
    try {
      // Check if module already exists
      if (fs.existsSync(path.join(this.appsDir, moduleName))) {
        console.error(`❌ Module '${moduleName}' already exists!`);
        process.exit(1);
      }

              // Create module structure
        const { modulePath, nextPort, validatedModuleName } = await this.createModuleStructure(moduleName);

      // Install dependencies
      const installSuccess = await this.installDependencies(modulePath);
      if (!installSuccess) {
        console.error(`❌ Failed to create module due to dependency installation failure`);
        process.exit(1);
      }

      // Show integration steps
      this.showIntegrationSteps(moduleName, nextPort);

      // Start development server
      this.startDevServer(modulePath);

    } catch (error) {
      console.error(`❌ Error creating module:`, error.message);
      process.exit(1);
    }
  }
}

// 🚀 MAIN EXECUTION
const main = () => {
  const moduleName = process.argv[2];

  if (!moduleName) {
    console.error('❌ Please provide a module name: node create-module-enhanced.js <module-name>');
    console.error('Example: node create-module-enhanced.js user-management');
    process.exit(1);
  }

  const creator = new ModuleCreator();
  creator.createModule(moduleName);
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ModuleCreator;
