const { Interval, DateTime } = require('luxon');
const db = require('../models');

const Product = db.products;

/**
 * A function to convert array of stringInterval to array of jsonInterval
 * @param {Array} stringIntervalArray An array of stringInterval
 * @returns {Array} An array of jsonInterval
 */
const stringIntervalArrayToJsonIntervalArray = (stringIntervalArray) => {
  if (stringIntervalArray.length > 0) {
    const jsonIntervalArray = [];
    stringIntervalArray.forEach((stringInterval) => {
      const i = Interval.fromISO(stringInterval);
      jsonIntervalArray.push({
        string: i.toISO(),
        start: i.s.ts,
        end: i.e.ts,
      });
    });
    return jsonIntervalArray;
  }
  return [];
};

/**
 * A function to convert array of StringInterval to array of Interval
 * @param {Array} stringIntervalArray An array of stringInterval
 * @returns {Array} An array of Interval
 */
const stringIntervalArrayToIntervalArray = (stringIntervalArray) => {
  const intervalArray = [];
  stringIntervalArray.forEach((stringInterval) => {
    intervalArray.push(Interval.fromISO(stringInterval));
  });
  return intervalArray;
};

/**
 * This function check if a particular time contains in an array of Interval
 * @param {Array} intervalArray Array of Interal
 * @param {DateTime} time A time to check with
 * @returns {Boolean}
 */
const checkAvailabilityFromIntervalArray = (intervalArray, time) => {
  let available = false;
  intervalArray.forEach((interval) => {
    if (interval.contains(time)) available = true;
  });
  return available;
};

/**
 * This function send error response to user.
 * @param {Object} res Express.js Response Object
 * @param {Int} errorStatus HTTP Error Code
 * @param {String} errorMessage Error message
 */
const returnErrorStatus = (res, errorStatus, errorMessage) => {
  // TODO: implement logging.
  res.status(errorStatus).send({
    message: errorMessage,
  });
};

/**
 * This function check body.brand, body.size and body.color contain pre-definded string.
 * @param {Object} req Express.js Request Object
 * @param {Object} res Express.js Response Object
 * @returns {Boolean}
 */
const bodyChecking = (req, res) => {
  const { brand, size, color } = req.body;
  const verifyBrand = Product.PRODUCT_BRAND.includes(brand);
  const verifySize = Product.PRODUCT_SIZE.includes(size);
  const verifyColor = Product.PRODUCT_COLOR.includes(color);

  if (verifyBrand && verifySize && verifyColor) {
    return true;
  }
  returnErrorStatus(res, 400, `${(verifyBrand ? '' : 'brand ')}${(verifySize ? '' : 'size ')}${(verifyColor ? '' : 'color ')}incorrect.`);
  return false;
};

/**
 * This function check if any value of the object is null.
 * @param {Object} valueObject A Object contains the value to check with.
 * @param {Object} res Express.js Response Object.
 * @returns {Boolean}
 */
const emptyCheck = (valueObject, res) => {
  let strBuilder = '';

  Object.keys(valueObject).forEach((v) => {
    if (!valueObject[v]) {
      strBuilder += `${v} `;
    }
  });
  if (strBuilder === '') {
    return true;
  }
  res.status(400).send({
    message: `${strBuilder}was empty.`,
  });
  return false;
};

exports.create = (req, res) => {
  const {
    name, brand, size, color, startDatetime, endDatetime,
  } = req.body;

  if (!emptyCheck({
    name, brand, size, color,
  }, res)) return;
  if (!bodyChecking(req, res)) return;

  let availabilityString = null;

  if (startDatetime && endDatetime) {
    try {
      const startDatetimeStamp = new Date(parseInt(startDatetime, 10)).toISOString();
      const endDatetimeStamp = new Date(parseInt(endDatetime, 10)).toISOString();
      availabilityString = `["${startDatetimeStamp}/${endDatetimeStamp}"]`;
    } catch (e) {
      returnErrorStatus(res, 500, `Product creation failed: start/end time incorrect. ${e.message}`);
    }
  }

  const product = {
    name,
    brand,
    size,
    color,
    availability: availabilityString || '[]',
  };

  Product.create(product)
    .then((data) => {
      res.send(data);
    })
    .catch((e) => {
      returnErrorStatus(res, 500, `Production creation failed. ${e.message}`);
    });
};

exports.findAll = (req, res) => {
  Product.findAll()
    .then((data) => {
      const response = [];
      data.forEach((product) => {
        const output = product;
        const stringIntervalArray = JSON.parse(product.availability);
        if (stringIntervalArray.length > 0) {
          output.availability = stringIntervalArrayToJsonIntervalArray(stringIntervalArray);
        }
        response.push(output);
      });
      res.send(response);
    })
    .catch((e) => {
      returnErrorStatus(res, 500, `Find all products failed. ${e.message}`);
    });
};

