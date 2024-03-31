const mongoose = require('mongoose');

// Define restaurant schema
const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false // Default value is false, assuming restaurant is initially closed
  },
  lat: {
    type: Number,
    default:11111
  },
  lon: {
    type: Number,
    default:000
  }
});

// Create restaurant model
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = { Restaurant };
