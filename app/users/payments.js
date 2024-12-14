// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
// Usa tu clave secreta de producción
const stripe = require('stripe')('sk_live_TuClaveSecretaAqui');

router.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { paymentMethodId, amount, email, name } = req.body;

        // Crear un PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convertir a centavos
            currency: 'usd',
            payment_method: paymentMethodId,
            confirmation_method: 'manual',
            confirm: false,
            description: 'Suscripción MainSep',
            metadata: {
                customer_name: name,
                customer_email: email
            },
            receipt_email: email
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });

    } catch (error) {
        console.error('Error en el pago:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

// Webhook para manejar eventos de Stripe
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            'tu_webhook_secret' // Configura esto en tu dashboard de Stripe
        );
    } catch (err) {
        console.error('Error webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar el evento
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            // Aquí puedes añadir lógica para actualizar tu base de datos
            console.log('PaymentIntent fue exitoso:', paymentIntent.id);
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Pago fallido:', failedPayment.id);
            break;
    }

    res.json({received: true});
});

module.exports = router;