exports.findById = (req, res) => {
  const { id } = req.params;

  if (!emptyCheck({ id }, res)) return;

  Product.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        returnErrorStatus(res, 404, `ID = ${id} not found.`);
      }
    })
    .catch((e) => {
      res.status(500).send({
        message: `Find by id failed. ${e.message}`,
      });
    });
};

exports.updateById = (req, res) => {
  const { id } = req.params;

  if (!emptyCheck({ id }, res)) return;
  if (!bodyChecking(req, res)) return;

  let newAvailabilityInterval = false;

  const { startDatetime, endDatetime } = req.body;
  if (startDatetime && endDatetime) {
    const start = DateTime.fromMillis(parseInt(startDatetime, 10)); // from Date.getTime() format.
    const end = DateTime.fromMillis(parseInt(endDatetime, 10));
    newAvailabilityInterval = Interval.fromDateTimes(start, end);
  }

  let stringIntervalArray;
  const updatedProduct = req.body;

  Product.findByPk(id)
    .then((data) => {
      if (data) {
        stringIntervalArray = JSON.parse(data.availability);
        if (newAvailabilityInterval) {
          stringIntervalArray.push(newAvailabilityInterval.toISO());
        }
        updatedProduct.availability = JSON.stringify(stringIntervalArray);
        Product.update(updatedProduct, {
          where: { id },
        })
          .then((num) => {
            if (num[0] === 1) {
              res.send({
                message: 'Product was updated successfully.',
              });
            } else {
              returnErrorStatus(res, 400, `Product update failed. Id = ${id} not found or body is empty.`);
            }
          });
      } else {
        returnErrorStatus(res, 404, `ID = ${id} not found.`);
      }
    })
    .catch((e) => {
      returnErrorStatus(res, 500, `Update failed. ${e.message}`);
    });
};

exports.deleteById = (req, res) => {
  const { id } = req.params;
  if (!emptyCheck({ id }, res)) return;

  Product.destroy({
    where: { id },
  })
    .then((num) => {
      if (num === 1) {
        res.send({
          message: 'Product was deleted successfully.',
        });
      } else {
        returnErrorStatus(res, 400, `Product delete failed. Id = ${id} not found.`);
      }
    })
    .catch((e) => {
      returnErrorStatus(res, 500, `Product delete failed. ${e.message}`);
    });
};

exports.getAvailabilities = (req, res) => {
  const { id } = req.params;
  if (!emptyCheck({ id }, res)) return;

  Product.findByPk(id)
    .then((data) => {
      if (data) {
        const stringIntervalArray = JSON.parse(data.availability);
        if (stringIntervalArray.length > 0) {
          res.send(stringIntervalArrayToJsonIntervalArray(stringIntervalArray));
        } else {
          res.send('[]');
        }
      } else {
        returnErrorStatus(res, 404, `ID = ${id} not found.`);
      }
    })
    .catch((e) => {
      returnErrorStatus(res, 500, `Check availability failed. ${e.message}`);
    });
};

exports.setAvailability = (req, res) => {
  const { id } = req.params;
  const { startDatetime, endDatetime } = req.body;

  if (!emptyCheck({ id, startDatetime, endDatetime }, res)) return;

  const start = DateTime.fromMillis(parseInt(startDatetime, 10)); // from Date.getTime() format.
  const end = DateTime.fromMillis(parseInt(endDatetime, 10));
  const newAvailabilityInterval = Interval.fromDateTimes(start, end);

  let stringIntervalArray;
  let jsonIntervalArray;

  Product.findByPk(id)
    .then((data) => {
      if (data) {
        stringIntervalArray = JSON.parse(data.availability);

        stringIntervalArray.push(newAvailabilityInterval.toISO()); // convert Interval to string (https://en.wikipedia.org/wiki/ISO_8601#Time_intervals)
        jsonIntervalArray = stringIntervalArrayToJsonIntervalArray(stringIntervalArray);

        Product.update({ availability: JSON.stringify(stringIntervalArray) }, {
          where: { id },
        });
        res.send(jsonIntervalArray);
      } else {
        returnErrorStatus(res, 404, `ID = ${id} not found.`);
      }
    })
    .catch((e) => {
      returnErrorStatus(res, 500, `Check availability failed. ${e.message}`);
    });
};

exports.checkAvailability = (req, res) => {
  const { id } = req.params;
  if (!emptyCheck({ id }, res)) return;

  let available = false;

  Product.findByPk(id)
    .then((product) => {
      if (product) {
        const stringIntervalArray = JSON.parse(product.availability);

        if (stringIntervalArray.length > 0) {
          const intervalArray = stringIntervalArrayToIntervalArray(stringIntervalArray);
          if (checkAvailabilityFromIntervalArray(intervalArray, DateTime.now())) available = true;
        }

        res.status(200).send({
          available,
        });
      } else {
        returnErrorStatus(res, 404, `ID = ${id} not found.`);
      }
    })
    .catch((e) => {
      returnErrorStatus(res, 500, `Check availability failed. ${e.message}`);
    });
};
