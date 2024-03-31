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
    type:String,
    default: "NA"
  },
  deliveryLong: {
    type: String,
    default: "NA"
  },
  restaurantLat: {
    type: String,
    default: "NA"
  },
  restaurantLong: {
    type: String,
    default: "NA"
  },
  restaurantPhoneNumber: {
    type: String,
    default: 'NA'
  },
  distance: {
    type:Number,
    default: 00
  },
  price: {
    type: Number,
    default: 00
  },
  tax: {
    type: Number,
    default:00
  },
  PlatformFee: {
    type: Number,
    default: 00
  },
  deliveryInstructions: String,
  cookingInstructions: String,
  deliveryCharge: {
    type: Number,
    default: 00
  },
  totalPayablePrice: {
    type: Number,
    default: 00
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
//