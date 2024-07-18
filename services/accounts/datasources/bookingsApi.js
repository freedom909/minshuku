
import { RESTDataSource } from "@apollo/datasource-rest";
class BookingsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.BOOKINGS_API_URL; // Set the base URL for your bookings API
  }

  async getBookingById(id) {
    return this.get(`bookings/${id}`);
  }

  async getBookingsByUserId(userId) {
    return this.get(`users/${userId}/bookings`);
  }

  // Add more methods as needed for your API
}

export default BookingsAPI;
