import { Cart } from '../models/cart.js';
import CartItem from '../models/cartItem.js';

class CartRepository {
    constructor({ mysqldb }) {
        this.Cart = Cart;
        this.CartItem = CartItem;
        this.mysqldb = mysqldb;
    }

    async getCart(cartId) {
        try {
            const cart = await this.Cart.findByPk(cartId, {
                include: [
                    {
                        association: 'cartItems',
                        include: ['listing']
                    }
                ]
            });
            return cart;
        } catch (error) {
            console.error('Error fetching cart:', error);
            throw new Error('Failed to fetch cart');
        }
    }

    async getCartForListing(listingId) {
        try {
            const cart = await this.Cart.findOne({
                include: [
                    {
                        association: 'cartItems',
                        where: { listingId },
                        required: true
                    }
                ]
            });
            return cart;
        } catch (error) {
            console.error('Error fetching cart for listing:', error);
            throw new Error('Failed to fetch cart for listing');
        }
    }

    async addToCart(cartId, item) {
        try {
            // First, get or create the cart
            let cart = await this.Cart.findByPk(cartId);
            
            if (!cart) {
                cart = await this.Cart.create({
                    id: cartId,
                    guestId: item.guestId,
                    checkInDate: item.checkInDate,
                    checkOutDate: item.checkOutDate,
                    totalPrice: 0.0
                });
            }

            // Create cart item
            const cartItem = await this.CartItem.create({
                id: `${cartId}-${item.listingId}-${Date.now()}`,
                cartId: cartId,
                listingId: item.listingId,
                quantity: item.quantity || 1,
                price: item.price || 0.0,
                checkInDate: item.checkInDate,
                checkOutDate: item.checkOutDate,
                totalPrice: (item.price || 0.0) * (item.quantity || 1)
            });

            // Update cart total price
            const cartItems = await this.CartItem.findAll({ where: { cartId } });
            const totalPrice = cartItems.reduce((sum, ci) => sum + parseFloat(ci.totalPrice), 0);
            await cart.update({ totalPrice });

            return cart;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw new Error('Failed to add item to cart');
        }
    }

    async removeFromCart(cartId, itemId) {
        try {
            const cart = await this.Cart.findByPk(cartId);
            
            if (!cart) {
                throw new Error('Cart not found');
            }

            // Find and delete the cart item
            const cartItem = await this.CartItem.findByPk(itemId);
            if (!cartItem) {
                throw new Error('Cart item not found');
            }

            await cartItem.destroy();

            // Update cart total price
            const cartItems = await this.CartItem.findAll({ where: { cartId } });
            const totalPrice = cartItems.reduce((sum, ci) => sum + parseFloat(ci.totalPrice), 0);
            await cart.update({ totalPrice });

            return cart;
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw new Error('Failed to remove item from cart');
        }
    }

    async createCart(cartData) {
        try {
            const cart = await this.Cart.create(cartData);
            return cart;
        } catch (error) {
            console.error('Error creating cart:', error);
            throw new Error('Failed to create cart');
        }
    }

    async updateCart(cartId, updates) {
        try {
            const cart = await this.Cart.findByPk(cartId);
            
            if (!cart) {
                throw new Error('Cart not found');
            }

            await cart.update(updates);
            return cart;
        } catch (error) {
            console.error('Error updating cart:', error);
            throw new Error('Failed to update cart');
        }
    }

    async deleteCart(cartId) {
        try {
            const cart = await this.Cart.findByPk(cartId);
            
            if (!cart) {
                throw new Error('Cart not found');
            }

            await cart.destroy();
            return { success: true, message: 'Cart deleted successfully' };
        } catch (error) {
            console.error('Error deleting cart:', error);
            throw new Error('Failed to delete cart');
        }
    }

    async getCartsByGuest(guestId) {
        try {
            const carts = await this.Cart.findAll({
                where: { guestId },
                order: [['createdAt', 'DESC']]
            });
            return carts;
        } catch (error) {
            console.error('Error fetching carts by guest:', error);
            throw new Error('Failed to fetch carts by guest');
        }
    }
}

export default CartRepository;