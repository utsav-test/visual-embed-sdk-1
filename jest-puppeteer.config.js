module.exports = {
    launch: {
        headless: process.env.HEADLESS !== 'false',
        // headless: false,
        slowMo: process.env.SLOWMO ? process.env.SLOWMO : 0,
        // slowMo: 200,
        // devtools: true,
    },
    server: {
        command:
            'npm run docs-cmd -- clean && npm run docs-cmd -- build &&  npm run docs-cmd -- serve',
        port: 9000,
        protocol: 'http',
        launchTimeout: 50000,
        debug: true,
        waitOnScheme: {
            interval: 5000,
        },
        usedPortAction: 'kill',
    },
};
