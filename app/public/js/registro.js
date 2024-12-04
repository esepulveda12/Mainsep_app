document.getElementById('registro-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    console.log('Enviando datos:', { username, email, password }); // Para debug

    const response = await fetch('http://localhost:3000/api/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();
    console.log('Respuesta del servidor:', data); // Para debug

    if (response.ok) {
      alert('Registro exitoso');
      window.location.href = '/login.html';
    } else {
      alert(data.message || 'Error al registrar usuario');
    }
  } catch (error) {
    console.error('Error detallado:', error);
    alert('Error al registrar usuario. Revisa la consola para más detalles.');
  }
});