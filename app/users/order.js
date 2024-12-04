const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  plan: String,
  price: Number,
  customerEmail: String,
  customerName: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);