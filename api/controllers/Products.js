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

exports.create = (req, res) => {
  if (!req.body.name
    || !req.body.brand
    || !req.body.size
    || !req.body.color) {
    res.status(400).send({
      message: 'name/brand/size/color/avilibility cannot be empty.',
    });
    return;
  }

  let availabilityString = null;

  try {
    const { startDatetime, endDatetime } = req.body;
    if (startDatetime && endDatetime) {
      const startDatetimeStamp = new Date(parseInt(startDatetime, 10)).toISOString();
      const endDatetimeStamp = new Date(parseInt(endDatetime, 10)).toISOString();
      availabilityString = `["${startDatetimeStamp}/${endDatetimeStamp}"]`;
    }
  } catch (e) {
    res.status(500).send({
      message: e.message || 'Product creation failed: start/end time incorrect.',
    });
  }

  const product = {
    name: req.body.name,
    brand: req.body.brand,
    size: req.body.size,
    color: req.body.color,
    availability: availabilityString || '[]',
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

exports.checkAvailability = (req, res) => {
  if (!req.params.pid) {
    res.status(400).send({
      message: 'Id was not specified.',
    });
    return;
  }
  const { pid } = req.params;
  Product.findByPk(pid)
    .then((data) => {
      const stringIntervalArray = JSON.parse(data.availability);
      if (stringIntervalArray.length > 0) {
        res.send(stringIntervalArrayToJsonIntervalArray(stringIntervalArray));
      } else {
        res.send('[]');
      }
    })
    .catch((e) => {
      res.status(500).send({
        message: e.message || 'Check availability failed.',
      });
    });
};

exports.setAvailability = (req, res) => {
  if (!req.params.pid || !req.body.startDatetime || !req.body.endDatetime) {
    res.status(400).send({
      message: 'Id, start Datetime or end Datetime was not specified.',
    });
    return;
  }
  const { pid } = req.params;
  const { startDatetime, endDatetime } = req.body;
  const start = DateTime.fromMillis(parseInt(startDatetime, 10)); // from Date.getTime() format.
  const end = DateTime.fromMillis(parseInt(endDatetime, 10));
  const newAvailabilityInterval = Interval.fromDateTimes(start, end);

  let stringIntervalArray;
  let jsonIntervalArray;

  Product.findByPk(pid)
    .then((data) => {
      stringIntervalArray = JSON.parse(data.availability);

      stringIntervalArray.push(newAvailabilityInterval.toISO());
      jsonIntervalArray = stringIntervalArrayToJsonIntervalArray(stringIntervalArray);

      Product.update({ availability: JSON.stringify(stringIntervalArray) }, {
        where: { id: pid },
      });
      res.send(jsonIntervalArray);
    })
    .catch((e) => {
      res.status(500).send({
        message: e.message || 'Check availability failed.',
      });
    });
};
