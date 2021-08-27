const db = require('../models');

const Product = db.products;

exports.create = (req, res) => {
  if (!req.body.name
    || !req.body.brand
    || !req.body.size
    || !req.body.color
    || !req.body.availability) {
    res.status(400).send({
      message: 'name/brand/size/color/avilibility cannot be empty.',
    });
    return;
  }

  const product = {
    name: req.body.name,
    brand: req.body.brand,
    size: req.body.size,
    color: req.body.color,
    availability: req.body.availability,
  };

  Product.create(product)
    .then((data) => {
      res.send(data);
    })
    .catch((e) => {
      res.status(500).send({
        message: e.message || 'Production creation failed.',
      });
    });
};

exports.findAll = (req, res) => {
  Product.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((e) => {
      res.status(500).send({
        message: e.message || 'Find all products failed.',
      });
    });
};

exports.findById = (req, res) => {
  if (!req.params.id) {
    res.status(400).send({
      message: 'Id cannot be empty.',
    });
    return;
  }
  const { id } = req.params;

  Product.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((e) => {
      res.status(500).send({
        message: e.message || 'Find by id failed.',
      });
    });
};

exports.updateById = (req, res) => {
  if (!req.params.id) {
    res.status(400).send({
      message: 'Id is not specified.',
    });
    return;
  }
  const { id } = req.params;
  Product.update(req.body, {
    where: { id },
  })
    .then((num) => {
      if (num[0] === 1) {
        res.send({
          message: 'Product was updated successfully.',
        });
      } else {
        res.status(400).send({
          message: `Product update failed. Id = ${id} not found or body is empty.`,
        });
      }
    })
    .catch((e) => {
      res.status(500).send({
        message: e.message || 'Update failed.',
      });
    });
};

exports.deleteById = (req, res) => {
  if (!req.params.id) {
    res.status(400).send({
      message: 'Id is not specified.',
    });
    return;
  }
  const { id } = req.params;

  Product.destroy({
    where: { id },
  })
    .then((num) => {
      if (num === 1) {
        res.send({
          message: 'Product was deleted successfully.',
        });
      } else {
        res.status(400).send({
          message: `Production delete failed. Id = ${id} not found.`,
        });
      }
    })
    .catch((e) => {
      res.status(500).send({
        message: e.message || 'Delete failed.',
      });
    });
};
