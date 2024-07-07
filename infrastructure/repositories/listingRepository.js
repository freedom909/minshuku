import axios from 'axios';
import UserService from "../services/userService";
import { AuthenticationError, ForbiddenError } from '../utils/errors.js';

class ListingRepository {
    constructor(db) {
        console.log('db object in ListingRepository constructor:', db); // Debugging line
        if (!db || typeof db !== 'object') {
            throw new Error('Invalid db object');
        }
        this.db = db;
        console.log('db object in ListingRepository constructor:', this.db);
        this.collection = db.collection('listings');
        console.log('collection object:', this.collection); // Add this line to log the collection object
        this.httpClient = axios.create({
            baseURL: 'http://localhost:4011', // Adjust as needed
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

    async getListingCoordinates(id) {
        try {
            const response = await this.httpClient.get(`listings/${id}/coordinates`);
            return response.data;
        } catch (error) {
            console.error('Error fetching listing coordinates:', error);
            throw error;
        }
    }

    async getFeaturedListings(limit) {
        try {
            const response = await this.httpClient.get(`/featured-listings?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching featured listings:', error);
            throw error;
        }
    }

    async getTopListings(limit) {
        try {
            const response = await this.httpClient.get(`/top-listings?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching top listings:', error);
            throw error;
        }
    }

    async getListing(id) {
        try {
            const response = await this.httpClient.get(`/listings/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching listing:', error);
            throw error;
        }
    }

    async getTotalCost({ id, checkInDate, checkOutDate }) {
        try {
            const response = await this.httpClient.get(
                `listings/${id}/totalCost?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching total cost:', error);
            throw error;
        }
    }

    async getAmenities(id) {
        try {
            const response = await this.httpClient.get(`listings/${id}/amenities`);
            return response.data;
        } catch (error) {
            console.error('Error fetching amenities:', error);
            throw error;
        }
    }

    async updateListing({ id, listing }) {
        try {
            const response = await this.httpClient.put(`/listings/${id}`, listing);
            return response.data;
        } catch (error) {
            console.error('Error updating listing:', error);
            throw error;
        }
    }

    async deleteListing(id) {
        try {
            const response = await this.httpClient.delete(`/listings/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting listing:', error);
            throw error;
        }
    }

    async createListing({ userId, listing }) {
        if (!userId) {
            throw new AuthenticationError('You must be logged in to create a listing');
        }
        // Check if the user is a host or admin to create a listing.
        const userService = new UserService();
        const user = await userService.getUserById(userId);
        if (user.role !== 'Host' && user.role !== 'Admin') {
            throw new ForbiddenError('You do not have the right to create a listing');
        }
        try {
            const response = await this.httpClient.post(`/users/${userId}/listings`, listing);
            return response.data;
        } catch (error) {
            console.error('Error creating listing:', error);
            throw error;
        }
    }

    async getBookingsForListing(listingId) {
        try {
            const response = await this.httpClient.get(`/bookings?listingId=${listingId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings for listing:', error);
            throw error;
        }
    }

    async getListings() {
        try {
            const response = await this.httpClient.get(`/listings`);
            return response.data;
        } catch (error) {
            console.error('Error fetching listings:', error);
            throw error;
        }
    }

    async getListingByHostId(hostId) {
        try {
            const response = await this.httpClient.get(`/listings?hostId=${hostId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching listings by host:', error);
            throw error;
        }
    }

    async getAllAmenities() { // Renamed to follow camelCase convention
        try {
            const response = await this.httpClient.get(`/amenities`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all amenities:', error);
            throw error;
        }
    }
}

export default ListingRepository;
