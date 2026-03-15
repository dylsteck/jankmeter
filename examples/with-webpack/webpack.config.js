const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { JankMeterWebpackPlugin } = require('jankmeter/webpack');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new JankMeterWebpackPlugin(),
  ],
  devServer: {
    port: 3003,
    hot: true,
  },
};
