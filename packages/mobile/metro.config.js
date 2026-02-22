const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Only watch mobile package + root node_modules
config.watchFolders = [
  projectRoot,
  path.join(repoRoot, 'node_modules'),
];

// Block irrelevant monorepo packages
config.resolver.blockList = [
  /.*\/\.git\/.*/,
  /.*\/packages\/backend\/.*/,
  /.*\/packages\/web\/.*/,
];

module.exports = config;
