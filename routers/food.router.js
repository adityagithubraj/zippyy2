const express = require('express');
const foodRouter = express.Router();
const Food = require('../models/food.models')
const { authenticate } = require("../middleware/auth")
const { authorize } = require("../middleware/authorize")
const { User } = require("../models/user.model")
const {Cart} = require("../models/cart.model")
const { Order } = require('../models/oder.modules')

const {Restaurant} = require('../models/resturent.model');



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


//..............place-orde......................//

// foodRouter.post('/place-order', authenticate, async (req, res) => {
//   const userId = req.user._id; // Assuming `authenticate` middleware correctly sets `req.user`
//   const { paymentMethod, deliveryAddress } = req.body;

//   try {
//       const cart = await Cart.findOne({ userId });

//       if (!cart || cart.items.length === 0) {
//           return res.status(400).json({ error: "Your cart is empty." });
//       }

//       // Fetch current prices for items
//       const itemsWithPrices = await Promise.all(cart.items.map(async (item) => {
//           const foodItem = await Food.findById(item.foodId);
//           if (!foodItem) {
//               throw new Error(`Food item not found: ${item.foodId}`);
//           }
//           return {
//               foodId: item.foodId,
//               quantity: item.quantity,
//               price: foodItem.price // Assuming `price` is a field on the Food model
//           };
//       }));

//       // Calculate total price based on itemsWithPrices
//       const totalPrice = calculateTotalPrice(itemsWithPrices);

//       const order = new Order({
//           customerID: userId,
//           items: itemsWithPrices,
//           totalPrice,
//           paymentMethod,
//           orderStatus: 'pending',
//           deliveryAddress
//       });

//       await order.save();
//       await Cart.findByIdAndDelete(cart._id); // Optionally clear the cart after placing the order

//       res.status(201).json({ order });
//   } catch (error) {
//       console.error(error); // Logging the error can help with debugging
//       res.status(500).json({ error: error.message });
//   }
// });


//.............order route -2..............//
// foodRouter.post('/place-order', authenticate, async (req, res) => {
//   const userId = req.user._id; // Assuming `authenticate` middleware correctly sets `req.user`
//   const { paymentMethod, deliveryAddress } = req.body;

//   try {
//       // Find the user by ID and populate the cart
//       const user = await User.findById(userId).populate('cart.foodId');
//       if (!user || !user.cart || user.cart.length === 0) {
//           return res.status(400).json({ error: "Your cart is empty." });
//       }

//       // Fetch current prices for items
//       const itemsWithPrices = user.cart.map(item => {
//           const foodItem = item.foodId;
//           if (!foodItem) {
//               throw new Error(`Food item not found: ${item.foodId}`);
//           }
//           return {
//               foodId: item.foodId._id,
//               quantity: item.quantity,
//               price: foodItem.price // Assuming `price` is a field on the Food model
//           };
//       });

//       // Calculate total price based on itemsWithPrices
//       const totalPrice = calculateTotalPrice(itemsWithPrices);

//       const order = new Order({
//           customerID: userId,
//           items: itemsWithPrices,
//           totalPrice,
//           paymentMethod,
//           orderStatus: 'pending',
//           deliveryAddress
//       });

//       await order.save();
//       // Clear the user's cart after placing the order
//       user.cart = [];
//       await user.save();

//       res.status(201).json({ order });
//   } catch (error) {
//       console.error(error); // Logging the error can help with debugging
//       res.status(500).json({ error: error.message });
//   }
// });




// foodRouter.post('/place-order', authenticate, async (req, res) => {
//   const userId = req.user._id; // Assuming `authenticate` middleware correctly sets `req.user`
//   const { paymentMethod, deliveryAddress } = req.body;

//   try {
//     // Find the user by ID and populate the cart
//     const user = await User.findById(userId).populate('cart.foodId');
//     if (!user || !user.cart || user.cart.length === 0) {
//       return res.status(400).json({ error: "Your cart is empty." });
//     }

//     // Fetch current prices for items
//     const itemsWithPrices = user.cart.map(item => {
//       const foodItem = item.foodId;
//       if (!foodItem) {
//         throw new Error(`Food item not found: ${item.foodId}`);
//       }
//       return {
//         foodId: item.foodId._id,
//         quantity: item.quantity,
//         price: foodItem.price // Assuming `price` is a field on the Food model
//       };
//     });

//     // Calculate total price based on itemsWithPrices
//     const totalPrice = calculateTotalPrice(itemsWithPrices);

//     const order = new Order({
//       customerID: userId,
//       items: itemsWithPrices,
//       totalPrice,
//       paymentMethod,
//       orderStatus: 'pending',
//       deliveryAddress
//     });

//     await order.save();
//     // Clear the user's cart after placing the order
//     user.cart = [];
//     await user.save();

//     res.status(201).json({ order });
//   } catch (error) {
//     console.error(error); // Logging the error can help with debugging
//     res.status(500).json({ error: error.message });
//   }
// });



//................order route..............//
// foodRouter.post('/create-order', authenticate, async (req, res) => {
//   try {
//     const { address, paymentMethod } = req.body;
//     const userId = req.user._id;

//     // Find the user by ID
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.json({ error: "User not found." });
//     }

//     // Fetch all cart items for the current user
//     const cartItems = user.cart;

//     // Check if the cart is empty
//     if (cartItems.length === 0) {
//       return res.json({ error: "Cart is empty." });
//     }

