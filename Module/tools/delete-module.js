#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 🗑️ MODULE DELETION SYSTEM
class ModuleDeleter {
  constructor() {
    this.appsDir = path.resolve(__dirname, '..', 'apps');
    this.toolsDir = path.resolve(__dirname, '..', 'tools');
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

  // 🚫 STOP MODULE IF RUNNING
  stopModuleIfRunning(moduleName) {
    console.log(`🛑 Stopping module if running...`);
    
    try {
      // Find process using the module's port
      const modules = this.discoverModules();
      const moduleIndex = modules.findIndex(m => m.name === moduleName);
      
      if (moduleIndex !== -1) {
        const port = 3105 + moduleIndex;
        
        // Try to kill process on that port
        try {
          const output = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
          if (output) {
            const pids = output.split('\n').filter(Boolean);
            pids.forEach(pid => {
              try {
                execSync(`kill -9 ${pid}`, { stdio: 'pipe' });
                console.log(`✅ Killed process ${pid} on port ${port}`);
              } catch (error) {
                console.log(`⚠️  Could not kill process ${pid}: ${error.message}`);
              }
            });
          }
        } catch (error) {
          // Port not in use, which is fine
          console.log(`ℹ️  Port ${port} is not currently in use`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not stop module processes: ${error.message}`);
    }
  }

  // 🔧 UPDATE WEBPACK CONFIG TO REMOVE DELETED MODULE
  updateWebpackConfig(moduleName) {
    try {
      const webpackConfigPath = path.join(this.toolsDir, 'webpack.config.js');
      
      if (!fs.existsSync(webpackConfigPath)) {
        console.log(`⚠️  webpack.config.js not found, skipping config update`);
        return;
      }

      let webpackConfig = fs.readFileSync(webpackConfigPath, 'utf8');
      
      // Remove the module from portMap
      const portMapRegex = new RegExp(`\\s*'${moduleName}':\\s*\\d+,?\\n?`, 'g');
      
      if (webpackConfig.match(portMapRegex)) {
        webpackConfig = webpackConfig.replace(portMapRegex, '');
        
        // Clean up any trailing commas
        webpackConfig = webpackConfig.replace(/,\s*}/g, '\n  };');
        
        // Write updated config
        fs.writeFileSync(webpackConfigPath, webpackConfig);
        console.log(`✅ webpack.config.js updated - removed ${moduleName}`);
      } else {
        console.log(`ℹ️  Module ${moduleName} not found in webpack.config.js`);
      }
    } catch (error) {
      console.log(`⚠️  Could not update webpack config: ${error.message}`);
    }
  }

  // 🧹 CLEAN UP MODULE DIRECTORY
  cleanupModuleDirectory(moduleName) {
    const modulePath = path.join(this.appsDir, moduleName);
    
    if (!fs.existsSync(modulePath)) {
      console.log(`ℹ️  Module directory does not exist: ${modulePath}`);
      return false;
    }

    console.log(`🧹 Cleaning up module directory: ${modulePath}`);
    
    try {
      // Remove the entire module directory
      execSync(`rm -rf "${modulePath}"`, { stdio: 'pipe' });
      
      // 🔧 DOUBLE-CHECK: Force remove if still exists
      if (fs.existsSync(modulePath)) {
        console.log(`⚠️  Directory still exists, forcing removal...`);
        execSync(`sudo rm -rf "${modulePath}"`, { stdio: 'pipe' });
      }
      
      // Final verification
      if (!fs.existsSync(modulePath)) {
        console.log(`✅ Module directory removed successfully`);
        return true;
      } else {
        console.error(`❌ Directory still exists after forced removal`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Failed to remove module directory: ${error.message}`);
      return false;
    }
  }

  // 📋 SHOW CLEANUP SUMMARY
  showCleanupSummary(moduleName, success) {
    if (success) {
      console.log(`\n🎉 Module '${moduleName}' deleted successfully!`);
      console.log(`✅ Directory removed`);
      console.log(`✅ Processes stopped`);
      console.log(`✅ Port freed up`);
      
      // Show remaining modules
      const remainingModules = this.discoverModules();
      if (remainingModules.length > 0) {
        console.log(`\n📦 Remaining modules (${remainingModules.length}):`);
        remainingModules.forEach((module, index) => {
          const port = 3105 + index;
          console.log(`   ${module.name} (port ${port})`);
        });
      } else {
        console.log(`\n📦 No modules remaining`);
      }
    } else {
      console.log(`\n❌ Failed to delete module '${moduleName}'`);
      console.log(`💡 You may need to manually clean up the directory`);
    }
  }

  // 🎯 MAIN DELETION PROCESS
  async deleteModule(moduleName) {
    try {
      console.log(`🗑️  Deleting module: ${moduleName}`);
      console.log(`================================`);

      // Check if module exists
      if (!fs.existsSync(path.join(this.appsDir, moduleName))) {
        console.error(`❌ Module '${moduleName}' does not exist!`);
        console.log(`\n📦 Available modules:`);
        const modules = this.discoverModules();
        if (modules.length === 0) {
          console.log(`   No modules found`);
        } else {
          modules.forEach((module, index) => {
            const port = 3105 + index;
            console.log(`   ${module.name} (port ${port})`);
          });
        }
        process.exit(1);
      }

      // Stop module if running
      this.stopModuleIfRunning(moduleName);

      // Clean up module directory
      const cleanupSuccess = this.cleanupModuleDirectory(moduleName);

      // 🔧 UPDATE WEBPACK CONFIG TO REMOVE DELETED MODULE
      if (cleanupSuccess) {
        this.updateWebpackConfig(moduleName);
      }

      // Show cleanup summary
      this.showCleanupSummary(moduleName, cleanupSuccess);

      if (!cleanupSuccess) {
        process.exit(1);
      }

    } catch (error) {
      console.error(`❌ Error deleting module:`, error.message);
      process.exit(1);
    }
  }

  // 📋 LIST ALL MODULES
  listModules() {
    const modules = this.discoverModules();
    
    if (modules.length === 0) {
      console.log(`📦 No modules found in ${this.appsDir}`);
      return;
    }

    console.log(`📦 Found ${modules.length} module(s):`);
    console.log(`================================`);
    
    modules.forEach((module, index) => {
      const port = 3105 + index;
      const status = module.hasValidStructure ? '✅ Valid' : '⚠️  Invalid';
      console.log(`${index + 1}. ${module.name}`);
      console.log(`   Port: ${port}`);
      console.log(`   Status: ${status}`);
      console.log(`   Path: ${module.path}`);
      console.log(``);
    });
  }
}

// 🚀 MAIN EXECUTION
const main = () => {
  const command = process.argv[2];
  const moduleName = process.argv[3];

  if (!command) {
    console.error('❌ Please provide a command:');
    console.error('  node delete-module.js delete <module-name>');
    console.error('  node delete-module.js list');
    console.error('');
    console.error('Examples:');
    console.error('  node delete-module.js delete user-management');
    console.error('  node delete-module.js list');
    process.exit(1);
  }

  const deleter = new ModuleDeleter();

  switch (command) {
    case 'delete':
      if (!moduleName) {
        console.error('❌ Please provide a module name to delete');
        console.error('Example: node delete-module.js delete user-management');
        process.exit(1);
      }
      deleter.deleteModule(moduleName);
      break;
      
    case 'list':
      deleter.listModules();
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.error('Available commands: delete, list');
      process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ModuleDeleter;
