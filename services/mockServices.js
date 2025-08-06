class MockUserService {
  async getUserById(userId) {
    return { id: userId, name: 'Mock User' };
  }
}

class MockListingService {
  async getListingsByUserId(userId) {
    return [{ id: '1', title: 'Mock Listing' }];
  }
}

class MockBookingService {
  async createBooking(userId, listingId) {
    return { id: '1', userId, listingId, amount: 100 };
  }
}

class MockPaymentService {
  async processPayment(userId, amount) {
    return { id: '1', userId, amount, status: 'completed' };
  }
}

export { MockUserService, MockListingService, MockBookingService, MockPaymentService };