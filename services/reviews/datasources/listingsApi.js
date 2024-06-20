import { RESTDataSource } from "@apollo/datasource-rest";

class ListingsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "http://localhost:4010/";
  }

  getListingsForUser(userId) {
    return this.get(`user/${userId}/listings`);
  }

  getListing(listingId) {
    return this.get(`listings/${listingId}`);
  }

  getAllAmenities() {
    return this.get(`listing/amenities`);
  }
}

export default ListingsAPI;
