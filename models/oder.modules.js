const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  foodId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  name: { type: String, required: true },
  imageUrl: { type: String, required: true }

}, { _id: false });

const orderSchema = new Schema({
  customerID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'on the way', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryBoyId: {
    type: String,
    default: 'NA'
  },
  deliveryBoyName: {
    type: String,
    default: 'NA'
  },
  deliveryBoyPhone: {
    type: String,
    default: 'NA'
  },
  
  deliveryAddress: {
    type: String,
    required: true
  },
  deliveryLat: {
    type: Number,
    required: true
  },
  deliveryLong: {
    type: Number,
    required: true
  },
  restaurantLat: {
    type: Number,
    required: true
  },
  restaurantLong: {
    type: Number,
    required: true
  },
  restaurantPhoneNumber: {
    type: String,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  PlatformFee: {
    type: Number,
    required: true
  },
  deliveryInstructions: {
    type: String
  },
  cookingInstructions: {
    type: String
  },
  deliveryCharge: {
    type: Number,
    required: true
  },
  totalPayablePrice: {
    type: Number,
    required: true
  },
  
  payment: {
    type: Boolean,
    required: true
  },
  expectedDeliveryDuration: {
    type: Number
  },
  orderTime: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = {Order};
