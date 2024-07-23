class PaymentService {
  constructor(paymentRepository) {
    this.paymentRepository = paymentRepository;
  }

  async getPaymentInfo(userId) {
    if (!userId) {
      throw new Error('User ID is required to fetch payment information');
    }
    // Fetch payment information from the payment repository
    const paymentInfo = await this.paymentRepository.getPaymentInfo(userId);
    return paymentInfo || 100; // Example return value if no specific info is found
  }

  async addFunds({ userId, amount }) {
    if (!userId) {
      throw new Error('User ID is required to add funds');
    }
    // Add funds to the user's wallet
    const updatedAmount = await this.paymentRepository.addFunds(userId, amount);
    return {
      amount: updatedAmount,
    };
  }

  async subtractFunds({ userId, amount }) {
    if (!userId) {
      throw new Error('User ID is required to subtract funds');
    }
    // Subtract funds from the user's wallet
    const updatedAmount = await this.paymentRepository.subtractFunds(userId, amount);
    return {
      amount: updatedAmount,
    };
  }
}

export default PaymentService;
