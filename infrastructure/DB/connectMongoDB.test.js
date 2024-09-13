import mongoose from 'mongoose';
import Location from '../models/location.js';  // Adjust path if needed

mongoose.connect('mongodb://localhost:27017/air', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

(async () => {
    try {
        const locationId = 'location-8';
        const location = await Location.findOne({ id: locationId }).exec();
        console.log('Fetched location:', location);
    } catch (error) {
        console.error('Error fetching location:', error);
    } finally {
        mongoose.connection.close();
    }
})();
