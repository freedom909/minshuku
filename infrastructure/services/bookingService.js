import { RESTDataSource } from "@apollo/datasource-rest";

class BookingService extends RESTDataSource {
    constructor(bookingRepository) {
      super();
      this.bookingRepository = bookingRepository;
      this.baseURL = 'http://localhost:4012/';
    }
}

async function getBookingsForListing(listing){
    const bookingService = await this.bookingRepository.getBookingsForListing(listing)
    return await bookingService.get(`listing/${listing.id}/bookings`);
}

async function getBookingsForListing(id){
    const bookingService = await this.bookingRepository.getBookingsForListing(id)
    return await bookingService.get(`bookings/${id}`);
}

async function getCurrentlyBookedDateRangesForListing(id){
    const bookingService = await this.bookingRepository.getCurrentlyBookedDateRangesForListing(id)
    return await bookingService.get(`listing/${id}/currentBookedDates`);
}

async function isListingAvailable(listing){
    const bookingService = await this.bookingRepository.isListingAvailable(listing)
    const bookings = await bookingService.get(`listing/${listing.id}/currentBookedDates`);
    return bookings.length === 0;
}
export default BookingService;