import express,{ json }  from 'express';
import db from './models/index.js';
// import Listing from './models/listing.js';
import help from "./helpers.js";
import {Op} from '@sequelize/core';
const { getDifferenceInDays, transformListingWithAmenities } = help;

const app = express();
const port = 4010 || process.env.PORT;
app.use(json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const {Amenity, Listing, ListingAmenities} =db
app.get("/listings", async (req, res) => {
  const { page = 1, limit = 5, sortBy } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10); // 0 indexed for page
  const minNumOfBeds = parseInt(req.query.numOfBeds, 10) || 1; // Default to 0 if not provided or invalid

  let order = [['costPerNight', 'DESC']]; // default descending cost
  if (sortBy === "COST_ASC") {
    order = [['costPerNight', 'ASC']];
  }

  try {
    const listings = await Listing.findAll({
      where: {
        numOfBeds: {
          [Op.gte]: minNumOfBeds, // Use Op.gte to specify the greater than or equal condition
        },
      },
      order,
      limit: parseInt(limit, 10),
      offset,
    });

    return res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
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
app.get("/users/:userId/listings", async (req, res) => {
  const listings = await Listing.findAll({
    where: { hostId: req.params.userId },
  });
  return res.json(listings);
});

// get all possible listing amenities,this route should be before of "/listing/listingId"
app.get('/listings/amenities', async (req, res) => {
  try {
    const listings = await Listing.findAll({
      include: {
        model: Amenity,
        through: { attributes: [] }, // This prevents extra data from ListingAmenities being included
      }
    });

    if (!listings || listings.length === 0) {
      return res.status(400).send("Could not find any listings with amenities");
    }

    res.json(listings);
  } catch (error) {
    console.error("Error fetching listings with amenities:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
 
app.get("/listings/:listingId/totalCost", async (req, res) => {
  try {
    const { listingId } = req.params;
    const { checkInDate, checkOutDate } = req.query;

    const diffInDays = getDifferenceInDays(checkInDate, checkOutDate);

    if (isNaN(diffInDays)) {
      return res.status(400).send("Invalid date format. Please provide valid check-in and check-out dates.");
    }

    // Find the specific listing
    const listingInstance = await Listing.findOne({
      where: { id: listingId },
      attributes: ['costPerNight'],
    });

    if (!listingInstance) {
      return res.status(400).send("Could not find listing with specified ID.");
    }

    // Calculate total cost
    const totalCost = listingInstance.costPerNight * diffInDays;
    res.json({ totalCost });
  } catch (error) {
    console.error("Error fetching total cost for listing:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/users/:userId/totalCost", async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === null) {
      throw new Error("You must provide a userId in order to get total cost");
    }
    const { checkInDate, checkOutDate } = req.query;

    const diffInDays = getDifferenceInDays(checkInDate, checkOutDate);

    if (isNaN(diffInDays)) {
      return res.status(400).send("Invalid date format. Please provide valid check-in and check-out dates.");
    }

    // Find all listings for the user
    const userListings = await Listing.findAll({
      where: { hostId: userId },
      attributes: ['costPerNight'],
    });

    if (!userListings || userListings.length === 0) {
      return res.status(400).send("No listings found for the specified user.");
    }

    // Calculate total cost
    const totalCost = userListings.reduce((sum, listing) => {
      return sum + (listing.costPerNight * diffInDays);
    }, 0);

    res.json({ totalCost });
  } catch (error) {
    console.error("Error fetching total cost for user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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
debugger;
app.get("/listings/:listingId", async (req, res) => {
  try {
    // Fetch the listing instance with associated amenities
    const listingInstance = await Listing.findOne({
      include: {
        model: Amenity,
        as: 'amenities' // This matches the association alias defined earlier
      },
      where: { id: req.params.listingId },
    });

    // Debugging output to see what we got from the database
    console.log('Listing Instance:', listingInstance);

    // Check if the listing instance was found
    if (!listingInstance) {
      console.log('Listing not found');
      return res.status(400).send("Could not find listing with specified ID");
    }

    // If everything is fine, send the listing instance as a response
    res.json(listingInstance);
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/amenities', async (req, res) => {
  try {
    const amenities = await db.Amenity.findAll();
    res.json(amenities);
  } catch (error) {
    console.error("Error fetching amenities:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// edit a listing
app.patch("/listings/:listingId", async (req, res) => {
  let listing = await Listing.findOne({
    include: Amenity,
    where: { id: req.params.listingId },
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