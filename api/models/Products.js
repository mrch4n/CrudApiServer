const Products = (sequelize, Sequelize) => {
  const Product = sequelize.define('product', {
    name: {
      type: Sequelize.STRING,
    },
    brand: {
      type: Sequelize.ENUM('Kipsta', 'Quechua', 'Artengo'),
    },
    size: {
      type: Sequelize.ENUM('S', 'M', 'L'),
    },
    color: {
      type: Sequelize.ENUM('Blue', 'Green', 'White'),
    },
    availability: {
      type: Sequelize.STRING,
      default: '[]',
    },
  });
  return Product;
};

module.exports = Products;
