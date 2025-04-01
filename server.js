//-------------STARTING THE JAVASCRIPT FOR INSERTING THE DATA TO THE MONGODB DATABASE----------------------------//

require('dotenv').config(); // Ensure dotenv is loaded

console.log("MONGO_URI:", process.env.MONGO_URI); // Debugging: See if MONGO_URI is loaded

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Ensure MONGO_URI exists before using it
if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI is not defined. Set it in Render's environment variables.");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));


// Mongoose Schema
const OrderSchema = new mongoose.Schema({
    customer: {
        name: String,
        address: String,
        email: String,
        phone: String,
        invoice_no: String,
        date: String,
        payment_type: String,
        credit_period: String,
        net_total: String
    },
    items: [
        {
            item_no: String,
            item_code: String,
            description: String,
            unit: String,
            price: String,
            quantity: String,
            total: String
        }
    ],
    
    order_date: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", OrderSchema);

// API to Save Order
app.post("/order", async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json({ message: "Order saved successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//---------------------THE END-------------------------------------------------//

//-------------STARTING THE JAVASCRIPT FOR VIEWING THE DATA FROM THE MONGODB DATABASE----------------------------//

app.get("/orders", async (req, res) => {
    const orders = await Order.find();
    res.json(orders);
});

app.get("/order/:id", async (req, res) => {
    const order = await Order.findById(req.params.id);
    res.json(order);
});

app.delete("/order/:id", async (req, res) => {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully!" });
});
