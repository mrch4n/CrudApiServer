const { Interval, DateTime } = require('luxon');
const db = require('../models');

const Product = db.products;

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

const stringIntervalArrayToIntervalArray = (stringIntervalArray) => {
  const intervalArray = [];
  stringIntervalArray.forEach((stringInterval) => {
    intervalArray.push(Interval.fromISO(stringInterval));
  });
  return intervalArray;
};

const checkAvailabilityFromIntervalArray = (intervalArray, time) => {
  let available = false;
  intervalArray.forEach((interval) => {
    if (interval.contains(time)) available = true;
  });
  return available;
};

const returnErrorStatus = (res, errorStatus, errorMessage) => {
  res.status(errorStatus).send({
    message: errorMessage,
  });
};

const bodyChecking = (req, res) => {
  const { brand, size, color } = req.body;
  const verifyBrand = Product.PRODUCT_BRAND.includes(brand);
  const verifySize = Product.PRODUCT_SIZE.includes(size);
  const verifyColor = Product.PRODUCT_COLOR.includes(color);

  if (verifyBrand && verifySize && verifyColor) {
    return true;
  }
  res.status(400).send({
    message: `${(verifyBrand ? '' : 'brand ')}${(verifySize ? '' : 'size ')}${(verifyColor ? '' : 'color ')}incorrect.`,
  });
  return false;
};

exports.create = (req, res) => {
  const {
    name, brand, size, color, startDatetime, endDatetime,
  } = req.body;
  if (!name || !brand || !size || !color) {
    returnErrorStatus(res, 400, 'name/brand/size/color cannot be empty.');
    return;
  }
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
  if (!req.params.id) {
    returnErrorStatus(res, 400, 'ID cannot be empty.');
    return;
  }
  const { id } = req.params;

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
  if (!id) {
    returnErrorStatus(res, 400, 'ID is not specified.');
    return;
  }
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
              res.status(400).send({
                message: `Product update failed. Id = ${id} not found or body is empty.`,
              });
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
  if (!id) {
    returnErrorStatus(res, 400, 'ID is not specified.');
    return;
  }

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
      returnErrorStatus(res, 500, `Delete failed. ${e.message}`);
    });
};

exports.getAvailabilities = (req, res) => {
  const { pid } = req.params;
  if (!pid) {
    returnErrorStatus(res, 400, 'ID was not specified.');
    return;
  }

  Product.findByPk(pid)
    .then((data) => {
      if (data) {
        const stringIntervalArray = JSON.parse(data.availability);
        if (stringIntervalArray.length > 0) {
          res.send(stringIntervalArrayToJsonIntervalArray(stringIntervalArray));
        } else {
          res.send('[]');
        }
      } else {
        returnErrorStatus(res, 404, `ID = ${pid} not found.`);
      }
    })
    .catch((e) => {
      returnErrorStatus(res, 500, `Check availability failed. ${e.message}`);
    });
};

exports.setAvailability = (req, res) => {
  const { pid } = req.params;
  const { startDatetime, endDatetime } = req.body;

  if (!pid || !startDatetime || !endDatetime) {
    returnErrorStatus(res, 400, 'ID, startDatetime or endDatetime was not specified.');
    return;
  }

  const start = DateTime.fromMillis(parseInt(startDatetime, 10)); // from Date.getTime() format.
  const end = DateTime.fromMillis(parseInt(endDatetime, 10));
  const newAvailabilityInterval = Interval.fromDateTimes(start, end);

  let stringIntervalArray;
  let jsonIntervalArray;

  Product.findByPk(pid)
    .then((data) => {
      if (data) {
        stringIntervalArray = JSON.parse(data.availability);

        stringIntervalArray.push(newAvailabilityInterval.toISO()); // convert Interval to string (https://en.wikipedia.org/wiki/ISO_8601#Time_intervals)
        jsonIntervalArray = stringIntervalArrayToJsonIntervalArray(stringIntervalArray);

        Product.update({ availability: JSON.stringify(stringIntervalArray) }, {
          where: { id: pid },
        });
        res.send(jsonIntervalArray);
      } else {
        returnErrorStatus(res, 404, `ID = ${pid} not found.`);
      }
    })
    .catch((e) => {
      returnErrorStatus(res, 500, `Check availability failed. ${e.message}`);
    });
};

exports.checkAvailability = (req, res) => {
  const { pid } = req.params;
  if (!pid) {
    returnErrorStatus(res, 400, 'ID was not specified.');
    return;
  }
  let available = false;

  Product.findByPk(pid)
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
        returnErrorStatus(res, 404, `ID = ${pid} not found.`);
      }
    })
    .catch((e) => {
      returnErrorStatus(res, 500, `Check availability failed. ${e.message}`);
    });
};
