import mongoose from 'mongoose';

const { Schema } = mongoose;

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  locationId: { type: Number, required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  userId: { type: String, required: true }
});

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
