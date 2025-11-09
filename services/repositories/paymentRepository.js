// services/repositories/paymentRepository.js
import { RESTDataSource } from '@apollo/datasource-rest';

class PaymentRepository extends RESTDataSource {
  constructor({ 
    bookingRepository, 
    listingRepository, 
    cartRepository, 
    userRepository 
  }) {
    super();
    this.bookingRepository = bookingRepository;
    this.listingRepository = listingRepository;
    this.cartRepository = cartRepository;
    this.userRepository = userRepository;
    this.baseURL = 'http://localhost:4004/api/v1/payments/'; // microservice or mock URL
  }

  // ───────────────────────────────
  // Basic CRUD
  // ───────────────────────────────
  async createPayment(payment) {
    return await this.post('', payment);
  }

  async getPayment(paymentId) {
    return await this.get(`${paymentId}`);
  }

  async updatePayment(paymentId, payment) {
    return await this.put(`${paymentId}`, payment);
  }

  async deletePayment(paymentId) {
    return await this.delete(`${paymentId}`);
  }

  // ───────────────────────────────
  // Composite queries
  // ───────────────────────────────
  async getPaymentForBooking(bookingId) {
    const booking = await this.bookingRepository.getBooking(bookingId);
    if (!booking) throw new Error(`Booking not found: ${bookingId}`);

    const listing = await this.listingRepository.getListing(booking.listingId);
    if (!listing) throw new Error(`Listing not found: ${booking.listingId}`);

    const cart = await this.cartRepository.getCartForListing(listing.id);
    if (!cart) throw new Error(`Cart not found for listing: ${listing.id}`);

    const payment = await this.getPayment(cart.paymentId);
    if (!payment) throw new Error(`Payment not found for cart: ${cart.id}`);

    return payment;
  }

  async getPaymentForListing(listingId) {
    const listing = await this.listingRepository.getListing(listingId);
    if (!listing) throw new Error(`Listing not found: ${listingId}`);

    const cart = await this.cartRepository.getCartForListing(listing.id);
    if (!cart) throw new Error(`Cart not found for listing: ${listing.id}`);

    const payment = await this.getPayment(cart.paymentId);
    if (!payment) throw new Error(`Payment not found for cart: ${cart.id}`);

    return payment;
  }

  async getPaymentsForUser(userId) {
    const bookings = await this.bookingRepository.getBookingsForUser(userId);
    const payments = [];
    for (const booking of bookings) {
      const payment = await this.getPaymentForBooking(booking.id);
      if (payment) payments.push(payment);
    }
    return payments;
  }

  async getPaymentForListingAndUser(listingId, userId) {
    const payment = await this.getPaymentForListing(listingId);
    if (payment.userId !== userId) {
      throw new Error('Payment does not belong to the user');
    }
    return payment;
  }

  // ───────────────────────────────
  // Wallet operations
  // ───────────────────────────────
  async addFundsToUserWallet(userId, amount) {
    const user = await this.userRepository.findOne({ _id: userId });
    if (!user) throw new Error('User not found');

    const newBalance = (user.funds || 0) + amount;
    await this.userRepository.updateUser(userId, { funds: newBalance });

    return newBalance;
  }

  async subtractFundsFromUserWallet(userId, amount) {
    const user = await this.userRepository.findOne({ _id: userId });
    if (!user) throw new Error('User not found');

    if ((user.funds || 0) < amount) throw new Error('Insufficient funds');

    const newBalance = user.funds - amount;
    await this.userRepository.updateUser(userId, { funds: newBalance });

    return newBalance;
  }

  async processPayment(userId, amount) {
    console.log(`[MockPayment] Processing payment for user ${userId} of amount ${amount}`);
    return { status: 'MOCK_SUCCESS', transactionId: `mock-tx-${Date.now()}` };
  }
}

export default PaymentRepository;
