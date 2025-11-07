const { override, addWebpackModuleRule } = require('customize-cra');

module.exports = override(
  (config) => {
    // Disable source maps for faster builds
    if (process.env.GENERATE_SOURCEMAP === 'false') {
      config.devtool = false;
    }
    
    // Fix webpack dev server issues
    if (config.devServer) {
      config.devServer = {
        ...config.devServer,
        allowedHosts: 'all',
        host: 'localhost',
        port: 3000,
        historyApiFallback: true,
        hot: true,
        liveReload: true
      };
    }
    
    return config;
  }
);