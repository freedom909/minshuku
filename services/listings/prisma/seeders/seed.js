const { PrismaClient } = require('@prisma/client');
const {v4:uuidv4}=require('uuid')
const listings = require('./listings.json');
const amenities = require('./amenities.json');
const listingAmenities = require('./listingamenities.json');

const prisma = new PrismaClient();

async function main() {
  for (let listing of listings) {
    await prisma.listing.create({
      data: listing,
    });
  }

  for (let amenity of amenities) {
    await prisma.amenity.create({
      data: amenity,
    });
  }

  for (let listingAmenity of listingAmenities) {
    await prisma.listingAmenities.create({
      data: {
        id:uuidv4(),
        AmenityId: listingAmenity.AmenityId,
        ListingId: listingAmenity.ListingId
      }
    });
  }
  
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
