import { RESTDataSource } from '@apollo/datasource-rest';

class CartRepository extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'http://localhost:4016/';
    }
    async getCartItems(userId) {
        return await this.get(`cart/${userId}`);
    }
    async addToCart(userId, listingId, quantity) {
        return await this.post(`cart/${userId}`, { listingId, quantity });
    }
    async updateCartItemQuantity(userId, itemId, quantity) {
        return await this.put(`cart/${userId}/items/${itemId}`, { quantity });
    }
    async removeCartItem(userId, itemId) {
        return await this.delete(`cart/${userId}/items/${itemId}`);
    }
    async checkoutCart(userId) {
        return await this.post(`cart/${userId}/checkout`);
    }
    async getBookingHistory(userId) {
        return await this.get(`bookings/${userId}`);
    }
    async placeBooking(userId, cartItems, paymentMethod) {
        return await this.post(`bookings/${userId}`, { cartItems, paymentMethod });
    }
    async getBookingDetails(bookingId) {
        return await this.get(`bookings/${bookingId}`);
    }
    async cancelBooking(bookingId) {
        return await this.put(`bookings/${bookingId}/cancel`);
    }
    async returnBookingItem(bookingId, itemId) {
        return await this.put(`bookings/${bookingId}/items/${itemId}/return`);
    }
    async getBookingItems(bookingId) {
        return await this.get(`bookings/${bookingId}/items`);
    }
    async updateBookingItemQuantity(bookingId, itemId, quantity) {
        return await this.put(`bookings/${bookingId}/items/${itemId}`, { quantity });
    }
    async getBookingItemsWithStatus(bookingId, status) {
        return await this.get(`bookings/${bookingId}/items?status=${status}`);
    }
    async getBookingItemsWithReturnStatus(bookingId) {
        return await this.get(`bookings/${bookingId}/items?returnStatus=true`);
    }
    async getBookingItemsWithReturnRequestStatus(bookingId) {
        return await this.get(`bookings/${bookingId}/items?returnRequestStatus=true`);
    }
    async getBookingItemsWithRefundStatus(bookingId) {
        return await this.get(`bookings/${bookingId}/items?refundStatus=true`);
    }
    async find(query) {
        return await this.get(`search`, { query });
    }
    async find({guestId: userId, listingId, status }) {
        return await this.get(`search`, { userId, listingId, status });
    }
    async findOne({ id }) {
        return await this.get(`items/${id}`);
    }
    async find({guestId:userId}){
        return await this.get(`items?userId=${user.id}`);
    }
    async find({listingId}){
        return await this.get(`items?listingId=${listingId}`);
    }
    async findById(id) {
        return await this.get(`items/${id}`);
    }
}
export default CartRepository