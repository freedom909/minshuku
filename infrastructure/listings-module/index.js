// infrastructure/listings/index.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getListings = async () => {
  return await prisma.listing.findMany();
};

// Export other listings-related functions and rules...
export { getListings, prisma };
