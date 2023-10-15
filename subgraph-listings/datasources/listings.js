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
      const listingData = await this.get(`listings/${listingId}`)
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

  createListing (listing) {
    return this.post(`listings`, { body: { listing } })
      .then(newListing => {
        console.log(newListing)
        return newListing
      })
      .catch(error => {
        console.log(error)
        throw error
      })
  }

  updateListing ({ listingId, listing }) {
    return this.patch(`listings/${listingId}`, { body: { listing } })
  }
}

export default ListingsAPI

const listingsAPI = new ListingsAPI();
listingsAPI.getListing('amenities').then(listingData => {
  console.log(listingData);
}).catch(error => {
  console.error(error);
});

