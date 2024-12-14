const path = require('path');

module.exports = {
  entry: './app/public/js/blockchain.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'app/public/js/dist'),
  },
  mode: 'development'
};