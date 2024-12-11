const stripe = Stripe('pk_test_51QRcpQLSBkz44dNHdae3BCybnhRt6HsthZgmanWp80ccYGrh7tJB915wmTUEYf6vb7qOcVNaa9T7xFP6qusvbiTg00gSkoZR6Z');
const elements = stripe.elements();

const style = {
    base: {
        fontSize: '16px',
        color: '#32325d',
    }
};

const card = elements.create('card', {style});
card.mount('#card-element');

card.addEventListener('change', ({error}) => {
    const displayError = document.getElementById('card-errors');
    if (error) {
        displayError.textContent = error.message;
    } else {
        displayError.textContent = '';
    }
});

const form = document.getElementById('payment-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Form submitted');  // Añade esto

    const {error, paymentMethod} = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
        billing_details: {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value
        }
    });
    console.log('Payment method created:', paymentMethod);

    if (error) {
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.message;
        return;
    }

    // Crear sesión de checkout
    const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
            amount: window.total,
            email: document.getElementById('email').value,
            name: document.getElementById('name').value
        })
    });

    const session = await response.json();

    if (session.error) {
        alert('Error: ' + session.error);
        return;
    }

    // Confirmar el pago
    const result = await stripe.confirmCardPayment(session.clientSecret);
    
    if (result.error) {
        alert('Error: ' + result.error.message);
    } else {
        alert('¡Pago exitoso!');
        localStorage.removeItem('selectedPlans');
        window.location.href = '/success.html';
    }
});