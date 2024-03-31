const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  foodId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new Schema({
  customerID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true
  },
  orderTime: {
    type: Date,
    default: Date.now
  },
  deliveryTime: {
    type: Date
  },
  deliveryBoyId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default:"NA"
  },
  deliveryBoyName: {
    type: String,
    default:"NA"
  },
  deliveryBoyPhone: {
    type: String,
    default:"NA"
  },
  restaurantPhone: {
    type: String,
    default:"6295750824"
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  deliveryLat: {
    type: Number
  },
  deliveryLon: {
    type: Number
  },
  deliveryBoyLat: {
    type: Number
  },
  deliveryBoyLon: {
    type: Number
  },
  deliveryInstructions: {
    type: String
  },
  cookingInstructions: {
    type: String
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'on the way', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment: {
    type: Boolean,
    required: true
  },
  deliveryCharge: {
    type: Number
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = {Order};
