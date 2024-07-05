class BookingRepository {
    constructor(db) {
      console.log('db object in BookingRepository constructor:', db); // Debugging line
      if (!db || typeof db!== 'object') {
        throw new Error('Invalid db object');
      }
      this.db = db;
      console.log('db object in BookingRepository constructor:', this.db);
      this.collection = db.collection('bookings');
      console.log('collection object:', this.collection); // Add this line to log the collection object
      this.httpClient = axios.create({
        baseURL: 'http://localhost:4012', // Adjust as needed
      });
    }

    async findOne(query) {
        try {
        console.log('query:', query);
        return await this.collection.findOne(query);
        } catch (error) {
        console.error('Error in findOne:', error);
        throw error;
        }
    }

    async getBookingsForListing(listing){
        try {
            const response = await this.httpClient.get(`/bookings?listingId=${listing._id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings for listing:', error);
            throw error;
        }
    }

    async getBookingsForListing(id){
        try {
            const response = await this.httpClient.get(`/bookings?listingId=${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings for listing:', error);
            throw error;
        }
    }

    async getCurrentlyBookedDateRangesForListing(id){
        try {
            const response = await this.httpClient.get(`/bookings?listingId=${id}&status=CURRENTLY_BOOKED`);
            return response.data;
        } catch (error) {
            console.error('Error fetching currently booked date ranges for listing:', error);
            throw error;
        }
    }

    async getCurrentGuestBooking(listingId, checkInDate, checkOutDate){
        try {
            const response = await this.httpClient.get(`/bookings?listingId=${listingId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&status=CURRENTLY_BOOKED`);
            return response.data;
        } catch (error) {
            console.error('Error fetching currently booked date ranges for listing:', error);
            throw error;
        }
    }
    async createBooking(booking) {
        try {
            const response = await this.httpClient.post('/bookings', booking);
            return response.data;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }
    async updateBooking(bookingId, booking) {
        try {
            const response = await this.httpClient.put(`/bookings/${bookingId}`, booking);
            return response.data;
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    }
    async deleteBooking(bookingId) {
        try {
            await this.httpClient.delete(`/bookings/${bookingId}`);
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
    }
    async getBookingsForHost(hostId){
        try {
            const response = await this.httpClient.get(`/bookings?hostId=${hostId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings for host:', error);
            throw error;
        }
    }
    async getBookingsForGuest(GuestId){
        try {
            const response = await this.httpClient.get(`/bookings?guestId=${guestId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings for guest:', error);
            throw error;
        }
    }
    async getBookingsForListingAndGuest(listingId, guestId){
        try {
            const response = await this.httpClient.get(`/bookings?listingId=${listingId}&guestId=${guestId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings for listing and guest:', error);
            throw error;
        }
    }
    async getBookingsForListingAndHost(listingId, hostId){
        try {
            const response = await this.httpClient.get(`/bookings?listingId=${listingId}&hostId=${hostId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings for listing and host:', error);
            throw error;
        }
    }
    async getBookingsForListingAndStatus(listingId, status){
        try {
            const response = await this.httpClient.get(`/bookings?listingId=${listingId}&status=${status}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings for listing and status:', error);
            throw error;
        }
    }
    async getBookingsForGuestAndStatus(guestId, status){
        try {
            const response = await this.httpClient.get(`/bookings?guestId=${guestId}&status=${status}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings for guest and status:', error);
            throw error;
        }
    }
    async isListingAvailable(listing){
        try {
            const bookings = await this.getBookingsForListingAndStatus(listing._id, 'CURRENTLY_BOOKED');
            const currentlyBookedDateRanges = bookings.map(booking => ({
                start: new Date(booking.checkInDate),
                end: new Date(booking.checkOutDate)
            }));
            const availability = availableDateRange(listing.startDate, listing.endDate, currentlyBookedDateRanges);
            return availability;
        } catch (error) {
            console.error('Error checking listing availability:', error);
            throw error;
        }
    }

}