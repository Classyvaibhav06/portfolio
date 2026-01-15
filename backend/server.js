require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const dbURI = process.env.MONGO_URI || "mongodb://localhost:27017/portfolio"; // Replace with your MongoDB connection string

mongoose
  .connect(dbURI)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

// Create a schema for the contact form data
const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Create a model from the schema
const Contact = mongoose.model("Contact", ContactSchema);

// API endpoint to handle form submission
app.post("/api/contact", async (req, res) => {
  try {
    const newContact = new Contact({
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
    });

    const contact = await newContact.save();
    res.json({ success: true, msg: "Message sent successfully!", contact });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, msg: "Failed to send message.", err });
  }
});

// API endpoint to get all contacts (Protected)
app.get("/api/contacts", async (req, res) => {
  const { password } = req.query;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (password !== adminPassword) {
    return res.status(401).json({ success: false, msg: "Unauthorized access" });
  }

  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.json({ success: true, contacts });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error", err });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
