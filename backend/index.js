const generateTicketNumber = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Middleware for parsing JSON and CORS
const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect("mongodb://0.0.0.0:27017/tickets", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Define the Ticket schema and model
const Ticket = mongoose.model("Ticket", {
  ticketNumber: String,
  subject: String,
  description: String,
  replies: [String],
});

//handle login
let users = [
  { username: "admin", password: "password" },
  { username: "user1", password: "password1" },
];
const SECRET = "Chala ja bsdk";
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    let token = jwt.sign({ username: username }, SECRET);
    res.status(200).json({ success: true, username });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// API endpoint for creating a ticket
app.post("/api/tickets", async (req, res) => {
  const { subject, description, user } = req.body;
  if (user != "admin") {
    return res.json({ success: false, message: "unauthorized" });
  }
  const ticketNumber = generateTicketNumber();
  console.log("ticket generating");
  try {
    const ticket = new Ticket({ ticketNumber, subject, description, user });
    await ticket.save();
    res.json({ ticket });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate ticket" });
  }
});

app.post("/api/reply", async (req, res) => {
  const { user, reply, ticketNumber } = req.body;
  try {
    let ticket = await Ticket.findOne({ ticketNumber: ticketNumber });
    ticket.replies.push(reply);
    await ticket.save();
    res.json({ ticket });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate ticket" });
  }
});
// API endpoint for retrieving tickets
app.get("/api/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

// API endpoint for adding a reply to a ticket
app.post("/api/tickets/:ticketNumber/reply", async (req, res) => {
  const { reply } = req.body;
  const { ticketNumber } = req.params;

  try {
    const ticket = await Ticket.findOne({ ticketNumber });
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    ticket.replies.push(reply);
    await ticket.save();
    res.json({ message: "Reply added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add reply" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
