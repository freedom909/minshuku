import express,{ json }  from 'express';
import { Op } from'sequelize';
import database from '../models/sequelize.js';
import Listing from '../models/listing.js';
import help from "./helpers.js";
const { getDifferenceInDays, transformListingWithAmenities } = help;

const app = express();
const port = 4010 || process.env.PORT;
app.use(json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// get listing matching query params
app.get("/listings", async (req, res) => {
  const { page = 1, limit = 5, sortBy } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10); // 0 indexed for page
  const { numOfBeds: minNumOfBeds } = req.query;

  let order = [['costPerNight', 'DESC']]; // default descending cost
  if (sortBy === "COST_ASC") {
    order = [['costPerNight', 'ASC']];
  }

  const listings = await Listing.findAll({
    where: {
      numOfBeds: {
        [Op.gte]: minNumOfBeds,
      },
    },
    order,
    limit: parseInt(limit, 10),
    offset,
  });

  return res.json(listings);
});

// get 3 featured listings
app.get("/featured-listings", async (req, res) => {
  let limit = Number(req.query.limit);
  if (isNaN(limit)) {
    limit = 3; // Set a default value
  }
  const listings = await Listing.findAll({
    where: {
      isFeatured: true,
    },
    limit,
  });

  return res.json(listings);
});

// get all listings for a specific user
app.get("/user/:userId/listings", async (req, res) => {
  const listings = await Listing.findAll({
    where: { hostId: req.params.userId },
  });
  return res.json(listings);
});

//defined a globe variable
let transAmenities = []

// get all possible listing amenities,this route should be before of "/listing/listingId"
app.get("/listing/amenities", async (req, res) => {
  const amenitiesList = await Amenity.findAll();
  const amenities = amenitiesList.map(amenity => ({
    ...amenity.dataValues,
    category: amenity.category.replace(/ /g, '_').toUpperCase()
  }));
  const transAmenities = transformListingWithAmenities(amenities); // Update the global variable

  if (!transAmenities) {
    return res.status(400).send("Could not find any amenities");
  }

  return res.json(transAmenities);
});

app.get("/listing/:listingId", async (req, res) => {
  const listingInstance = await Listing.findByPk(req.params.listingId, {
    include: Amenity,
  });

  if (!listingInstance) {
    return res.status(404).send("Listing not found");
  }

  const transformedAmenities = transformListingWithAmenities(listingInstance.Amenities);
  const listingToReturn = { ...listingInstance.dataValues, amenities: transformedAmenities };

  return res.json(listingToReturn);
});

app.get("/listings/:listingId/totalCost", async (req, res) => {
  const listingInstance = await Listing.findByPk(req.params.listingId, {
    attributes: ['costPerNight'],
  });

  if (!listingInstance) {
    return res.status(400).send("Could not find listing with specified ID");
  }

  const { checkInDate, checkOutDate } = req.query;
  const diffInDays = getDifferenceInDays(checkInDate, checkOutDate);

  if (isNaN(diffInDays)) {
    return res.status(400).send("Could not calculate total cost. Please double check the check-in and check-out date format.");
  }

  return res.json({ totalCost: listingInstance.costPerNight * diffInDays });
});

// create a listing
app.post("/listings", async (req, res) => {
  const listingData = req.body.listing;
  const amenitiesData = req.body.listing.amenities;
  const id = uuidv4();

  const listing = await Listing.create({
    id,
    ...listingData,
  });

  await listing.addAmenities(amenitiesData.map(amenity => amenity.id));

  const updatedListing = await Listing.findByPk(id, {
    include: Amenity,
  });

  const listingToReturn = transformListingWithAmenities(updatedListing);
  return res.json(listingToReturn);
});

// edit a listing
app.patch("/listings/:listingId", async (req, res) => {
  const listing = await Listing.findByPk(req.params.listingId, {
    include: Amenity,
  });

  const newListingData = req.body.listing;
  const newAmenities = req.body.listing.amenities;

  await listing.update({
    ...newListingData,
  });

  await listing.setAmenities([]); // Clear existing amenities
  await listing.addAmenities(newAmenities.map(amenity => amenity.id));

  const updatedListing = await Listing.findByPk(req.params.listingId, {
    include: Amenity,
  });

  const listingToReturn = transformListingWithAmenities(updatedListing);
  return res.json(listingToReturn);
});

app.listen(port, () => {
  console.log(`Listing API running at http://localhost:${port}`);
});
