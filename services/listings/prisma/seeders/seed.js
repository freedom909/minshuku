import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import listingsData from "./listings.json" assert { type: "json" };
import amenitiesData from "./amenities.json" assert { type: "json" };
import listingAmenitiesData from "./listingamenities.json" assert { type: "json" };

const prisma = new PrismaClient();

async function main() {
  for (let l of listingsData) {
    const listing = await prisma.listing.create({
      data: l,
    });

    console.log(`Created listing with id: ${listing.id}`);
  }

  for (let a of amenitiesData) {
    const amenity = await prisma.amenity.create({
      data: a,
    });
    console.log(`Created amenity with id: ${amenity.id}`);
  }

  for (let listingAmenity of listingAmenitiesData) {
    await prisma.listingAmenities.create({
      data: {
        id: uuidv4(),
        listing: {
          connect: { id: listingAmenity.ListingId },
        },
        amenity: {
          connect: { id: listingAmenity.AmenityId },
        },
      },
    });
    console.log("created");
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
