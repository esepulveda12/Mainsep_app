// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   name: String,
   email: { type: String, unique: true },
   password: String,
   role: { type: String, enum: ['user', 'admin'], default: 'user' },
   walletAddress: String,
   subscriptions: [{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Subscription'
   }],
   createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

// models/Subscription.js
const subscriptionSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   planName: String,
   status: { type: String, enum: ['active', 'cancelled', 'expired'] },
   startDate: Date,
   nextPayment: Date,
   amount: Number,
   txSignature: String
});

module.exports = mongoose.model('Subscription', subscriptionSchema);

// routes/dashboard.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subscription = require('../models/Subscription');

router.get('/api/users/:userId', async (req, res) => {
   try {
       const user = await User.findById(req.params.userId)
           .populate('subscriptions');
           
       if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

       res.json({
           name: user.name,
           email: user.email,
           role: user.role,
           walletAddress: user.walletAddress,
           subscriptions: user.subscriptions
       });
   } catch (error) {
       res.status(500).json({ error: error.message });
   }
});

router.post('/api/subscriptions/:id/renew', async (req, res) => {
   try {
       const subscription = await Subscription.findById(req.params.id);
       subscription.nextPayment = new Date(subscription.nextPayment.getTime() + 30*24*60*60*1000);
       subscription.status = 'active';
       await subscription.save();
       res.json(subscription);
   } catch (error) {
       res.status(500).json({ error: error.message });
   }
});

router.post('/api/subscriptions/:id/cancel', async (req, res) => {
   try {
       const subscription = await Subscription.findById(req.params.id);
       subscription.status = 'cancelled';
       await subscription.save();
       res.json(subscription);
   } catch (error) {
       res.status(500).json({ error: error.message });
   }
});

// Admin routes
router.get('/api/admin/users', async (req, res) => {
   try {
       const users = await User.find().populate('subscriptions');
       res.json(users);
   } catch (error) {
       res.status(500).json({ error: error.message });
   }
});

router.get('/api/admin/stats', async (req, res) => {
   try {
       const stats = {
           totalUsers: await User.countDocuments(),
           activeSubscriptions: await Subscription.countDocuments({ status: 'active' }),
           revenue: await Subscription.aggregate([
               { $match: { status: 'active' } },
               { $group: { _id: null, total: { $sum: '$amount' } } }
           ])
       };
       res.json(stats);
   } catch (error) {
       res.status(500).json({ error: error.message });
   }
});

module.exports = router;