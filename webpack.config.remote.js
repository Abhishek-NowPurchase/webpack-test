const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  mode: 'development',
  devServer: {
    port: 3000,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'helloWorldApp',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
        './Home': './src/components/Home',
        './About': './src/components/About',
        './Contact': './src/components/Contact',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^16.8.6' },
        'react-dom': { singleton: true, requiredVersion: '^16.8.6' },
        'react-router-dom': { singleton: true, requiredVersion: '^5.3.4' },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
}; 