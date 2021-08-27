const product = require('../controllers/Products');

function apiRoute(app) {
  app.route('/api/products')
    .get(product.findAll)
    .post(product.create);

  app.route('/api/products/:id')
    .get(product.findById)
    .put(product.updateById)
    .delete(product.deleteById);
}

module.exports = apiRoute;
