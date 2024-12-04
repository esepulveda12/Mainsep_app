// Módulo de gestión del carrito
const cartModule = (function () {
  let cart = [];
 
  // Cargar el carrito del localStorage
  function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
      updateCartUI();
    }
  }
 
  // Guardar el carrito en el localStorage
  function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
 
  // Agregar un plan al carrito
  function addToPlan(plan, price) {
    const existingPlan = cart.find((item) => item.plan === plan);
    if (existingPlan) {
      existingPlan.quantity++;
    } else {
      cart.push({ plan, price, quantity: 1 });
    }
    updateCartUI();
    saveCartToLocalStorage();
  }
 
  // Actualizar la cantidad de un plan
  function updatePlanQuantity(plan, action) {
    const item = cart.find((item) => item.plan === plan);
    if (item) {
      if (action === 'increase') {
        item.quantity++;
      } else if (action === 'decrease') {
        item.quantity--;
        if (item.quantity <= 0) {
          cart = cart.filter((i) => i.plan !== plan);
        }
      }
      updateCartUI();
      saveCartToLocalStorage();
    }
  }
 
  // Eliminar un plan del carrito
  function removePlan(plan) {
    cart = cart.filter((item) => item.plan !== plan);
    updateCartUI();
    saveCartToLocalStorage();
  }
 
  // Vaciar el carrito
  function emptyCart() {
    cart = [];
    updateCartUI();
    saveCartToLocalStorage();
  }
 
  // Actualizar la interfaz del carrito
  function updateCartUI() {
    updateCartCount();
    renderCartItems();
  }
 
  function updateCartCount() {
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    $('.cart-count').text(cartCount);
  }
 
  function renderCartItems() {
    $('#cart-items').empty();
    let total = 0;
 
    cart.forEach((item) => {
      total += item.price * item.quantity;
      $('#cart-items').append(`
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${item.plan} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}
          <div>
            <button class="btn btn-secondary btn-sm update-quantity" data-plan="${item.plan}" data-action="increase">+</button>
            <button class="btn btn-secondary btn-sm update-quantity" data-plan="${item.plan}" data-action="decrease">-</button>
            <button class="btn btn-danger btn-sm remove-item" data-plan="${item.plan}">Eliminar</button>
          </div>
        </li>
      `);
    });
 
    $('#cart-total').text(total.toFixed(2));
 
    $('.update-quantity').off('click').on('click', function () {
      const planToUpdate = $(this).data('plan');
      const action = $(this).data('action');
      updatePlanQuantity(planToUpdate, action);
    });
 
    $('.remove-item').off('click').on('click', function () {
      const planToRemove = $(this).data('plan');
      removePlan(planToRemove);
    });
  }
 
  function calculateCartTotal() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }
 
  function getCartItems() {
    return cart.map(item => ({
      name: item.plan,
      price: item.price,
      quantity: item.quantity,
      icon: getPlanIcon(item.plan),
      description: getPlanDescription(item.plan),
      features: getPlanFeatures(item.plan)
    }));
  }
 
  function getPlanIcon(plan) {
    const icons = {
      inicio: 'cohete (1).png',
      basico: 'operacion.png',
      profesional: 'edificio.png',
      empresarial: 'corona (3).png'
    };
    return icons[plan] || 'default.png';
  }
 
  function getPlanDescription(plan) {
    const descriptions = {
      inicio: 'Empieza con 1 mes gratis y después paga solo $15/mes.',
      basico: 'Ideal para pequeñas empresas que buscan una solución profesional y accesible.',
      profesional: 'Perfecto para negocios en crecimiento que necesitan más flexibilidad.',
      empresarial: 'Para grandes empresas que requieren soluciones personalizadas y completas.'
    };
    return descriptions[plan] || '';
  }
 
  function getPlanFeatures(plan) {
    const features = {
      inicio: ['Hosting y dominio incluidos', 'Diseño web básico', 'Hasta 2 páginas', 'Soporte vía email', 'Seguridad básica'],
      basico: ['Todo Incluido del Plan Starter', 'Diseño web responsivo', 'Hasta 5 páginas', 'Soporte técnico estándar', 'Seguridad SSL básica'],
      profesional: ['Todo Incluido del Plan Basico', 'Hasta 8 páginas', 'Soporte prioritario', 'Optimización SEO básica', 'Seguridad avanzada SSL'],
      empresarial: ['Todo Incluido del Plan Profesional', 'Hasta 15 páginas', 'Soporte 24/7 Consultoría en estrategias digitales', 'Seguridad avanzada y contratos inteligentes en blockchain']
    };
    return features[plan] || [];
  }
 
  return {
    loadCartFromLocalStorage,
    addToPlan,
    updatePlanQuantity,
    removePlan,
    emptyCart,
    calculateCartTotal,
    getCartItems
  };
 })();
 
 // Inicializar el carrito
 $(document).ready(function () {
  cartModule.loadCartFromLocalStorage();
 
  // Agregar planes al carrito
  document.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
      const plan = btn.dataset.plan;
      const price = parseFloat(btn.dataset.price);
      cartModule.addToPlan(plan, price);
      $('#addedToCartModal').modal('show');
    });
  });
 
  // Vaciar carrito
  $('#emptyCartButton').click(function () {
    cartModule.emptyCart();
  });
 
  // Ir a pagar
  $('#checkoutButton').click(function () {
    const cartItems = cartModule.getCartItems();
    if (cartItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    
    const checkoutData = {
      plans: cartItems,
      total: cartModule.calculateCartTotal(),
      date: new Date().toISOString()
    };
    
    localStorage.setItem('selectedPlans', JSON.stringify(checkoutData));
    window.location.href = 'pagos.html';
  });
 });


 