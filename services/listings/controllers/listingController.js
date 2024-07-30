export const getAllListings = async (req, res, listingService) => {
    try {
      const listings = await listingService.getAllListings();
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  export const getListingById = async (req, res, listingService) => {
    try {
      const { id } = req.params;
      const listing = await listingService.getListingById(id);
      if (listing) {
        res.json(listing);
      } else {
        res.status(404).json({ message: 'Listing not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  export const createListing = async (req, res, listingService) => {
    try {
      const listingData = req.body;
      const newListing = await listingService.createListing(listingData);
      res.status(201).json(newListing);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  export const updateListing = async (req, res, listingService) => {
    try {
      const { id } = req.params;
      const listingData = req.body;
      const updatedListing = await listingService.updateListing(id, listingData);
      res.json(updatedListing);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const deleteListing = async (req, res, listingService) => {
    try {
      const { id } = req.params;
      await listingService.deleteListing(id);
      res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };