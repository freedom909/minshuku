function calculateTotalCost(costPerNight, checkInDate, checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const numNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)); // Calculate the difference in days
    return costPerNight * numNights;
}
