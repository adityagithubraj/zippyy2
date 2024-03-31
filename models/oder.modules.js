const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  id: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  name: { type: String, required: true },
  imageUrl: { type: String, required: true }

},{ _id: false });

const orderSchema = new Schema({
  customerID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    
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
    
    default: 'NA'
  },
  deliveryLong: {
    type: Number,
    
    default: 'NA'
  },
  restaurantLat: {
    type: Number,
    default: 'NA'
  },
  restaurantLong: {
    type: Number,
        default: 'NA'
,
    default: 'NA'
  },
  restaurantPhoneNumber: {
    type: String,
        default: 'NA'

  },
  distance: {
    type: Number,
        default: 'NA'

  },
  price: {
    type: Number,
        default: 'NA'

  },
  tax: {
    type: Number,
        default: 'NA'

  },
  PlatformFee: {
    type: Number,
        default: 'NA'

  },
  deliveryInstructions: {
    type: String
  },
  cookingInstructions: {
    type: String
  },
  deliveryCharge: {
    type: Number,
        default: 'NA'

  },
  totalPayablePrice: {
    type: Number,
        default: 'NA'

  },
  
  payment: {
    type: Boolean,
        default: 'NA'

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
