// Returns the number of days from checkIn to checkOut (checkOut is not counted as a day)
const getDifferenceInDays = (checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const diffInTime = checkOutDate.getTime() - checkInDate.getTime();

  const oneDayConversion = 1000 * 60 * 60 * 24;

  return Math.round(diffInTime / oneDayConversion);
};

const transformListingWithAmenities = (amenities) => {
  console.log("amenities",amenities)
  // Check if amenities is an array
  if (!Array.isArray(amenities)) {
    console.error('Input amenities is not an array:', amenities);
    throw new Error('amenities must be an array');
  }

  // Transform each Amenity instance
  const transformedAmenities = amenities.map((amenity) => {
    if (!amenity.dataValues) {
      return {}; // Return an empty object if dataValues is undefined
    }
    const { id, category, name } = amenity.dataValues;
    return { id, category, name };
  });

  return transformedAmenities;
};


export default { getDifferenceInDays, transformListingWithAmenities };
