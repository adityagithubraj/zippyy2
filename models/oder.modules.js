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
 // _id: { type: String, required: true }, 
  customerID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
 
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
  deliveryBoyLat: {
    type:String,
    default: "0"
  },
  deliveryBoyLong: {
    type: String,
    default: "0"
  },

  deliveryAddress: {
    type: String,
    default: 'NA'
  },
  deliveryTime: {
    type: Date,
    default: Date.now
  },
  deliveryLat: {
    type:String,
    default: "0"
  },
  deliveryLong: {
    type: String,
    default: "0"
  },

  customerContact: {
    type: String
  
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
  expectedDeliveryDuration:{ 
    type: Number,
  default: 00

  },

  orderTime: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Define virtual property for deliveryTime
orderSchema.virtual('deliveryTimeCalculated').get(function() {
  const orderTime = this.orderTime.getTime(); // Get order time in milliseconds
  const deliveryDurationMs = this.expectedDeliveryDuration * 60000; // Convert minutes to milliseconds
  const deliveryTimeMs = orderTime + deliveryDurationMs; // Calculate delivery time in milliseconds
  return new Date(deliveryTimeMs); // Convert delivery time back to Date object
});


const Order = mongoose.model('Order', orderSchema);

module.exports = {Order};
