const { prisma } = require('../config/db');

const createService = async (req, res, next) => {
  try {
    const { name, description, price } = req.body;
    const service = await prisma.service.create({ data: { name, description, price } });
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

const listServices = async (req, res, next) => {
  try {
    const services = await prisma.service.findMany();
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
};

module.exports = { createService, listServices };
