const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const connect = async () => {
  try {
    await prisma.$connect();
    console.log('Prisma connected');
  } catch (err) {
    console.error('Prisma connection error', err);
    process.exit(1);
  }
};

module.exports = { prisma, connect };
