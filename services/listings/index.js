import express, { json } from "express";
import { v4 as uuidv4 } from "uuid";
const app = express();
const port = 4010 || process.env.PORT;
import help from "./helpers.js";
const { getDifferenceInDays, transformListingWithAmenities } =help
import { PrismaClient} from "@prisma/client";
const prisma = new PrismaClient()
app.use(json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// get listing matching query params
app.get("/listings", async (req, res) => {
  const { page = 1, limit = 5, sortBy } = req.query;
  const skipValue = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const minNumOfBeds = parseInt(req.query.numOfBeds);

  let sortOrder = { costPerNight: 'desc' }; // default descending cost
  if (sortBy === "COST_ASC") {
    sortOrder = { costPerNight: 'asc' };
  }

  const listings = await prisma.listing.findMany({
    where: {
      numOfBeds: {
        gte: minNumOfBeds,
      },
    },
    orderBy: sortOrder,
    take: parseInt(limit, 10),
    skip: skipValue,
  });

  return res.json(listings);
});

// get 3 featured listings
app.get("/featured-listings", async (req, res) => {
  let limit = Number(req.query.limit);
  if (isNaN(limit)) {
    limit = 3; // Set a default value
  }
  
  const listings = await prisma.listing.findMany({
    where: {
      isFeatured: true,
    },
    take: limit,
  });

  return res.json(listings);
});


// get all listings for a specific user
app.get("/user/:userId/listings", async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { hostId: req.params.userId },
  });
  return res.json(listings);
});

// get listing info for a specific listing
app.get("/listings/:listingId", async (req, res) => {
  const listingInstance = await prisma.listing.findOne({
    where: { id: req.params.listingId },
    include: Amenity,
  });
  const listingToReturn = transformListingWithAmenities(listingInstance);

  return res.json(listingToReturn);
});

// get listing info for a specific listing
app.get("/listings/:listingId/totalCost", async (req, res) => {
  const { costPerNight } = await prisma.listing.findOne({
    where: { id: req.params.listingId },
    attributes: ["costPerNight"],
  });

  if (!costPerNight) {
    return res.status(400).send("Could not find listing with specified ID");
  }

  const { checkInDate, checkOutDate } = req.query;
  const diffInDays = getDifferenceInDays(checkInDate, checkOutDate);

  if (diffInDays === NaN) {
    return res
      .status(400)
      .send(
        "Could not calculate total cost. Please double check the check-in and check-out date format."
      );
  }

  return res.json({ totalCost: costPerNight * diffInDays });
});

// get all possible listing amenities
app.get("/listing/amenities", async (req, res) => {
  const amenities = await prisma.amenity.findMany();
  return res.json(amenities);
});

// create a listing
app.post("/listings", async (req, res) => {
  /*
    // this should never be triggered when called from the mutation resolver as the input will be validated,
    // do we keep it in case we call the REST endpoint directly
    if (!(title && photoThumbnail && description && numOfBeds && costPerNight && hostId && locationType && amenities)) {
      return res.status(400).send('missing data to create a new listing');
    }
  */
  const listingData = req.body.listing;
  const amenitiesData = req.body.listing.amenities;
  const id = uuidv4();

  const listing = await prisma.listing.create({
    id,
    ...listingData,
  });

  await listing.setAmenities(amenitiesData);

  let updatedListing = await prisma.listing.findOne({
    include: Amenity,
    where: { id },
  });
  const listingToReturn = transformListingWithAmenities(updatedListing);

  return res.json(listingToReturn);
});

// edit a listing
app.patch("/listings/:listingId", async (req, res) => {
  let listing = await prisma.listing.findOne({
    include: Amenity,
    where: { id: req.params.listingId },
  });

  const newListing = req.body.listing;
  const newAmenities = req.body.listing.amenities;

  await listing.update({ ...newListing });
  await listing.setAmenities(newAmenities);

  let updatedListing = await prisma.listing.findOne({
    include: Amenity,
    where: { id: req.params.listingId },
  });
  const listingToReturn = transformListingWithAmenities(updatedListing);

  return res.json(listingToReturn);
});

app.listen(port, () => {
  console.log(`Listing API running at http://localhost:${port}`);
});
