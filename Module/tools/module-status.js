#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 📊 MODULE STATUS AND MANAGEMENT SYSTEM
class ModuleManager {
  constructor() {
    this.appsDir = path.resolve(__dirname, '..', 'apps');
    this.toolsDir = path.resolve(__dirname, '..', 'tools');
  }

  // 🔍 DISCOVER ALL MODULES
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
            hasValidStructure: fs.existsSync(path.join(modulePath, 'src', 'app', 'mount.js')),
            hasPublicDir: fs.existsSync(path.join(modulePath, 'public', 'index.html')),
            hasSrcDir: fs.existsSync(path.join(modulePath, 'src')),
            hasAppDir: fs.existsSync(path.join(modulePath, 'src', 'app')),
            hasAppJsx: fs.existsSync(path.join(modulePath, 'src', 'app', 'App.jsx')),
            hasMountJs: fs.existsSync(path.join(modulePath, 'src', 'app', 'mount.js'))
          };
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean);
  }

  // 🔌 CHECK PORT STATUS
  checkPortStatus(port) {
    try {
      const output = execSync(`lsof -ti:${port}`, { encoding: 'utf8', stdio: 'pipe' }).trim();
      if (output) {
        const pids = output.split('\n').filter(Boolean);
        return {
          inUse: true,
          pids: pids,
          count: pids.length
        };
      }
      return { inUse: false, pids: [], count: 0 };
    } catch (error) {
      return { inUse: false, pids: [], count: 0 };
    }
  }

  // 📊 GET MODULE HEALTH SCORE
  getModuleHealth(module) {
    let score = 0;
    const maxScore = 7;
    
    if (module.hasValidStructure) score += 2;
    if (module.hasPublicDir) score += 1;
    if (module.hasSrcDir) score += 1;
    if (module.hasAppDir) score += 1;
    if (module.hasAppJsx) score += 1;
    if (module.hasMountJs) score += 1;
    
    const percentage = Math.round((score / maxScore) * 100);
    
    if (percentage >= 90) return { score, percentage, status: '🟢 Excellent', color: '\x1b[32m' };
    if (percentage >= 70) return { score, percentage, status: '🟡 Good', color: '\x1b[33m' };
    if (percentage >= 50) return { score, percentage, status: '🟠 Fair', color: '\x1b[33m' };
    return { score, percentage, status: '🔴 Poor', color: '\x1b[31m' };
  }

  // 🎯 SHOW COMPREHENSIVE MODULE STATUS
  showModuleStatus() {
    const modules = this.discoverModules();
    
    if (modules.length === 0) {
      console.log(`📦 No modules found in ${this.appsDir}`);
      return;
    }

    console.log(`📊 Module Federation Monorepo Status`);
    console.log(`=====================================`);
    console.log(`📦 Total Modules: ${modules.length}`);
    console.log(`📅 Generated: ${new Date().toLocaleString()}`);
    console.log(``);

    modules.forEach((module, index) => {
      const port = 3105 + index;
      const portStatus = this.checkPortStatus(port);
      const health = this.getModuleHealth(module);
      
      console.log(`${index + 1}. ${module.name}`);
      console.log(`   📍 Port: ${port} ${portStatus.inUse ? '🔴 (In Use)' : '🟢 (Available)'}`);
      console.log(`   🏗️  Health: ${health.color}${health.status} (${health.percentage}%)\x1b[0m`);
      console.log(`   📁 Path: ${module.path}`);
      
      // Show port details if in use
      if (portStatus.inUse) {
        console.log(`   🔌 Process IDs: ${portStatus.pids.join(', ')}`);
      }
      
      // Show structure details
      console.log(`   📋 Structure:`);
      console.log(`      ✅ Valid Structure: ${module.hasValidStructure ? 'Yes' : 'No'}`);
      console.log(`      📁 Public Dir: ${module.hasPublicDir ? 'Yes' : 'No'}`);
      console.log(`      📁 Src Dir: ${module.hasSrcDir ? 'Yes' : 'No'}`);
      console.log(`      📁 App Dir: ${module.hasAppDir ? 'Yes' : 'No'}`);
      console.log(`      📄 App.jsx: ${module.hasAppJsx ? 'Yes' : 'No'}`);
      console.log(`      📄 mount.js: ${module.hasMountJs ? 'Yes' : 'No'}`);
      
      console.log(``);
    });

    // Show summary
    this.showSummary(modules);
  }

  // 📋 SHOW SUMMARY STATISTICS
  showSummary(modules) {
    const totalPorts = modules.length;
    const usedPorts = modules.filter((_, index) => {
      const port = 3105 + index;
      return this.checkPortStatus(port).inUse;
    }).length;
    
    const validModules = modules.filter(m => m.hasValidStructure).length;
    const invalidModules = modules.length - validModules;
    
    console.log(`📊 Summary Statistics`);
    console.log(`=====================`);
    console.log(`🔢 Total Modules: ${totalPorts}`);
    console.log(`🔌 Ports in Use: ${usedPorts}/${totalPorts}`);
    console.log(`✅ Valid Modules: ${validModules}`);
    console.log(`⚠️  Invalid Modules: ${invalidModules}`);
    console.log(`📈 Health Score: ${Math.round((validModules / totalPorts) * 100)}%`);
    console.log(``);
    
    if (invalidModules > 0) {
      console.log(`⚠️  Issues Found:`);
      modules.forEach((module, index) => {
        if (!module.hasValidStructure) {
          console.log(`   • ${module.name}: Missing required files`);
        }
      });
      console.log(``);
    }
  }

  // 🔍 SHOW DETAILED MODULE INFO
  showModuleDetails(moduleName) {
    const modules = this.discoverModules();
    const module = modules.find(m => m.name === moduleName);
    
    if (!module) {
      console.error(`❌ Module '${moduleName}' not found!`);
      return;
    }

    const port = 3105 + modules.findIndex(m => m.name === moduleName);
    const portStatus = this.checkPortStatus(port);
    const health = this.getModuleHealth(module);
    
    console.log(`🔍 Detailed Module Information: ${module.name}`);
    console.log(`==============================================`);
    console.log(`📁 Path: ${module.path}`);
    console.log(`📍 Port: ${port} ${portStatus.inUse ? '🔴 (In Use)' : '🟢 (Available)'}`);
    console.log(`🏗️  Health: ${health.color}${health.status} (${health.percentage}%)\x1b[0m`);
    console.log(``);
    
    // Package.json info
    console.log(`📦 Package Information:`);
    console.log(`   Name: ${module.packageJson.name}`);
    console.log(`   Version: ${module.packageJson.version}`);
    console.log(`   Private: ${module.packageJson.private}`);
    console.log(``);
    
    // Structure analysis
    console.log(`📋 Structure Analysis:`);
    console.log(`   ✅ Valid Structure: ${module.hasValidStructure ? 'Yes' : 'No'}`);
    console.log(`   📁 Public Directory: ${module.hasPublicDir ? 'Yes' : 'No'}`);
    console.log(`   📁 Source Directory: ${module.hasSrcDir ? 'Yes' : 'No'}`);
    console.log(`   📁 App Directory: ${module.hasAppDir ? 'Yes' : 'No'}`);
    console.log(`   📄 App.jsx: ${module.hasAppJsx ? 'Yes' : 'No'}`);
    console.log(`   📄 mount.js: ${module.hasMountJs ? 'Yes' : 'No'}`);
    console.log(``);
    
    // Port status details
    if (portStatus.inUse) {
      console.log(`🔌 Port Status (${port}):`);
      console.log(`   Status: In Use`);
      console.log(`   Process IDs: ${portStatus.pids.join(', ')}`);
      console.log(`   Process Count: ${portStatus.count}`);
    } else {
      console.log(`🔌 Port Status (${port}): Available`);
    }
    console.log(``);
    
    // Recommendations
    if (!module.hasValidStructure) {
      console.log(`💡 Recommendations:`);
      console.log(`   • This module appears to be incomplete`);
      console.log(`   • Consider recreating it with: node create-module-enhanced.js ${module.name}`);
      console.log(`   • Or delete it with: node delete-module.js delete ${module.name}`);
    }
  }

  // 🚀 SHOW INTEGRATION GUIDE
  showIntegrationGuide() {
    const modules = this.discoverModules();
    
    if (modules.length === 0) {
      console.log(`📦 No modules to integrate`);
      return;
    }

    console.log(`🔗 Integration Guide for Agnipariksha`);
    console.log(`=====================================`);
    console.log(`📝 Add the following to your Agnipariksha configuration:`);
    console.log(``);
    
    // Config-overrides.js
    console.log(`1. config-overrides.js:`);
    console.log(`   remotes: {`);
    modules.forEach((module, index) => {
      const port = 3105 + index;
      console.log(`     '${module.name}': \`${module.name}@\${process.env.REACT_APP_${module.name.toUpperCase()}_URL}/remoteEntry.js\`,`);
    });
    console.log(`   }`);
    console.log(``);
    
    // Environment variables
    console.log(`2. .env file:`);
    modules.forEach((module, index) => {
      const port = 3105 + index;
      console.log(`   REACT_APP_${module.name.toUpperCase()}_URL=http://localhost:${port}`);
    });
    console.log(``);
    
    // Routes
    console.log(`3. AppRoute.js:`);
    modules.forEach((module) => {
      console.log(`   <Route path="/${module.name}" element={<${module.name.charAt(0).toUpperCase() + module.name.slice(1)}POC />} />`);
    });
    console.log(``);
    
    console.log(`💡 Copy these configurations to integrate all modules!`);
  }
}

// 🚀 MAIN EXECUTION
const main = () => {
  const command = process.argv[2];
  const moduleName = process.argv[3];

  const manager = new ModuleManager();

  switch (command) {
    case 'status':
    case undefined:
      manager.showModuleStatus();
      break;
      
    case 'details':
      if (!moduleName) {
        console.error('❌ Please provide a module name for details');
        console.error('Example: node module-status.js details user-management');
        process.exit(1);
      }
      manager.showModuleDetails(moduleName);
      break;
      
    case 'integration':
      manager.showIntegrationGuide();
      break;
      
    case 'help':
      console.log(`📊 Module Status and Management System`);
      console.log(`=====================================`);
      console.log(`Commands:`);
      console.log(`  status                    - Show all modules status`);
      console.log(`  details <module-name>     - Show detailed module info`);
      console.log(`  integration               - Show integration guide`);
      console.log(`  help                      - Show this help`);
      console.log(``);
      console.log(`Examples:`);
      console.log(`  node module-status.js`);
      console.log(`  node module-status.js details user-management`);
      console.log(`  node module-status.js integration`);
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.error('Run "node module-status.js help" for available commands');
      process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ModuleManager;
