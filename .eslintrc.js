module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2020": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 11
    },
    "rules": {
    },
    "overrides": [
        {
        "files": [
            "**/*.test.js",
        ],
        "env": {
            "jest": true
        }
        }
    ]
    
};
