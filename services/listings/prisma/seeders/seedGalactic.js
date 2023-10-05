import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import listings from './listings.json'assert { type: 'json' } ;
import amenities from './amenities.json' assert { type: 'json' } ;
// import listingAmenities from './listingamenities.json';
import GalacticCoordinates from './GalacticCoordinates.json' assert { type: 'json' };

const prisma = new PrismaClient();

async function main() {

  for (let listing of listings) {
    if (listing) {
      // Find the corresponding galacticCoordinates for this listing
      let galacticCoordinates = GalacticCoordinates.find(gc => gc.id === listing.galacticCoordinateId);
      
      // If galacticCoordinates exists, update the listing with galacticCoordinates data
      if (galacticCoordinates) {
        await prisma.listing.update({
          where: { id: listing.id },
          data: { 
            galacticCoordinate: {
              connectOrCreate: {
                create: {
                  ...galacticCoordinates,
                  id: uuidv4(),  // generate a new UUID for the id
                },
                where: { id: uuidv4() },
              },
            },
          },
        });
      }
    }
  }
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  })