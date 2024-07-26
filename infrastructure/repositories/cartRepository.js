import { RESTDataSource } from '@apollo/datasource-rest';
import Cart from '../models/Cart.js';
import Booking from '../models/Booking.js';

class CartRepository extends RESTDataSource {
  constructor() {
    super();
  }

  async getCartItems(userId) {
    return await Cart.findAll({ where: { userId } });
  }

  async addToCart(userId, listingId, quantity) {
    return await Cart.create({ userId, listingId, quantity });
  }

  async updateCartItemQuantity(userId, itemId, quantity) {
    const cartItem = await Cart.findOne({ where: { id: itemId, userId } });
    if (cartItem) {
      cartItem.quantity = quantity;
      return await cartItem.save();
    }
    return null;
  }

  async removeCartItem(userId, itemId) {
    const cartItem = await Cart.findOne({ where: { id: itemId, userId } });
    if (cartItem) {
      return await cartItem.destroy();
    }
    return null;
  }

  async checkoutCart(userId) {
    // Assuming you have some logic to checkout
    return await Cart.update({ status: 'CHECKED_OUT' }, { where: { userId } });
  }

  async getBookingHistory(userId) {
    // Assuming you have a Bookings model or relevant method
    return await Booking.findAll({ where: { userId } });
  }

  async placeBooking(userId, cartItems, paymentMethod) {
    // Implement booking logic here
  }

  async getBookingDetails(bookingId) {
    return await Booking.findByPk(bookingId);
  }

  async cancelBooking(bookingId) {
    const booking = await Booking.findByPk(bookingId);
    if (booking) {
      booking.status = 'CANCELLED';
      return await booking.save();
    }
    return null;
  }

  async returnBookingItem(bookingId, itemId) {
    // Implement return item logic
    // Implement return request logic
    // Implement refund logic
  }

  async getBookingItems(bookingId) {
    return await BookingItem.findAll({ where: { bookingId } });
  }

  async updateBookingItemQuantity(bookingId, itemId, quantity) {
    const bookingItem = await BookingItem.findOne({ where: { id: itemId, bookingId } });
    if (bookingItem) {
      bookingItem.quantity = quantity;
      return await bookingItem.save();
    }
    return null;
  }

  async getBookingItemsWithStatus(bookingId, status) {
    return await BookingItem.findAll({ where: { bookingId, status } });
  }

  async getBookingItemsWithReturnStatus(bookingId) {
    return await BookingItem.findAll({ where: { bookingId, returnStatus: true } });
  }

  async getBookingItemsWithReturnRequestStatus(bookingId) {
    return await BookingItem.findAll({ where: { bookingId, returnRequestStatus: true } });
  }

  async getBookingItemsWithRefundStatus(bookingId) {
    return await BookingItem.findAll({ where: { bookingId, refundStatus: true } });
  }

  async find(query) {
    return await Cart.findAll({ where: query });
  }

  async findOne(query) {
    return await Cart.findOne({ where: query });
  }

  async findById(id) {
    return await Cart.findByPk(id);
  }
}

export default CartRepository;
