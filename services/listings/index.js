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
  const skipValue = (parseInt(page, 10) - 1) * parseInt(limit, 10); // 0 indexed for page
  const { numOfBeds: minNumOfBeds } = req.query;

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
  console.log(listings);
  return res.json(listings);
});

// get listing info for a specific listing
app.get("/listings/:listingId", async (req, res) => {
  const listingInstance = await prisma.listing.findUnique({
    where: { id: req.params.listingId },
    include: { amenities: true },
  });
  console.log(listingInstance);
  if (!listingInstance) {
    return res.status(404).send("Listing not found");
  }

  const listingToReturn = transformListingWithAmenities(JSON.parse(JSON.stringify(listingInstance)));

  return res.json(listingToReturn);
});


// get listing info for a specific listing
app.get("/listings/:listingId/totalCost", async (req, res) => {
  const listingInstance = await prisma.listing.findUnique({
    where: { id: req.params.listingId },
    select: { costPerNight: true },
  });

  if (!listingInstance) {
    return res.status(400).send("Could not find listing with specified ID");
  }

  const { checkInDate, checkOutDate } = req.query;
  const diffInDays = getDifferenceInDays(checkInDate, checkOutDate);

  if (isNaN(diffInDays)) {
    return res
      .status(400)
      .send(
        "Could not calculate total cost. Please double check the check-in and check-out date format."
      );
  }

  return res.json({ totalCost: listingInstance.costPerNight * diffInDays });
});

// get all possible listing amenities
app.get("/listing/amenities", async (req, res) => {
  const amenities = await prisma.amenity.findMany();
  const transAmenities=transformListingWithAmenities(amenities)
  
  return res.json(transAmenities);
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
  data: {
    id,
    ...listingData,
    amenities: {
      connect: amenitiesData.map((amenity) => ({ id: amenity.id }))
    }
  }
});


let updatedListing = await prisma.listing.findUnique({
   include:{amenities:true},
   where:{id}
 });
 
const listingToReturn = transformListingWithAmenities(updatedListing);

return res.json(listingToReturn);
});

// edit a listing
app.patch("/listings/:listingId", async (req, res) => {

let listing = await prisma.listing.findUnique({
   include:{amenities:true},
   where:{id:req.params.listingId}
 });

const newListingData=req.body.listing;
const newAmenities=req.body.listing.amenities;

await prisma.listing.update({
   where:{id:req.params.listingId},
   data:{
     ...newListingData,
     amenities:{
       set:[],
       connectOrCreate:newAmenities.map((amenity)=>({where:{id:amenity.id},create:{id:amenity.id,name:amenity.name}}))
     }
   }
 });

  let updatedListing = await prisma.listing.findUnique({
    include: Amenity,
    where: { id: req.params.listingId },
  });
  const listingToReturn = transformListingWithAmenities(updatedListing);

  return res.json(listingToReturn);
});

app.listen(port, () => {
  console.log(`Listing API running at http://localhost:${port}`);
});
