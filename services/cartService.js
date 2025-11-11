class CartService {
    constructor({ cartRepository }) {
        this.cartRepository = cartRepository;
    }

    async getCart(cartId) {
        return this.cartRepository.getCart(cartId);
    }

    async addToCart(cartId, item) {
        return this.cartRepository.addToCart(cartId, item);
    }

    async removeFromCart(cartId, itemId) {
        return this.cartRepository.removeFromCart(cartId, itemId);
    }
}

export default CartService;
