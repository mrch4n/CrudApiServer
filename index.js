const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');

const db = require('./api/models');

db.sequelize.sync();

const corsOptions = {
  origin: `http://localhost:${port}`,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routes = require('./api/routes');

routes(app);

app.listen(port);

// eslint-disable-next-line no-console
console.log(`API Server listening on : ${port}`);
