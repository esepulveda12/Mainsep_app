// models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    planName: String,
    status: String,
    startDate: Date,
    nextPayment: Date,
    amount: Number
});

module.exports = mongoose.model('Subscription', subscriptionSchema);

// routes/subscriptions.js
router.get('/api/users/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('subscriptions');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});