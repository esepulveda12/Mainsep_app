// Constants
const RECIPIENT_WALLET = 'AL36H3ooEDRLi6hsHMkDXQ8HXZ5aPbvnHuDDPFpkVYzU';
const NETWORK = 'devnet';

// Rest of the code remains exactly the same as in previous artifact
let provider = null;
let publicKey = null;

async function initSolanaPayment() {
    if (!window.solana || !window.solana.isPhantom) {
        alert('Por favor instala Phantom Wallet');
        return;
    }

    try {
        const resp = await window.solana.connect();
        provider = window.solana;
        publicKey = resp.publicKey;
        
        document.getElementById('wallet-info').style.display = 'block';
        await updateWalletInfo();
        
        return true;
    } catch (err) {
        console.error('Error connecting to Phantom:', err);
        alert('Error al conectar con Phantom');
        return false;
    }
}

async function updateWalletInfo() {
    if (!publicKey) return;

    const connection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl(NETWORK)
    );

    try {
        const balance = await connection.getBalance(publicKey);
        
        document.getElementById('wallet-address').textContent = 
            `${publicKey.toString().slice(0,4)}...${publicKey.toString().slice(-4)}`;
        document.getElementById('wallet-balance').textContent = 
            `${(balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4)}`;
    } catch (err) {
        console.error('Error fetching balance:', err);
    }
}

async function processPayment(amount) {
    if (!publicKey || !provider) {
        alert('Por favor conecta tu wallet primero');
        return false;
    }

    const connection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl(NETWORK)
    );

    try {
        document.getElementById('tx-status').textContent = 'Procesando...';

        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new solanaWeb3.PublicKey(RECIPIENT_WALLET),
                lamports: amount * solanaWeb3.LAMPORTS_PER_SOL
            })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        const signed = await provider.signAndSendTransaction(transaction);
        
        const confirmation = await connection.confirmTransaction(signed.signature);
        
        if (confirmation.value.err) throw new Error('Transaction failed');

        document.getElementById('tx-status').textContent = 'Completada';
        alert('¡Pago exitoso!');
        return true;

    } catch (err) {
        console.error('Error in payment:', err);
        document.getElementById('tx-status').textContent = 'Error';
        alert('Error en el pago: ' + err.message);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('connect-phantom').addEventListener('click', initSolanaPayment);
});