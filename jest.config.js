module.exports = {
  name: 'pdp-frontend-tests',
  setupFiles: [
    // Fix HTMLCanvasElement.prototype.getContext, and canvas errors.
    // See https://github.com/hustcc/jest-canvas-mock/issues/2#issuecomment-468600415
    './node_modules/jest-canvas-mock/lib/index.js'
  ],
  testEnvironment: "jest-environment-jsdom-fourteen"
};