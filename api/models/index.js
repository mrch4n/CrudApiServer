const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database/database.sqlite',
});

sequelize.authenticate()
  .catch((e) => {
    throw new Error(`Database connection error: ${e.message}`);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.products = require('./Products')(sequelize, Sequelize);

module.exports = db;
