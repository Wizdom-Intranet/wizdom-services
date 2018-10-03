module.exports = {
    moduleFileExtensions: [
      'ts',
      'tsx',
      'js',
      'jsx',
      'json',
      'vue'
    ],
    transform: {
      '^.+\\.vue$': 'vue-jest',
      '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
      '^.+\\.tsx?$': 'ts-jest'
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    snapshotSerializers: [
      'jest-serializer-vue'
    ],
    testPathIgnorePatterns: ["\\node_modules\\","\\samples\\", "\\dist\\"],
    testMatch: [
      //'<rootDir>/(tests/unit/**/*.spec.(js|jsx|ts|tsx)|src/**/__tests__/*.spec.(js|jsx|ts|tsx))',
      //'**/*.spec.(js|jsx|ts|tsx)',      
      '**/src/**/*.spec.(js|jsx|ts|tsx)',      
    ],    
  }
  