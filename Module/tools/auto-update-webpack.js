#!/usr/bin/env node

/**
 * 🚀 AUTO-UPDATE WEBPACK CONFIG SCRIPT
 * Automatically updates tools/webpack.config.js with new modules
 * This ensures the global webpack config stays in sync
 */

const fs = require('fs');
const path = require('path');

class WebpackConfigUpdater {
  constructor() {
    this.webpackConfigPath = path.join(__dirname, 'webpack.config.js');
    this.appsDir = path.join(__dirname, '..', 'apps');
  }

  // 🔍 DISCOVER ALL MODULES
  discoverModules() {
    if (!fs.existsSync(this.appsDir)) {
      console.log('❌ apps/ directory not found');
      return [];
    }

    const modules = fs.readdirSync(this.appsDir)
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
          console.log(`⚠️  Error reading package.json for ${moduleName}:`, error.message);
          return null;
        }
      })
      .filter(Boolean);

    return modules;
  }

  // 🎯 ASSIGN PORTS TO MODULES
  assignPorts(modules) {
    const basePort = 3105;
    const portMap = {};
    
    modules.forEach((module, index) => {
      let port = basePort + index;
      
      // Find next available port if current is occupied
      while (this.isPortInUse(port)) {
        console.log(`⚠️  Port ${port} is occupied, trying next port...`);
        port++;
      }
      
      portMap[module.name] = port;
      console.log(`📍 ${module.name} assigned to port ${port}`);
    });
    
    return portMap;
  }

  // 🔌 CHECK IF PORT IS IN USE
  isPortInUse(port) {
    try {
      const { execSync } = require('child_process');
      const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8', stdio: 'pipe' });
      return result.trim().length > 0;
    } catch (error) {
      return false; // Port is free
    }
  }

  // 🔧 UPDATE WEBPACK CONFIG
  updateWebpackConfig(portMap) {
    try {
      if (!fs.existsSync(this.webpackConfigPath)) {
        console.log('❌ webpack.config.js not found');
        return false;
      }

      let webpackConfig = fs.readFileSync(this.webpackConfigPath, 'utf8');
      
      // Create the new portMap string
      const portMapEntries = Object.entries(portMap)
        .map(([name, port]) => `    '${name}': ${port}`)
        .join(',\n');
      
      const newPortMap = `  // Auto-assign port based on module name
  const portMap = {
${portMapEntries}
  };`;

      // Replace the old portMap
      const portMapRegex = /  \/\/ Auto-assign port based on module name\s+const portMap = \{[\s\S]*?\};/;
      
      if (webpackConfig.match(portMapRegex)) {
        webpackConfig = webpackConfig.replace(portMapRegex, newPortMap);
        
        // Write updated config
        fs.writeFileSync(this.webpackConfigPath, webpackConfig);
        console.log('✅ webpack.config.js updated successfully!');
        return true;
      } else {
        console.log('❌ Could not find portMap in webpack.config.js');
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating webpack config:', error.message);
      return false;
    }
  }

  // 🚀 MAIN UPDATE PROCESS
  async update() {
    console.log('🔧 Auto-updating webpack.config.js...');
    
    const modules = this.discoverModules();
    console.log(`🔍 Found ${modules.length} modules`);
    
    const portMap = this.assignPorts(modules);
    console.log('📍 Port assignments:', portMap);
    
    const success = this.updateWebpackConfig(portMap);
    
    if (success) {
      console.log('🎉 Webpack config update completed successfully!');
      console.log('📋 Updated portMap:');
      Object.entries(portMap).forEach(([name, port]) => {
        console.log(`   ${name}: ${port}`);
      });
    } else {
      console.log('❌ Webpack config update failed!');
      process.exit(1);
    }
  }
}

// 🚀 RUN THE UPDATER
if (require.main === module) {
  const updater = new WebpackConfigUpdater();
  updater.update().catch(console.error);
}

module.exports = WebpackConfigUpdater;
