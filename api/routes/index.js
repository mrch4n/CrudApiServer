const product = require('../controllers/Products');

function apiRoute(app) {
  app.route('/api/products')
    .get(product.findAll)
    .post(product.create);

  app.route('/api/products/:id?')
    .get(product.findById)
    .put(product.updateById)
    .delete(product.deleteById);

  app.route('/api/products/:id?/availability')
    .get(product.getAvailabilities)
    .put(product.setAvailability);

  app.route('/api/products/:id?/available')
    .get(product.checkAvailability);

  app.use((req, res) => {
    res.status(404).send({
      message: `${req.path} not found.`,
    });
  });
}

module.exports = apiRoute;
