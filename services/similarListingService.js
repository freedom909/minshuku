class SimilarListingService {
  constructor({ listingService }) {
    this.listingService = listingService;
  }

  async recommendSimilarListings(currentListing) {
    // Fetch all listings
    const allListings = await this.listingService.getAllListings();

    // Simple recommendation logic: recommend listings with the same number of beds
    return allListings.filter(listing => {
      return listing.numOfBeds === currentListing.numOfBeds;
    });
  }
}

module.exports = SimilarListingService;