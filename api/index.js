const app = require('../dist/index').default;

module.exports = (req, res) => {
  app(req, res);
}; 