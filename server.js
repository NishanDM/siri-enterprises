//-------------STARTING THE JAVASCRIPT FOR INSERTING THE DATA TO THE MONGODB DATABASE----------------------------//

require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI;
const dbName = "SIRI";
const collectionName = "invoices";

console.log("MONGO_URI:", uri); // Debugging: See if MONGO_URI is loaded

// Ensure MONGO_URI exists before using it
if (!uri) {
    console.error("Error: MONGO_URI is not defined. Set it in Render's environment variables.");
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

let client;
async function connectDB() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
    return client.db(dbName).collection(collectionName);
}

// API Route to generate and store an invoice number
app.post("/generate-invoice", async (req, res) => {
    try {
        const collection = await connectDB();

        // Find last invoice number and generate next one
        const lastInvoice = await collection.findOne({}, { sort: { invoiceNumber: -1 } });
        const nextInvoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1000;

        // Store in MongoDB
        await collection.insertOne({ invoiceNumber: nextInvoiceNumber, createdAt: new Date() });

        res.json({ success: true, invoiceNumber: nextInvoiceNumber });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});



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

