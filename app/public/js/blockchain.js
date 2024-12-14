const SHOP_WALLET = '24DqyME5U97Bc43WW42tMZcpEzw4mez5XRE1bb56VR1d';
const NETWORK = 'devnet';
const SOL_PRICE_USD = 200; // Precio fijo para ejemplo

let publicKey = null;

async function createTransaction(fromPubkey, toPubkey, lamports) {
    try {
        const connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl(NETWORK)
        );
        
        // Usar directamente SystemProgram.transfer
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey,
                toPubkey: new solanaWeb3.PublicKey(toPubkey),
                lamports: BigInt(lamports)
            })
        );

        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;

        return transaction;
    } catch (error) {
        console.error('Error creando transacción:', error);
        throw error;
    }
}

async function processPayment(amountUSD) {
    try {
        if (!window.solana?.isPhantom) {
            alert('Por favor instala Phantom Wallet');
            return false;
        }

        document.getElementById('tx-status').textContent = 'Procesando...';

        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl(NETWORK));
        
        if (!publicKey) {
            await initSolanaPayment();
        }

        // Convertir USD a SOL
        const solAmount = amountUSD / SOL_PRICE_USD;
        const lamports = Math.round(solAmount * solanaWeb3.LAMPORTS_PER_SOL);

        // Crear transacción
        const transaction = await createTransaction(
            publicKey,
            new solanaWeb3.PublicKey(SHOP_WALLET),
            lamports
        );

        // Firmar y enviar
        const signedTx = await window.solana.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTx.serialize());
        
        // Confirmar transacción
        const confirmation = await connection.confirmTransaction(signature);
        
        if (confirmation.value.err) {
            throw new Error('Error confirmando la transacción');
        }

        document.getElementById('tx-status').textContent = 'Completada';
        alert('¡Pago exitoso!');
        return true;

    } catch (error) {
        console.error('Error en el pago:', error);
        document.getElementById('tx-status').textContent = 'Fallida';
        alert('Error en el pago. Por favor intenta de nuevo.');
        return false;
    }
}

async function initSolanaPayment() {
    try {
        const resp = await window.solana.connect();
        publicKey = resp.publicKey;
        
        document.getElementById('wallet-info').style.display = 'block';
        document.getElementById('connect-phantom').style.display = 'none';
        
        const walletAddress = publicKey.toString();
        document.getElementById('wallet-address').textContent = 
            `${walletAddress.slice(0,4)}...${walletAddress.slice(-4)}`;

        await updateBalance();
        
    } catch (error) {
        console.error('Error conectando wallet:', error);
        alert('Error conectando con Phantom');
    }
}

async function updateBalance() {
    try {
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl(NETWORK));
        const balance = await connection.getBalance(publicKey);
        document.getElementById('wallet-balance').textContent = 
            `${(balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4)}`;
    } catch (error) {
        console.error('Error obteniendo balance:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connect-phantom');
    if (connectButton) {
        connectButton.addEventListener('click', initSolanaPayment);
    }
});

window.processPayment = processPayment;
window.initSolanaPayment = initSolanaPayment;