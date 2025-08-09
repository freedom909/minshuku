import Booking from './services/models/booking.js';
import cacheClient from './cache/cacheClient.js';

export default class BookingService {
  constructor() {
    this.cache = cacheClient;
  }

  async createBooking(bookingData) {
    try {
      // 创建新预订
      const booking = await Booking.create(bookingData);
      
      // 缓存预订数据
      await this.cache.set(`booking:${booking.id}`, JSON.stringify(booking));
      
      return booking;
    } catch (error) {
      console.error('Error in bookingService.createBooking:', error);
      throw error;
    }
  }
}