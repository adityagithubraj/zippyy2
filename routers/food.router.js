const express = require('express');
const foodRouter = express.Router();
const Food = require('../models/food.models')
const { authenticate } = require("../middleware/auth")
const { authorize } = require("../middleware/authorize")
const { User } = require("../models/user.model")
const {Cart} = require("../models/cart.model")
const { Order } = require('../models/oder.modules')

const {Restaurant} = require('../models/resturent.model');
const mongoose = require('mongoose');




// POST route to create a new restaurant
foodRouter.post('/createrestaurant', authenticate, async (req, res) => {
 

  const { name, address, phoneNumber, isOpen ,lat , lon} = req.body;

  try {
    const newRestaurant = new Restaurant({
      name,
      address,
      phoneNumber,
      isOpen, // Adding isOpen field,
      lat,
      lon
    });

    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


//.............route for handel isopen o r not ...........//
foodRouter.patch('/restaurantstatus', async (req, res) => {
  const restaurantId = '660958a4caba6a34ab447138'; // Hardcoded restaurant ID, replace with actual ID if needed

  try {
      // Find the restaurant by ID
      const restaurant = await Restaurant.findById(restaurantId);

      // Check if the restaurant exists
      if (!restaurant) {
          return res.json({ error: "Restaurant not found." });
      }

      // Toggle the status of the restaurant
      restaurant.isOpen = !restaurant.isOpen;

      // Save the changes to the database
      await restaurant.save();

      res.json({ message: "Restaurant status toggled successfully.", isOpen: restaurant.isOpen });
  } catch (error) {
      res.json({ error: "Internal server error." });
  }
});

//..................get api for reaturent ..........//
foodRouter.get('/restaurants', async (req, res) => {
  try {
      // Retrieve all restaurant data from the database
      const restaurants = await Restaurant.find();

      res.json(restaurants);
  } catch (error) {
      res.json({ error: "Internal server error." });
  }
});

// ........Route to edit restaurant data...............//

foodRouter.patch('/editrestaurant', async (req, res) => {
  const restaurantId = '660958a4caba6a34ab447138'; // Hardcoded restaurant ID, replace with actual ID if needed

  try {
      // Find the restaurant by ID
      const restaurant = await Restaurant.findById(restaurantId);

      // Check if the restaurant exists
      if (!restaurant) {
          return res.json({ error: "Restaurant not found." });
      }

      // Update restaurant data with the new values from the request body
      const { name, address, phoneNumber ,lat , lon} = req.body;
      restaurant.name = name;
      restaurant.address = address;
      restaurant.phoneNumber = phoneNumber;
      restaurant.lat = lat;
      restaurant.lon = lon;
   

      // Save the changes to the database
      await restaurant.save();

      res.json({ message: "Restaurant data updated successfully.", restaurant });
  } catch (error) {
      res.json({ error: "Internal server error." });
  }
});


// POST route to create a new food item

foodRouter.post('/createfood', authenticate, authorize("admin"),async (req, res) => {
  if (req.user.role !== 'admin') {
      return res.json({ error: "Unauthorized: Only restaurants Owner can add food items." });
  }

  const { name, description, price, category, imageUrl, foodType ,available} = req.body;

  try {
      const newFood = new Food({
          name,
          description,
          price,
          foodType,
          category,
          imageUrl,
          available,
          restaurantID: req.user._id // Automatically use the authenticated user's ID
      });

      await newFood.save();
      res.json(newFood);
  } catch (error) {
      res.json({ error: error.message });
  }
});


//..............UPDATE FOOD BY ID.................//
foodRouter.put('/updatefood:id', authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, imageUrl },
      { new: true } // Return the updated object
    );
    if (food) {
      res.json(food);
    } else {
      res.json({msg: 'Food not found' });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});


//.......................edit food  avlabal or not .............//
foodRouter.patch('/foodavailability/:foodId', async (req, res) => {
  const { foodId } = req.params;
  const { available } = req.body;

  try {
      // Find the food item by ID
      const food = await Food.findById(foodId);

      // Check if the food item exists
      if (!food) {
          return res.json({ msg: "Food item not found." });
      }

      // Update the availability of the food item
      food.available = available;
      await food.save();

      res.json({ message: "Food availability updated successfully." });
  } catch (error) {
      res.json({ error: "Internal server error." });
  }
});


//...............DELETE FOOD BY ID................//

foodRouter.delete('/deletefood:id', authenticate, authorize("admin"), async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (food) {
      res.send(); // No content to send back
    } else {
      res.json({ message: 'Food not found' });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});


//..................FIND SINGLE FOOD BY ID.......................//
foodRouter.get('/findfood:id', authenticate, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (food) {
      res.json(food);
    } else {
      res.json({ message: 'Food not found' });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});


//..................GET ALL FOOD .............................//
foodRouter.get('/allfood', async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (error) {
    res.json({ error: error.message });
  }
});

