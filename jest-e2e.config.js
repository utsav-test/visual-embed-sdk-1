module.exports = {
    preset: 'jest-puppeteer',
    globals: {
        URL: 'http://localhost:9000'
    },
    testMatch: ['**/docs/test/**/*.spec.ts'],
    verbose: true,
};
