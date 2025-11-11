import { RESTDataSource } from '@apollo/datasource-rest';

class CartRepository extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'http://localhost:4060/api/v1/carts/';
    }

    async getCart(cartId) {
        return await this.get(`/${cartId}`);
    }

      async getCartForListing(listingId) {
    return { id: 'mock-cart-1', paymentId: 'mock-payment-1', listingId };
  }
  
    async addToCart(cartId, item) {
        return await this.post(`/${cartId}/items`, item);
    }

    async removeFromCart(cartId, itemId) {
        return await this.delete(`/${cartId}/items/${itemId}`);
    }
}
export default CartRepository;