//.............search food...........//

foodRouter.get('/searchfoodbysuggestions', async (req, res) => {
  const { name } = req.query;

  try {
      let foods;

      // Check if name query parameter is provided
      if (name) {
          // Perform case-insensitive search by name
          foods = await Food.find({ name: { $regex: new RegExp(name, 'i') } });
      } else {
          // If name parameter is not provided, return all foods
          foods = await Food.find();
      }

      res.json(foods);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});



//............Add to cart food...................//

// foodRouter.post('/add-to-cart', authenticate, async (req, res) => {
//   const { foodId, quantity } = req.body;
//   const userId = req.user._id; // Set by `authenticate` middleware

//   try {
//       // Find the user by ID and update the cart
//       const user = await User.findById(userId);
//       if (!user) {
//           return res.json({ error: "User not found." });
//       }

//       // Find if the food is already in the cart
//       const existingCartItemIndex = user.cart.findIndex(item => item.foodId.toString() === foodId);
//       if (existingCartItemIndex > -1) {
//           // If found, update the quantity
//           user.cart[existingCartItemIndex].quantity += quantity;
//       } else {
//           // If not found, add a new item to the cart
//           user.cart.push({ foodId, quantity });
//       }

//       // Save the updated user with the cart
//       await user.save();

//       res.json(user.cart);
//   } catch (error) {
//       res.status(500).json({ error: error.message });
//   }
// });


//.........modify add to card route .................//
// foodRouter.post('/add-to-cart', authenticate, async (req, res) => {
//   const itemsToAdd = req.body; // Array of objects containing { foodId, quantity }
//   const userId = req.user._id; // Set by `authenticate` middleware

//   try {
//     // Find the user by ID
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.json({ error: "User not found." });
//     }

//     // Loop through each item to add to the cart
//     itemsToAdd.forEach(item => {
//       const { foodId, quantity } = item;

//       // Ensure foodId is defined and not empty
//       if (!foodId || typeof foodId !== 'string') {
//         return res.status(400).json({ error: "Invalid foodId provided." });
//       }

//       // Find if the food is already in the cart
//       const existingCartItemIndex = user.cart.findIndex(cartItem => cartItem.foodId && cartItem.foodId.toString() === foodId);
//       if (existingCartItemIndex > -1) {
//         // If found, update the quantity
//         user.cart[existingCartItemIndex].quantity = quantity;
//       } else {
//         // If not found, add a new item to the cart
//         user.cart.push({ foodId, quantity });
//       }
//     });

//     // Save the updated user with the cart
//     await user.save();

//     res.json(user.cart);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });



//................llll........//
foodRouter.post('/add-to-cart', authenticate, async (req, res) => {
  const itemsToAdd = req.body; // Array of objects containing { foodId, quantity }
  const userId = req.user._id; // Set by `authenticate` middleware

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ error: "User not found." });
    }

    // If any existing cart data, delete the entire cart
    if (user.cart.length > 0) {
      user.cart = [];
    }

    // Add new items to the cart
    itemsToAdd.forEach(item => {
      const { foodId, quantity } = item;
      // Ensure foodId is defined and not empty
      if (!foodId || typeof foodId !== 'string') {
        return res.status(400).json({ error: "Invalid foodId provided." });
      }
      user.cart.push({ foodId, quantity });
    });

    // Save the updated user with the new cart data
    await user.save();

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




