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

  Product.PRODUCT_SIZE = ['S', 'M', 'L'];
  Product.PRODUCT_BRAND = ['Kipsta', 'Quechua', 'Artengo'];
  Product.PRODUCT_COLOR = ['Blue', 'Green', 'White'];

  return Product;
};

module.exports = Products;
