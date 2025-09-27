const express = require("express");
const app = express();

app.use(express.json()); // to parse JSON body

// Root API
app.get("/", (req, res) => {
  res.send("Hello, CI/CD pipeline works with Express API! 🚀");
});

// Status API
app.get("/status", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Mock users data
let users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

// Get all users
app.get("/users", (req, res) => {
  res.json(users);
});

// Add new user
app.post("/users", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  const newUser = { id: users.length + 1, name };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
