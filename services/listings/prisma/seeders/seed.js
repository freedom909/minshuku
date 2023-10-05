
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import listings from './listings.json' assert {type:"json"};
import amenities from './amenities.json'assert { type: 'json' };
import listingAmenities from './listingamenities.json'assert { type: 'json' };

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