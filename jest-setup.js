if (typeof btoa === 'undefined') {
    global.btoa = (str) => {
        return Buffer.from(str, 'binary').toString('base64');
    };
}

if (typeof atob === 'undefined') {
    global.atob = (b64Encoded) => {
        return Buffer.from(b64Encoded, 'base64').toString('binary');
    };
}

const error = global.console.error;

global.console.error = (...args) => {
    error(...args); // keep default behaviour
    throw new Error(...args);
};
