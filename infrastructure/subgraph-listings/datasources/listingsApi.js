import { RESTDataSource } from '@apollo/datasource-rest'

class ListingsAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = 'http://localhost:4010/'
  }

  getListingsForUser(userId) {
    return this.get(`user/${userId}/listings`)
  }


  async getListings({ numOfBeds, page, limit, sortBy }) {
    return await this.get(
      `listings?numOfBeds=${numOfBeds}&page=${page}&limit=${limit}&sortBy=${sortBy}`
    )
  }
  getFeaturedListings(limit) {
    return this.get(`featured-listings?limit=${limit}`)
  }

  async getListing({ listingId }) {

    const listingData = await this.get(`listing/${listingId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (listingData) {
      console.log(listingData);
      return listingData;
    }
    throw error;

  }

  async getAllAmenities() {
    const amenities = await this.get(`listing/amenities`)
    return amenities
  }

  getTotalCost({ id, checkInDate, checkOutDate }) {
    return this.get(
      `listings/${id}/totalCost?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
    )
  }

  getListingCoordinates(id) {
    return this.get(`listings/${id}/coordinates`)
  }

  async createListing(listing) {
    try {
      const newListing = await this.post(`listings`, { body: { listing } })
      // console.log(newListing)
      return newListing
    } catch (error) {
      // console.log(error)
      throw error
    }
  }

  updateListing({ listingId, listing }) {
    return this.patch(`listings/${listingId}`, { body: { listing } })
  }
}
export default ListingsAPI