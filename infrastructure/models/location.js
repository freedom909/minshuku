import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true, // Ensures each location has a unique id
  },
  name: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  radius: Number,
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
});

const Location = mongoose.model('Location', locationSchema);

export default Location;
