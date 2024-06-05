const express = require('express');
const cors = require('cors');
require('./db/config'); // Import the database configuration
const Product = require('./db/products'); // Import the Product model
const User = require('./db/user');
const Cart = require('./db/cart');
const Order = require('./db/order'); // Import the Order model
const app = express();

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Fetch all products
app.get('/products', async (req, res) => {
    try {
        let products = await Product.find();
        res.send(products); // Directly send products array
    } catch (error) {
        console.error('Failed to fetch products:', error);
        res.status(500).send({ error: 'Failed to fetch products' });
    }
});


// Register a new user
app.post("/register", async (req, res) => {
    try {
        let user = new User(req.body);
        let result = await user.save();
        result = result.toObject();
        delete result.password;
        res.send({ result });
    } catch (error) {
        res.status(500).send({ error: 'Registration failed' });
    }
});

// User login
app.post("/login", async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email, password: req.body.password }).select("-password");
        if (user) {
            res.send({ user });
        } else {
            res.status(404).send({ result: 'No user found' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Login failed' });
    }
});

// Get cart items by user ID
app.get('/cart/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const cartItems = await Cart.find({ userid: id });
        if (cartItems.length > 0) {
            res.json({ success: true, cartItems });
        } else {
            res.json({ success: false, result: "No Cart Items found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch cart items' });
    }
});

// Add item to cart
app.post('/cart', async (req, res) => {
    try {
        const newCartItem = new Cart(req.body);
        const validationError = newCartItem.validateSync();

        if (validationError) {
            return res.status(400).json({ message: validationError.message });
        }

        const savedItem = await newCartItem.save();
        res.status(201).json({ message: 'Cart item added successfully.', data: savedItem });
    } catch (err) {
        console.error('Error adding cart item:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update cart item quantity
app.patch('/cart/:id', async (req, res) => {
    try {
        const cartItem = await Cart.findById(req.params.id);
        if (cartItem == null) {
            return res.status(404).json({ message: 'Cannot find cart item' });
        }

        if (req.body.quantity != null) {
            cartItem.quantity = req.body.quantity;
        }

        const updatedCartItem = await cartItem.save();
        return res.json({ success: true, updatedCartItem });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Failed to update cart item' });
    }
});

// Delete cart item
app.delete('/cart/:id', async (req, res) => {
    try {
        const cartItem = await Cart.findById(req.params.id);
        if (cartItem == null) {
            return res.status(404).json({ message: 'Cannot find cart item' });
        }

        await Cart.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Deleted cart item' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete cart item' });
    }
});

// Fetch orders by user ID
app.get('/orders/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const orders = await Order.find({ userid: userId });
        if (orders.length > 0) {
            res.json({ success: true, orders });
        } else {
            res.json({ success: false, result: "No orders found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
});

// Submit order
app.post('/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json({ success: true, order: savedOrder });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to submit order' });
    }
});

// Fetch all orders
app.get('/order', async (req, res) => {
    try {
        const orders = await Order.find();
        if (orders.length > 0) {
            res.json({ success: true, orders });
        } else {
            res.json({ success: false, result: "No orders found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
});


// Start the server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
