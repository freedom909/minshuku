
import Cart from '../models/cart.js'; // Ensure you import your Cart model
import Booking from '../models/booking.js'; // Ensure you import your Booking model
import BookingItem from '../models/bookingItem.js'; // Ensure you import your Book
import BookingRepository from './bookingRepository.js';

class CartRepository {
  constructor(bookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  async getCartItems(userId) {
    try {
      return await Cart.findAll({ where: { userId } });
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw new Error('Error fetching cart items');
    }
  }

  async addToCart(userId, listingId, quantity) {
    try {
      return await Cart.create({ userId, listingId, quantity });
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw new Error('Error adding to cart');
    }
  }

  async updateCartItemQuantity(userId, itemId, quantity) {
    try {
      const cartItem = await Cart.findOne({ where: { id: itemId, userId } });
      if (cartItem) {
        cartItem.quantity = quantity;
        return await cartItem.save();
      }
      return null;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw new Error('Error updating cart item quantity');
    }
  }

  async removeCartItem(userId, itemId) {
    try {
      const cartItem = await Cart.findOne({ where: { id: itemId, userId } });
      if (cartItem) {
        return await cartItem.destroy();
      }
      return null;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw new Error('Error removing cart item');
    }
  }

  async checkoutCart(userId) {
    try {
      return await Cart.update({ status: 'CHECKED_OUT' }, { where: { userId } });
    } catch (error) {
      console.error('Error checking out cart:', error);
      throw new Error('Error checking out cart');
    }
  }

  async getBookingHistory(userId) {
    try {
      return await Booking.findAll({ where: { userId } });
    } catch (error) {
      console.error('Error fetching booking history:', error);
      throw new Error('Error fetching booking history');
    }
  }

  async placeBooking(userId, cartItems, paymentMethod) {
    // Implement booking logic here
    // Make sure to handle the booking transaction, update inventory, and process payment
  }

  async getBookingDetails(bookingId) {
    try {
      return await Booking.findByPk(bookingId);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw new Error('Error fetching booking details');
    }
  }

  async cancelBooking(bookingId) {
    try {
      const booking = await Booking.findByPk(bookingId);
      if (booking) {
        booking.status = 'CANCELLED';
        return await booking.save();
      }
      return null;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw new Error('Error cancelling booking');
    }
  }

  async returnBookingItem(bookingId, itemId) {
    // Implement return item logic
    // Ensure to update the booking item status, process the return, and handle refunds
  }

  async getBookingItems(bookingId) {
    try {
      return await BookingItem.findAll({ where: { bookingId } });
    } catch (error) {
      console.error('Error fetching booking items:', error);
      throw new Error('Error fetching booking items');
    }
  }

  async updateBookingItemQuantity(bookingId, itemId, quantity) {
    try {
      const bookingItem = await BookingItem.findOne({ where: { id: itemId, bookingId } });
      if (bookingItem) {
        bookingItem.quantity = quantity;
        return await bookingItem.save();
      }
      return null;
    } catch (error) {
      console.error('Error updating booking item quantity:', error);
      throw new Error('Error updating booking item quantity');
    }
  }

  async getBookingItemsWithStatus(bookingId, status) {
    try {
      return await BookingItem.findAll({ where: { bookingId, status } });
    } catch (error) {
      console.error('Error fetching booking items with status:', error);
      throw new Error('Error fetching booking items with status');
    }
  }

  async getBookingItemsWithReturnStatus(bookingId) {
    try {
      return await BookingItem.findAll({ where: { bookingId, returnStatus: true } });
    } catch (error) {
      console.error('Error fetching booking items with return status:', error);
      throw new Error('Error fetching booking items with return status');
    }
  }

  async getBookingItemsWithReturnRequestStatus(bookingId) {
    try {
      return await BookingItem.findAll({ where: { bookingId, returnRequestStatus: true } });
    } catch (error) {
      console.error('Error fetching booking items with return request status:', error);
      throw new Error('Error fetching booking items with return request status');
    }
  }

  async getBookingItemsWithRefundStatus(bookingId) {
    try {
      return await BookingItem.findAll({ where: { bookingId, refundStatus: true } });
    } catch (error) {
      console.error('Error fetching booking items with refund status:', error);
      throw new Error('Error fetching booking items with refund status');
    }
  }

  async find(query) {
    try {
      return await Cart.findAll({ where: query });
    } catch (error) {
      console.error('Error finding cart items:', error);
      throw new Error('Error finding cart items');
    }
  }

  async findOne(query) {
    try {
      return await Cart.findOne({ where: query });
    } catch (error) {
      console.error('Error finding cart item:', error);
      throw new Error('Error finding cart item');
    }
  }

  async findById(id) {
    try {
      return await Cart.findByPk(id);
    } catch (error) {
      console.error('Error finding cart item by ID:', error);
      throw new Error('Error finding cart item by ID');
    }
  }
}

export default CartRepository;
