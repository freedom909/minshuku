import amenityRepository from '../repositories/amenityRepository';
import { v4 as uuidv4 } from 'uuid'; // Assuming you use UUID for the Amenity ID

class AmenityService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async getAmenityIds(amenities) {
        try {
            const response = await this.httpClient.get('/amenities', {
                params: { names: amenities }
            });
            return response.data.map(amenity => amenity.id);
        } catch (error) {
            console.error('Error fetching amenity IDs:', error);
            throw error;
        }
    }

    async createAmenity(name) {
        try {
            const response = await this.httpClient.post('/amenities', { name });
            return response.data;
        } catch (error) {
            console.error('Error creating amenity:', error);
            throw error;
        }
    }
    async getAllAmenities() {
        try {
            const response = await this.httpClient.get('/amenities');
            return response.data;
        } catch (error) {
            console.error('Error fetching all amenities:', error);
            throw error;
        }
    }

    async linkAmenitiesToListing(listingId, amenityIds) {
        try {
            const response = await this.httpClient.post(`/listings/${listingId}/amenities`, {
                amenities: amenityIds
            });
            return response.data;
        } catch (error) {
            console.error('Error linking amenities to listing:', error);
            throw error;
        }
    }
}

export default AmenityService;
