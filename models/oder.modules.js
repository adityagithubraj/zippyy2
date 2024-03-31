const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  foodId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  name: { type: String, required: true },
  imageUrl: { type: String, required: true }

},{ _id: false });

const orderSchema = new Schema({
  customerID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
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
    default: 'NA'
  },
  deliveryLat: {
    type: Number,
    default: NaN
  },
  deliveryLong: {
    type: Number,
    default: NaN
  },
  restaurantLat: {
    type: Number,
    default: NaN
  },
  restaurantLong: {
    type: Number,
    default: NaN
  },
  restaurantPhoneNumber: {
    type: String,
    default: 'NA'
  },
  distance: {
    type: Number,
    default: NaN
  },
  price: {
    type: Number,
    default: NaN
  },
  tax: {
    type: Number,
    default: NaN
  },
  PlatformFee: {
    type: Number,
    default: NaN
  },
  deliveryInstructions: String,
  cookingInstructions: String,
  deliveryCharge: {
    type: Number,
    default: NaN
  },
  totalPayablePrice: {
    type: Number,
    default: NaN
  },
  payment: {
    type: Boolean,
    default: false
  },
  expectedDeliveryDuration: Number,
  orderTime: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });


const Order = mongoose.model('Order', orderSchema);

module.exports = {Order};
