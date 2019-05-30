module.exports = {
  setupFiles: [
    // Fix HTMLCanvasElement.prototype.getContext, and canvas errors.
    './node_modules/jest-canvas-mock/lib/index.js'
  ]
};
