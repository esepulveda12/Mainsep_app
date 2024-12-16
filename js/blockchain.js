// blockchain.js
const SHOP_WALLET = '24DqyME5U97Bc43WW42tMZcpEzw4mez5XRE1bb56VR1d';
const NETWORK = 'devnet';
// Token USDT de prueba en devnet
const USDT_MINT = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
const DECIMALS = 6; // USDT tiene 6 decimales

let publicKey = null;
let connection = null;

async function findAssociatedTokenAddress(walletAddress, tokenMint) {
    const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new solanaWeb3.PublicKey(
        'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
    );
    const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey(
        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    );

    const [address] = await solanaWeb3.PublicKey.findProgramAddress(
        [
            walletAddress.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            new solanaWeb3.PublicKey(tokenMint).toBuffer(),
        ],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );

    return address;
}

async function createTokenTransfer(fromPubkey, toPubkey, amount) {
    try {
        const fromTokenAccount = await findAssociatedTokenAddress(
            fromPubkey,
            USDT_MINT
        );
        const toTokenAccount = await findAssociatedTokenAddress(
            new solanaWeb3.PublicKey(toPubkey),
            USDT_MINT
        );

        const transaction = new solanaWeb3.Transaction().add(
            splToken.Token.createTransferInstruction(
                new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
                fromTokenAccount,
                toTokenAccount,
                fromPubkey,
                [],
                amount * Math.pow(10, DECIMALS)
            )
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
        
        connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl(NETWORK)
        );
        
        if (!publicKey) {
            await initSolanaPayment();
        }

        const usdtAmount = amountUSD;

        const transaction = await createTokenTransfer(
            publicKey,
            SHOP_WALLET,
            usdtAmount
        );

        const signedTx = await window.solana.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTx.serialize());

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
        alert('Error en el pago: ' + error.message);
        return false;
    }
}

async function getTokenBalance(tokenAccount) {
    try {
        const balance = await connection.getTokenAccountBalance(tokenAccount);
        return balance.value.uiAmount;
    } catch (error) {
        console.error('Error obteniendo balance de token:', error);
        return 0;
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
        connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl(NETWORK));
        
        const tokenAccount = await findAssociatedTokenAddress(
            publicKey,
            USDT_MINT
        );

        const balance = await getTokenBalance(tokenAccount);
        document.getElementById('wallet-balance').textContent = 
            `${balance.toFixed(2)} USDT`;
    } catch (error) {
        console.error('Error obteniendo balance:', error);
        document.getElementById('wallet-balance').textContent = '0.00 USDT';
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
