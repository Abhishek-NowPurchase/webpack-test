const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

module.exports = {
  entry: "./src/app/mount.js",
  mode: process.env.NODE_ENV || "development",
  devtool: "source-map",
  output: { path: path.resolve(__dirname, "dist"), publicPath: "auto" },
  resolve: {
    extensions: [".js", ".jsx"],
    fallback: { events: require.resolve("events/") }
  },
  devServer: {
    port: 3105,
    historyApiFallback: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    client: { overlay: false },
    hot: false,
    liveReload: false
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
    new HtmlWebpackPlugin({ template: "./public/index.html" }),
    new ModuleFederationPlugin({
      name: "grade",
      filename: "remoteEntry.js",
      exposes: { "./mount": "./src/app/mount" },
      shared: { 
        react: { singleton: true, requiredVersion: false, eager: false }, 
        "react-dom": { singleton: true, requiredVersion: false, eager: false },
        "now-design-theme": { singleton: true, eager: false }
      }
    })
  ]
};
