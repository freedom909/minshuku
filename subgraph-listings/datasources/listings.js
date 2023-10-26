import { RESTDataSource } from '@apollo/datasource-rest'

class ListingsAPI extends RESTDataSource {
  constructor () {
    super()
    this.baseURL = 'http://localhost:4010/'
  }

  getListingsForUser (userId) {
    return this.get(`user/${userId}/listings`)
  }

  getListings ({ numOfBeds, page, limit, sortBy }) {
    return this.get(
      `listings?numOfBeds=${numOfBeds}&page=${page}&limit=${limit}&sortBy=${sortBy}`
    )
  }

  getFeaturedListings (limit) {
    return this.get(`featured-listings?limit=${limit}`)
  }

  async getListing (listingId) {
    try {
      const listingData = await this.get(`listing/${listingId}`)
      console.log({ listingData })
      return listingData
    } catch (error) {
      console.error(error)
      throw error
    }
  }


  getAllAmenities () {
    return this.get(`listing/amenities`)
  }

  getTotalCost ({ id, checkInDate, checkOutDate }) {
    return this.get(
      `listings/${id}/totalCost?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
    )
  }

  getListingCoordinates (id) {
    return this.get(`listings/${id}/coordinates`)
  }

  async createListing (listing) {
    try {
      const newListing = await this.post(`listings`, { body: { listing } })
      console.log(newListing)
      return newListing
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  updateListing ({ listingId, listing }) {
    return this.patch(`listings/${listingId}`, { body: { listing } })
  }
}

const listingsAPI = new ListingsAPI();
listingsAPI.getAllAmenities().then(amenitiesData => {
  console.log(amenitiesData);
}).catch(error => {
  console.error(error);
});

export default ListingsAPI



