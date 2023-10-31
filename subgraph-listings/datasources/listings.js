import { RESTDataSource } from '@apollo/datasource-rest'

import axios from 'axios'

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

  // async getListing({listingId}) {
  //   try {
  //     const listingData = await this.get(`listing/${listingId}`, {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });
  
  //     // console.log(listingData);
  //     return listingData;
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }
  
// async getAllListingTypes () {
//     const types = await this.get(`listing-types`)
//     return types
//     // Import the axios library

//     }

    async getListings ({ numOfBeds, page, limit, sortBy }) {
      return await this.get(
        `listings?numOfBeds=${numOfBeds}&page=${page}&limit=${limit}&sortBy=${sortBy}`
      )
    }

// Placeholder for the get function
// async  get(url, options) {
//   try {
//     const response = await axios.get(url, options);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// } 

async getAllAmenities () {
    const amenities=await this.get(`listing/amenities`)
    return amenities
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
      // console.log(newListing)
      return newListing
    } catch (error) {
      // console.log(error)
      throw error
    }
  }

  updateListing ({ listingId, listing }) {
    return this.patch(`listings/${listingId}`, { body: { listing } })
  }
}



export default ListingsAPI




