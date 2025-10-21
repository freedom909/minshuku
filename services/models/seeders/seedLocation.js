import sequelize from '../config/seq.js';
import Location from '../mysql/location.js';

const seedLocations = async () => {
  await sequelize.authenticate();
  await Location.sync({ alter: true });

  const locations = [
    { id: 'loc-1', name: 'Main Building', address: '123 Main St', city: 'City', state: 'State', zip: '12345', country: 'Country', latitude: 123.456, longitude: 78.901, radius: 10, units: 'km' },
    { id: 'loc-2', name: 'Annex', address: '456 Side Rd', city: 'City', state: 'State', zip: '12345', country: 'Country', latitude: 123.456, longitude: 78.901, radius: 10, units: 'km' },
    { id: 'loc-3', name: 'Parking Lot', address: '789 Back Alley', city: 'City', state: 'State', zip: '12345', country: 'Country', latitude: 123.456, longitude: 78.901, radius: 10, units: 'km' },
    { id: 'loc-4', name: 'Gym', address: '101 Fitness St', city: 'City', state: 'State', zip: '12345', country: 'Country', latitude: 123.456, longitude: 78.901, radius: 10, units: 'km' },
    { id: 'loc-5', name: 'Restaurant', address: '102 Dining St', city: 'City', state: 'State', zip: '12345', country: 'Country', latitude: 123.456, longitude: 78.901, radius: 10, units: 'km' },
    { id: 'loc-6', name: 'Bar', address: '103 Drinking St', city: 'City', state: 'State', zip: '12345', country: 'Country', latitude: 123.456, longitude: 78.901, radius: 10, units: 'km' },
    { id: 'loc-7', name: 'Shop', address: '104 Shopping St', city: 'City', state: 'State', zip: '12345', country: 'Country', latitude: 123.456, longitude: 78.901, radius: 10, units: 'km' },
  ];

  await Location.bulkCreate(locations, { ignoreDuplicates: true });
  console.log('✅ Locations seeded');
  await sequelize.close();
};

seedLocations();