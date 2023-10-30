// Returns the number of days from checkIn to checkOut (checkOut is not counted as a day)
const getDifferenceInDays = (checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const diffInTime = checkOutDate.getTime() - checkInDate.getTime();

  const oneDayConversion = 1000 * 60 * 60 * 24;

  return Math.round(diffInTime / oneDayConversion);
};

// const transformListingWithAmenities = (listingInstance) => {
//   // Check if listingInstance is an instance of a class or a valid object
//   if (typeof listingInstance !== 'object' || listingInstance === null) {
//     throw new Error('listingInstance must be a valid object');
//   }
  
//   // Convert listingInstance to JSON if it has a toJSON method
//   const listing = typeof listingInstance.toJSON === 'function'
//     ? listingInstance.toJSON()
//     : listingInstance;
  
//   // Extract Amenities property and return other listing properties
//   const { Amenities, ...listingPropertiesToReturn } = listing;
  
//   // Extract ListingAmenities property from each amenity and return other amenity properties
//   if (Amenities) {
//     const amenities = Amenities.map((a) => {
//       const { ListingAmenities, ...amenitiesToReturn } = a;
//       return amenitiesToReturn;
//     });
//     // Return the transformed listing and amenities
//   return { ...listingPropertiesToReturn, amenities }; 
//   }                                       
// };
const transformListingWithAmenities = (amenities) => {
  // Check if amenities is an array
  if (!Array.isArray(amenities)) {
    throw new Error('amenities must be an array');
  }
  
  // Transform each amenity
  const transformedAmenities = amenities.map((a) => {
    const { id, category, name } = a;
    return { id, category, name };
  });

  return transformedAmenities;
};


export default { getDifferenceInDays, transformListingWithAmenities };
