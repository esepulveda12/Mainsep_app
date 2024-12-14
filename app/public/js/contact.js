document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            mensaje: document.getElementById('mensaje').value
        };
        
        try {
            const response = await fetch('https://mainsep.com/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Mensaje enviado correctamente');
                form.reset();
            } else {
                throw new Error(data.error || 'Error al enviar el mensaje');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar el mensaje');
        }
    });
});