const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const fs = require("fs");

// 🚀 SMART MODULE DISCOVERY SYSTEM
const discoverModules = () => {
  const appsDir = path.resolve(__dirname, '..', 'apps');
  
  if (!fs.existsSync(appsDir)) {
    console.log("❌ apps/ directory not found");
    return [];
  }

  const modules = fs.readdirSync(appsDir)
    .filter(dir => {
      const modulePath = path.join(appsDir, dir);
      const packageJsonPath = path.join(modulePath, 'package.json');
      return fs.statSync(modulePath).isDirectory() && fs.existsSync(packageJsonPath);
    })
    .map(moduleName => {
      const modulePath = path.join(appsDir, moduleName);
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

  console.log(`🔍 Discovered ${modules.length} modules:`, modules.map(m => m.name));
  return modules;
};

// 🎯 SMART PORT ASSIGNMENT SYSTEM
const assignPorts = (modules) => {
  const basePort = 3105;
  const portMap = {};
  
  modules.forEach((module, index) => {
    let port = basePort + index;
    
    // Find next available port if current is occupied
    while (isPortInUse(port)) {
      console.log(`⚠️  Port ${port} is occupied, trying next port...`);
      port++;
    }
    
    portMap[module.name] = port;
    console.log(`📍 ${module.name} assigned to port ${port}`);
  });
  
  return portMap;
};

// Check if port is actually in use
const isPortInUse = (port) => {
  try {
    const { execSync } = require('child_process');
    const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8', stdio: 'pipe' });
    return result.trim().length > 0;
  } catch (error) {
    return false; // Port is free
  }
};

// 🔧 GET CURRENT MODULE CONFIGURATION
const getCurrentModuleConfig = () => {
  const cwd = process.cwd();
  const moduleName = path.basename(cwd);
  
  // Check if we're in a module directory
  const isModule = fs.existsSync(path.join(cwd, 'package.json')) && 
                   fs.existsSync(path.join(cwd, 'src', 'app', 'mount.js'));
  
  if (!isModule) {
    throw new Error(`❌ Not in a valid module directory: ${cwd}`);
  }
  
  // Get all modules for port assignment
  const allModules = discoverModules();
  const portMap = assignPorts(allModules);
  
  // Get current module's port
  const port = portMap[moduleName] || process.env.PORT || 3107;
  
  console.log(`🚀 Building module: ${moduleName} on port ${port}`);
  console.log(`📁 Entry: ${path.resolve(cwd, "src/app/mount.js")}`);
  console.log(`📁 Output: ${path.resolve(cwd, "dist")}`);
  
  return {
    moduleName,
    port,
    entryPoint: path.resolve(cwd, "src/app/mount.js"),
    publicDir: path.resolve(cwd, "public"),
    outputPath: path.resolve(cwd, "dist"),
    allModules,
    portMap
  };
};

// 🎯 MAIN WEBPACK CONFIGURATION
module.exports = (env, argv) => {
  const config = getCurrentModuleConfig();
  
  // Dynamically load webpack from local module's node_modules
  const { ModuleFederationPlugin } = require(path.join(process.cwd(), "node_modules/webpack")).container;

  return {
    entry: config.entryPoint,
    mode: process.env.NODE_ENV || "development",
    devtool: "source-map",
    output: {
      path: config.outputPath,
      publicPath: "auto"
    },
    resolve: {
      extensions: [".js", ".jsx"],
      fallback: { events: require.resolve("events/") }
    },
    devServer: {
      port: config.port,
      historyApiFallback: true,
      headers: { "Access-Control-Allow-Origin": "*" },
      client: { overlay: false },
      hot: false,
      liveReload: false,
      onListening: (devServer) => {
        if (!devServer) return;
        const port = devServer.server.address().port;
        console.log(`✅ Module ${config.moduleName} running on http://localhost:${port}`);
        console.log(`🔗 Remote entry: http://localhost:${port}/remoteEntry.js`);
      }
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react', '@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource'
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(config.publicDir, "index.html")
      }),
      new ModuleFederationPlugin({
        name: config.moduleName,
        filename: "remoteEntry.js",
        exposes: { "./mount": "./src/app/mount" },
        shared: {
          react: {
            singleton: true,
            requiredVersion: false,
            eager: false,
            strictVersion: false,
            import: false
          },
          "react-dom": {
            singleton: true,
            requiredVersion: false,
            eager: false,
            strictVersion: false,
            import: false
          }
        }
      })
    ]
  };
};
