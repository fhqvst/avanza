var path = require('path');

module.exports = {
  "parserOptions": { "ecmaVersion": 8 },
  "env": { "es6": true },
  "rules": {
    "generator-star-spacing": 0,
    "semi": ["error", "never"],
    "indent": ["error", 2],
    "no-underscore-dangle": ["off", { "allow": ["_id"] }],
    "no-cond-assign": ["error", "except-parens"],
    "new-cap": ["error", { "capIsNewExceptions": ["Router", "ObjectId"] }],
    "no-unused-vars": ["warn", { "argsIgnorePattern": "next|reject" }],
    "no-console": 0,
    "consistent-return": 0,
    "no-param-reassign": 0,
    "no-use-before-define": ["error", { "functions": false }],
    "comma-dangle": ["error", "never"],
    "arrow-parens": 0,
    "padded-blocks": 0,
    "func-names": 0,
    "import/no-named-as-default-member": 0
  },
  "settings": {
    "import/resolver": {
      "node": {
        "paths": [path.resolve(__dirname, 'lib')]
      }
    }
  }
}
