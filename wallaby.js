module.exports = wallaby => {

    return {
      files: ['src/**/*', 'jest.config.js', 'package.json', 'tsconfig.json', 'tests/**/*' , '!src/**/*.spec.ts', '!tests/**/*.spec.ts' ],

      tests: ['tests/**/*.spec.ts','src/**/*.spec.ts'],

      env: {
        type: 'node',
        runner: 'node',
      },

      preprocessors: {
      },

      setup(wallaby) {
        const jestConfig = require('./package').jest || require('./jest.config')
        delete jestConfig.transform['^.+\\.tsx?$']
        Object.keys(jestConfig.moduleNameMapper).forEach(k => (jestConfig.moduleNameMapper[k] = jestConfig.moduleNameMapper[k].replace('<rootDir>', wallaby.localProjectDir)))
        wallaby.testFramework.configure(jestConfig)
      },

      testFramework: 'jest',

      debug: true
    }
  }
