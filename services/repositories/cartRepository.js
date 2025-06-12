import { RESTDataSource } from '@apollo/datasource-rest';

class CartRepository extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'http://localhost:4004/api/v1/carts/';
    }

    async getCart(cartId) {
        return await this.get(`/${cartId}`);
    }

    async addToCart(cartId, item) {
        return await this.post(`/${cartId}/items`, item);
    }

    async removeFromCart(cartId, itemId) {
        return await this.delete(`/${cartId}/items/${itemId}`);
    }
}
export default CartRepository;