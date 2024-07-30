import axios from 'axios';
import mysql from 'mysql2/promise';

class BookingRepository {
  constructor(dbConfig) {
    if (!dbConfig || typeof dbConfig !== 'object') {
      throw new Error('Invalid dbConfig object');
    }
    this.dbConfig = dbConfig;
    this.httpClient = axios.create({
      baseURL: 'http://localhost:4014', // Adjust as needed
    });
  }

  async getConnection() {
    return await mysql.createConnection(this.dbConfig);
  }

  async findOne(query) {
    const connection = await this.getConnection();
    try {
      const queryKeys = Object.keys(query);
      const queryValues = Object.values(query);
      if (queryKeys.length === 0) {
        throw new Error('Query object is empty');
      }
      const whereClause = queryKeys.map(key => `${key} = ?`).join(' AND ');
      const sql = `SELECT * FROM bookings WHERE ${whereClause}`;
      const [rows] = await connection.execute(sql, queryValues);
      return rows[0];
    } catch (error) {
      console.error('Error in findOne:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  async findAll(query) {
    const connection = await this.getConnection();
    try {
      const queryKeys = Object.keys(query);
      const queryValues = Object.values(query);
      const whereClause = queryKeys.map(key => `${key} = ?`).join(' AND ');
      const sql = `SELECT * FROM bookings${queryKeys.length ? ` WHERE ${whereClause}` : ''}`;
      const [rows] = await connection.execute(sql, queryValues);
      return rows;
    } catch (error) {
      console.error('Error in findAll:', error);
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

  async getBookingsForUser(userId, status = null) {
    try {
      const response = await this.httpClient.get(`/bookings`, {
        params: {
          userId,
          status
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings for user:', error);
      throw error;
    }
  }

  async getCurrentGuestBooking(userId) {
    try {
      const response = await this.httpClient.get(`/bookings`, {
        params: {
          userId,
          status: 'CURRENT'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current guest booking:', error);
      throw error;
    }
  }

  async getBookingsForListing(listingId, status = null) {
    try {
      const response = await this.httpClient.get(`/bookings`, {
        params: {
          listingId,
          status
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings for listing:', error);
      throw error;
    }
  }

  async createBooking(booking) {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.query('INSERT INTO bookings SET ?', booking);
      return result.insertId; // Return the inserted booking ID
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  async updateBooking(id, updateFields) {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.query('UPDATE bookings SET ? WHERE id = ?', [updateFields, id]);
      return result.affectedRows; // Return the number of affected rows
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  async addFunds(userId, amount) {
    // Implement logic to add funds to user's wallet
    // This is a placeholder for the actual implementation
    return {
      userId,
      amount,
      success: true
    };
  }

  async isListingAvailable(listing) {
    try {
      const bookings = await this.getBookingsForListing(listing.id, 'CURRENT');
      return bookings.length === 0;
    } catch (error) {
      console.error('Error checking listing availability:', error);
      throw error;
    }
  }
}

export default BookingRepository;
