let stripe;

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar Stripe
  stripe = Stripe('tu_stripe_publishable_key');
  
  // Mostrar detalles del carrito
  displayCartDetails();
});

function displayCartDetails() {
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  
  // Actualizar el DOM con los detalles
  document.getElementById('cart-total').textContent = `$${total}`;
  // Aquí puedes agregar más detalles del carrito
}

async function handlePayment(e) {
  e.preventDefault();
  
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan: cartItems[0]?.plan || 'default',
        price: total
      }),
    });
    
    const { id: sessionId } = await response.json();
    
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      console.error(error);
      alert('Error al procesar el pago. Por favor, intente nuevamente.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al procesar el pago. Por favor, intente nuevamente.');
  }
}

// Agregar el event listener al formulario
document.querySelector('form').addEventListener('submit', handlePayment);




  