//     // Calculate the total price
//     let totalPrice = 0;
//     for (const item of cartItems) {
//       const foodItem = await Food.findById(item.foodId);
//       if (!foodItem) {
//         return res.json({ error: "Food item not found." });
//       }
//       totalPrice += foodItem.price * item.quantity;
//     }

//     // Create a new order
//     const order = new Order({
//       customerID: userId,
//       items: cartItems.map(item => ({
//         foodId: item.foodId,
//         quantity: item.quantity,
//         //price: 0 // This will be populated later
//       })),
//       totalPrice,
//       orderStatus: 'pending',
//       paymentMethod,
//       deliveryAddress: address
//     });

//     // Save the order
//     await order.save();

//     // Empty the user's cart after the order is successfully created
//     user.cart = [];
//     await user.save();

//     res.json({ msg: "Order created successfully.", order });
//   } catch (error) {
//     res.json({ error: error.message });
//   }
// });



// ..................Route to create an order.............//

// foodRouter.post('/create-order', authenticate, async (req, res) => {
//   try {
//     const {
//       Cartitems,
//       deliveryTime,
//       deliveryBoyId,
//       deliveryBoyName,
//       deliveryBoyPhone,
//       deliveryAddress,
//       deliveryLat,
//       deliveryLon,
//       deliveryInstructions,
//       cookingInstructions,
//       deliveryCharge
//     } = req.body;

//     // Find the user by ID
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found." });
//     }

//     // Check if the cart is empty
//     if (!Cartitems || Cartitems.length === 0) {
//       return res.status(400).json({ error: "Cart items are required." });
//     }

//     // Calculate the total price
//     let totalPrice = 0;
//     for (const item of Cartitems) {
//       const foodItem = await Food.findById(item.foodId);
//       if (!foodItem) {
//         return res.status(400).json({ error: "Food item not found." });
//       }
//       totalPrice += foodItem.price * item.quantity;
//     }

//     // Create a new order
//     const order = new Order({
//       customerID: user._id,
//       items: Cartitems.map(item => ({
//         foodId: item.foodId,
//         quantity: item.quantity,
//         name: item.name,
//         price: item.price,
//         imageUrl: item.imageUrl
//         //price: 0 // This will be populated later
//       })),
//       totalPrice,
//       orderTime: new Date(),
//       deliveryTime,
//       deliveryBoyId,
//       deliveryBoyName,
//       deliveryBoyPhone,
//       deliveryAddress,
//       deliveryLat,
//       deliveryLon,
//       deliveryInstructions,
//       cookingInstructions,
//       deliveryCharge,
//       status: 'pending',
//       payment: false // Payment not yet made
//     });

//     // Save the order
//     await order.save();

//     res.status(201).json({ message: "Order created successfully.", order });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

//...........new order route .........//
// foodRouter.post('/create-order', authenticate, async (req, res) => {
//   try {
//     const {
//       Cartitems,
     
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

//     // Check if the cart is empty
//     if (!Cartitems || Cartitems.length === 0) {
//       return res.status(400).json({ error: "Cart items are required." });
//     }

//     // Create a new order
//     const order = new Order({
//       customerID: user._id,
//       items: Cartitems.map(item => ({
//         foodId: item.foodId,
//         quantity: item.quantity,
//         price: item.price,
//         name: item.name,
//         imageUrl: item.imageUrl
//       })),
      
//       deliveryBoyId,
//       deliveryBoyName,
//       deliveryBoyPhone,
//       deliveryAddress,
//       deliveryLat,
//       deliveryLong,
//       restaurantLat,
//       restaurantLong,
//       restaurantPhoneNumber,
//       distance,
//       price,
//       tax,
//       PlatformFee,
//       deliveryInstructions,
//       cookingInstructions,
//       deliveryCharge,
//       totalPayablePrice,
//       status,
//       payment,
//       expectedDeliveryDuration,
//       orderTime: new Date()
//     });

//     // Save the order
//     await order.save();

//     res.status(201).json({ message: "Order created successfully.", order });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


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

    // Check if the cart is empty
    if (!Cartitems || Cartitems.length === 0) {
      return res.status(400).json({ error: "Cart items are required." });
    }

    // Create a new order
    const order = new Order({
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

//................Accept or reject order route .................//
foodRouter.post('/accept-reject/:orderId', authenticate, authorize('admin'), async (req, res) => {
  const { orderId } = req.params;
  const { action } = req.body; // 'accept' or 'reject'

  try {
      const order = await Order.findById(orderId);
      if (!order) {
          return res.status(404).json({ error: "Order not found." });
      }

      if (action === 'accept') {
          order.orderStatus = 'accepted';
      } else if (action === 'reject') {
          order.orderStatus = 'cancelled';
      } else {
          return res.status(400).json({ error: "Invalid action." });
      }

      await order.save();
      res.json(order);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});


//............Asinge delivry partner .................//

foodRouter.post('/assign-delivery-partner/:orderId', authenticate, authorize('admin'), async (req, res) => {
  const { orderId } = req.params;
  const { deliveryPartnerId } = req.body;

  try {
      const order = await Order.findById(orderId);
      if (!order) {
          return res.status(404).json({ error: "Order not found." });
      }

      order.assignedDeliveryPartnerID = deliveryPartnerId;
      order.orderStatus = 'on the way'; // Optionally update the status here

      await order.save();
      res.json(order);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});


module.exports = { foodRouter };
