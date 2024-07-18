import axios from 'axios';
import mysql from 'mysql2/promise';

class BookingRepository {
  constructor(dbConfig) {
    if (!dbConfig || typeof dbConfig !== 'object') {
      throw new Error('Invalid dbConfig object');
    }
    this.dbConfig = dbConfig;
    this.httpClient = axios.create({
      baseURL: 'http://localhost:4012', // Adjust as needed
    });
  }

  async getConnection() {
    return await mysql.createConnection(this.dbConfig);
  }

  async findOne(query) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.query('SELECT * FROM bookings WHERE ?', query);
      return rows[0];
    } catch (error) {
      console.error('Error in findOne:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  async getBooking(id) {
    try {
      const response = await this.httpClient.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  async getBookingsForGuest(guestId) {
    try {
      const response = await this.httpClient.get(`/bookings?guestId=${guestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings for guest:', error);
      throw error;
    }
  }

  async getCurrentlyBookedDateRangesForListing(id) {
    try {
      const response = await this.httpClient.get(`/bookings?listingId=${id}&status=CURRENTLY_BOOKED`);
      return response.data;
    } catch (error) {
      console.error('Error fetching currently booked date ranges for listing:', error);
      throw error;
    }
  }

  async getBookingsForUser(userId) {
    try {
      const response = await this.httpClient.get(`/bookings?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings for user:', error);
      throw error;
    }
  }

  async getBookingsForUserWithStatus(userId, status) {
    try {
      const response = await this.httpClient.get(`/bookings?userId=${userId}&status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings for user with status:', error);
      throw error;
    }
  }

  async getCurrentGuestBooking(userId) {
    try {
      const response = await this.httpClient.get(`/bookings?userId=${userId}&status=CURRENTLY_BOOKED`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current guest booking for user:', error);
      throw error;
    }
  }

  async updateBooking(id, status, confirmedAt) {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.query(
        'UPDATE bookings SET status = ?, confirmedAt = ? WHERE id = ?',
        [status, confirmedAt, id]
      );
      return result;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  async getBookingsForListing(id) {
    try {
      const response = await this.httpClient.get(`/bookings?listingId=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings for listing:', error);
      throw error;
    }
  }

  async getCurrentGuestBooking(listingId, checkInDate, checkOutDate) {
    try {
      const response = await this.httpClient.get(`/bookings?listingId=${listingId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&status=CURRENTLY_BOOKED`);
      return response.data;
    } catch (error) {
      console.error('Error fetching currently booked date ranges for listing:', error);
      throw error;
    }
  }

  async createBooking(booking) {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.query('INSERT INTO bookings SET ?', booking);
      return result;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  async updateBooking(bookingId, booking) {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.query('UPDATE bookings SET ? WHERE id = ?', [booking, bookingId]);
      return result;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  async deleteBooking(bookingId) {
    const connection = await this.getConnection();
    try {
      await connection.query('DELETE FROM bookings WHERE id = ?', [bookingId]);
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  async getBookingsForHost(hostId) {
    try {
      const response = await this.httpClient.get(`/bookings?hostId=${hostId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings for host:', error);
      throw error;
    }
  }

  async getBookingsForListingAndGuest(listingId, guestId) {
    try {
      const response = await this.httpClient.get(`/bookings?listingId=${listingId}&guestId=${guestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings for listing and guest:', error);
      throw error;
    }
  }

  async getBookingsForListingAndHost(listingId, hostId) {
    try {
      const response = await this.httpClient.get(`/bookings?listingId=${listingId}&hostId=${hostId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings for listing and host:', error);
      throw error;
    }
  }

  async getBookingsForListingAndStatus(listingId, status) {
    try {
      const response = await this.httpClient.get(`/bookings?listingId=${listingId}&status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings for listing and status:', error);
      throw error;
    }
  }

  async getBookingsForGuestAndStatus(guestId, status) {
    try {
      const response = await this.httpClient.get(`/bookings?guestId=${guestId}&status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings for guest and status:', error);
      throw error;
    }
  }

  async isListingAvailable(listing) {
    try {
      const bookings = await this.getBookingsForListingAndStatus(listing._id, 'CURRENTLY_BOOKED');
      const currentlyBookedDateRanges = bookings.map(booking => ({
        start: new Date(booking.checkInDate),
        end: new Date(booking.checkOutDate),
      }));
      const availability = availableDateRange(listing.startDate, listing.endDate, currentlyBookedDateRanges);
      return availability;
    } catch (error) {
      console.error('Error checking listing availability:', error);
      throw error;
    }
  }
}

export default BookingRepository;