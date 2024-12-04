async function processPayment(planData) {
    try {
        // Obtener ID de usuario del localStorage
        const userId = localStorage.getItem('userId');
        
        // Crear suscripción en blockchain
        const success = await createSubscription(
            userId,
            planData.name,
            planData.price * solanaWeb3.LAMPORTS_PER_SOL
        );

        if (success) {
            document.getElementById('tx-status').textContent = 'Completada';
            // Actualizar estado en MongoDB
            await fetch('/api/updateSubscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    planType: planData.name,
                    amount: planData.price
                })
            });
        }
    } catch (err) {
        console.error(err);
        document.getElementById('tx-status').textContent = 'Error';
    }
}