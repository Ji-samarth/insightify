// models/User.js
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: { type: String, default: null },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

module.exports = model("User", userSchema);