//..........cart data deleted  route .............//
foodRouter.delete('/delete-cart', authenticate, async (req, res) => {
  const userId = req.user._id; // Set by `authenticate` middleware

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ error: "User not found." });
    }

    // Clear the user's cart
    user.cart = [];

    // Save the updated user with the empty cart
    await user.save();

    res.json({ message: "Cart data deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//.............get cart data ............//
foodRouter.post('/fetch-cart-food', authenticate, async (req, res) => {
  try {
    // Extract cart data from the request body
    const itemsToAdd = req.body;

    // Extract foodIds from cart data
    const foodIds = itemsToAdd.map(item => item.foodId);

    // Query the database for the food items based on the foodIds
    const cartFoodData = await Food.find({ _id: { $in: foodIds } });
    const restaurants = await Restaurant.find();

    // Map the cart data with fetched food data
    const formattedCartData = cartFoodData.map(foodItem => ({
      _id: foodItem._id,
      name: foodItem.name,
      description: foodItem.description,
      price: foodItem.price,
      foodType: foodItem.foodType,
      category: foodItem.category,
      imageUrl: foodItem.imageUrl,
    }));

    res.json({ cartFoodData: formattedCartData, restaurants:restaurants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



//............Utility function to calculate total price....................//
const calculateTotalPrice = (items) => {
  return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
};




//............new..............//
foodRouter.post('/create-order', authenticate, async (req, res) => {
  try {
    const {
      Cartitems,
      deliveryBoyId,
      deliveryBoyName,
      deliveryBoyPhone,
      deliveryAddress,
      deliveryLat,
      deliveryLong,
      deliveryInstructions,
      cookingInstructions,
      deliveryCharge,
      totalPayablePrice,
      status,
      payment,
      distance,
      expectedDeliveryDuration,
      restaurantPhoneNumber,
      restaurantLat,
      restaurantLong,
      price,
      tax,
      PlatformFee
    } = req.body;

    // Find the user by ID
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const customerContact = user.number;

    // Check if the cart is empty
    if (!Cartitems || Cartitems.length === 0) {
      return res.status(400).json({ error: "Cart items are required." });
    }


    // Custom ID generation logic
    let orderId;
    const allOrders = await Order.find();
    if (allOrders.length > 0) {
      const lastAddedOrder = allOrders[allOrders.length - 1];
      const lastAddedOrderId = lastAddedOrder._id;

      // Increment the last order's orderId and pad with leading zeros
      const lastOrderIdNumber = parseInt(lastAddedOrderId.substring(1), 10);
      const newOrderIdNumber = lastOrderIdNumber + 1;
      orderId = 'O' + String(newOrderIdNumber).padStart(lastAddedOrderId.length - 1, '0');
    } else {
      // If no orders found, set the orderId to the starting value
      orderId = "0000000001";
    }

//end of custom id 

    // Create a new order
    const order = new Order({
      _id: orderId,
      customerID: user._id,
      items: Cartitems.map(item => ({
        foodId: item.foodId, // Change from foodId to id
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        imageUrl: item.imageUrl
      })),
      deliveryBoyId,
      deliveryBoyName,
      deliveryBoyPhone,
      deliveryAddress,
      deliveryLat,
      deliveryLong,
      restaurantLat,
      restaurantLong,
      customerContact,
      restaurantPhoneNumber,
      distance,
      price,
      tax,
      PlatformFee,
      deliveryInstructions,
      cookingInstructions,
      deliveryCharge,
      totalPayablePrice,
      status,
      payment,
      expectedDeliveryDuration,
      orderTime: new Date()
    });

    // Save the order
    await order.save();

    res.status(201).json({ message: "Order created successfully.", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//.......get order ........//
foodRouter.get('/getorders', authenticate, async (req, res) => {
  try {
    // Fetch all orders from the database
    const orders = await Order.find({});

    // If no orders are found, return an empty array
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }

    // If orders are found, return them
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//grt those order login token .......//
foodRouter.get('/usergetorders', authenticate, async (req, res) => {
  try {
    // Get the ID of the currently logged-in user
    const userId = req.user._id;

    // Fetch orders placed by the current user from the database
    const orders = await Order.find({ customerID: userId });

    // If no orders are found for the user, return a message
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user." });
    }

    // If orders are found, return them
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//get order for delevry partner .............//
foodRouter.get('/dgetorders', authenticate, async (req, res) => {
  try {
    // Get the ID of the currently logged-in user
    const deliveryboyId = req.user._id;

    // Fetch orders placed by the current user from the database
    const orders = await Order.find({ deliveryBoyId: deliveryboyId });

    // If no orders are found for the user, return a message
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this deliveryPartner." });
    }

    // If orders are found, return them
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get all delivry partner .....//

foodRouter.get('/delivery-partners', authenticate, async (req, res) => {
  try {
    // Query the database for all delivery partners
    const deliveryPartners = await User.find({ role: 'deliveryPartner' });

    // If no delivery partners are found, return an empty array
    if (!deliveryPartners || deliveryPartners.length === 0) {
      return res.status(404).json({ message: "No delivery partners found." });
    }

    // If delivery partners are found, return them
    res.json(deliveryPartners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//.......search by id ........//
foodRouter.get('/getordersbyid', authenticate, async (req, res) => {
  try {
    // Check if an order ID is provided in the query parameters
    const orderId = req.query.orderId;

    if (orderId) {
      // If an order ID is provided, search for the order by its ID
      const order = await Order.findById(orderId);

      // If the order is not found, return a 404 response
      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }

      // If the order is found, return it
      return res.json(order);
    }

    // If no order ID is provided, fetch all orders from the database
    const orders = await Order.find({});

    // If no orders are found, return an empty array
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }

    // If orders are found, return them
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//............edit order ..........//
// foodRouter.put('/edit-order/:orderId', authenticate, async (req, res) => {
//   try {
//     const orderId = req.params.orderId;
//     const {
//       // Cartitems,
//       deliveryBoyId,
//       deliveryBoyName,
//       deliveryBoyPhone,
//       deliveryAddress,
//       deliveryLat,
//       deliveryLong,
//       deliveryInstructions,
//       cookingInstructions,
//       deliveryCharge,
//       totalPayablePrice,
//       status,
//       payment,
//       distance,
//       expectedDeliveryDuration,
//       restaurantPhoneNumber,
//       restaurantLat,
//       restaurantLong,
//       price,
//       tax,
//       PlatformFee
//     } = req.body;

//     // Find the user by ID
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found." });
//     }

   

//     // Find the existing order
//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({ error: "Order not found." });
//     }

//     // Update the order details
//     // order.items = Cartitems.map(item => ({
//     //   foodId: item.foodId, // Change from foodId to id
//     //   quantity: item.quantity,
//     //   price: item.price,
//     //   name: item.name,
//     //   imageUrl: item.imageUrl
//     // }));
//     order.deliveryBoyId = deliveryBoyId;
//     order.deliveryBoyName = deliveryBoyName;
//     order.deliveryBoyPhone = deliveryBoyPhone;
//     order.deliveryAddress = deliveryAddress;
//     order.deliveryLat = deliveryLat;
//     order.deliveryLong = deliveryLong;
//     order.restaurantLat = restaurantLat;
//     order.restaurantLong = restaurantLong;
//     order.restaurantPhoneNumber = restaurantPhoneNumber;
//     order.distance = distance;
//     order.price = price;
//     order.tax = tax;
//     order.PlatformFee = PlatformFee;
//     order.deliveryInstructions = deliveryInstructions;
//     order.cookingInstructions = cookingInstructions;
//     order.deliveryCharge = deliveryCharge;
//     order.totalPayablePrice = totalPayablePrice;
//     order.status = status;
//     order.payment = payment;
//     order.expectedDeliveryDuration = expectedDeliveryDuration;

//     // Save the updated order
//     await order.save();

//     res.status(200).json({ message: "Order updated successfully.", order });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


//......edit2..............//
foodRouter.put('/edit-order/:orderId', authenticate, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const updates = req.body;

    // Check if the orderId is valid
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "Invalid orderId." });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Update the order with the provided fields
    Object.assign(order, updates);

    // Save the updated order
    await order.save();

    res.status(200).json({ message: "Order updated successfully.", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});






module.exports = { foodRouter };
