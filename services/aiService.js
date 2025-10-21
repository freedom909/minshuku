

class AiService {
  constructor({ userService, listingService, bookingService, paymentService, aiRepository} ) {

    this.userService  = userService;
    this.listingService  = listingService;
    this.bookingService  = bookingService;
    this.paymentService  = paymentService;
    this.aiRepository = aiRepository;
    
    // 验证 aiRepository 是否可用
    if (!this.aiRepository) {
      throw new Error('❌ aiRepository is required');
    }
    
    // 测试 aiRepository 功能
    try {
      const aiService = this.aiRepository.getAiService();
      console.log('✅ aiService resolved:', aiService);
    } catch (error) {
      console.error('❌ Failed to resolve aiService from aiRepository:', error);
    }
  }

  async suggestTitleImprovements(listingId) {
    console.log('🧠 running suggestTitleImprovements');
    return `Title improvement for listing ${listingId}`;
  }

  async getAiSummary(userId ) {
    let user = null;
    try {
      if (this.userService) {
        user = await this.userService.getUserById (userId);
      }
    } catch (error) {
      console.error('Failed to get user:', error);
    }

    let  listings = [];
    try {
      if (this.listingService ) {
        listings = await this.listingService.getListingsByUserId (userId);
      }
    } catch (error) {
      console.error('Failed to get listings:', error);
    }

    return { user, listings };
  }

  async bookListing(userId, listingId) {
    try {
      if (this.bookingService && this.paymentService) {
        const booking = await this.bookingService.createBooking(userId, listingId);
        const payment = await this.paymentService.processPayment(userId, booking.amount);
        return { booking, payment };
      } else {
        console.warn('Booking or payment service is unavailable. Skipping booking.');
        return null;
      }
    } catch (error) {
      console.error('Failed to book listing:', error);
      return null;
    }
  }

  async saveMessageToDB(message, reply) { 
    if (message && reply) {
      try {
        //the message should be can destructured this way (with the curly braces)?or can't be destructured, or I should just write it as message = message ???
        //const { title, body } = message;
        const messageDoc = new Message({ 
          service: 'message',
          timestamp: Date.now(),  
          listingId: "1",   
          title: "User Message",
          body: message,  
          userId: this.userId,
          message,
          reply,
        });
        await messageDoc.save();
        console.log('AiService instantiated');
        return messageDoc;
      } catch (error) {
        console.error('Failed to save message to DB:', error);
        return null;
      }
    }
  }
}
export default AiService;