const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  maxWorkers: 2,
  resolver: {
    blockList: [/android\/.*\/build\/.*/, /android\/app\/build\/.*/],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
