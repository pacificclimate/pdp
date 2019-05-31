module.exports = {
    name: 'pdp-frontend-tests',
    setupFiles: [
        // Get rid of Error: Not implemented: HTMLCanvasElement.prototype.getContext
        // See https://github.com/hustcc/jest-canvas-mock/issues/2#issuecomment-468600415
        './node_modules/jest-canvas-mock/lib/index.js',
    ],
    testEnvironment: "jest-environment-jsdom-fourteen"
};