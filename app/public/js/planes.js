  // En la página de pagos, obtener los datos del plan
  window.onload = function() {
    const plan = localStorage.getItem('selectedPlan');
    const price = localStorage.getItem('selectedPrice');
  
    // Si hay datos en localStorage, mostrar la información
    if (plan && price) {
      document.getElementById('plan-name').innerText = plan.charAt(0).toUpperCase() + plan.slice(1);
      document.getElementById('plan-price').innerText = `$${price} USD/mes`;
    } else {
      // Si no se seleccionó un plan, redirigir al usuario
      window.location.href = 'planes.html';
    }
  };