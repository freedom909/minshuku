// cache/bookingCache.js
import { get, set, del } from './cacheClient';

const CACHE_TTL = 60 * 60; // 1 hour TTL for booking cache

class BookingCache {
  static async getBookingById(bookingId) {
    const cacheKey = `booking_${bookingId}`;
    return await get(cacheKey);
  }

  static async setBooking(bookingId, bookingData) {
    const cacheKey = `booking_${bookingId}`;
    await set(cacheKey, bookingData, CACHE_TTL);
  }

  static async clearBookingCache(bookingId) {
    const cacheKey = `booking_${bookingId}`;
    await del(cacheKey);
  }
}

export default BookingCache;
