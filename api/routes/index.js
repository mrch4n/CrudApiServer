const product = require('../controllers/Products');

function apiRoute(app) {
  app.route('/api/products')
    .get(product.findAll)
    .post(product.create);

  app.route('/api/products/:id?')
    .get(product.findById)
    .put(product.updateById)
    .delete(product.deleteById);

  app.route('/api/availability/:pid?')
    .get(product.getAvailabilities)
    .put(product.setAvailability);
  app.route('/api/available/:pid?')
    .get(product.checkAvailability);

}

module.exports = apiRoute;
