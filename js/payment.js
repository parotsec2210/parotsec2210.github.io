// Midtrans Configuration
// Ganti dengan Server Key dan Client Key kamu
const MIDTRANS_CLIENT_KEY = 'YOUR_MIDTRANS_CLIENT_KEY';
const MIDTRANS_SERVER_KEY = 'YOUR_MIDTRANS_SERVER_KEY';
const IS_PRODUCTION = false; // false = sandbox, true = production

// Payment Methods
const paymentMethods = [
    { name: 'Dana', code: 'dana', icon: 'assets/icons/dana.png' },
    { name: 'GoPay', code: 'gopay', icon: 'assets/icons/gopay.png' },
    { name: 'QRIS', code: 'qris', icon: 'assets/icons/qris.png' },
    { name: 'BCA Transfer', code: 'bca', icon: 'assets/icons/bca.png' },
    { name: 'BRI Transfer', code: 'bri', icon: 'assets/icons/bri.png' },
    { name: 'BNI Transfer', code: 'bni', icon: 'assets/icons/bni.png' },
    { name: 'SeaBank', code: 'seabank', icon: 'assets/icons/seabank.png' },
    { name: 'ShopeePay', code: 'shopeepay', icon: 'assets/icons/shopeepay.png' },
    { name: 'Isi Pulsa', code: 'telkomsel', icon: 'assets/icons/pulsa.png' }
];

// Load Midtrans Snap
function loadMidtransScript() {
    return new Promise((resolve, reject) => {
        if (window.snap) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = IS_PRODUCTION 
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Create Payment Transaction
async function createPaymentTransaction(amount, paymentMethod, user, orderId) {
    // Ini akan diproses melalui backend
    // Untuk demo, kita akan menggunakan Snap langsung
    
    const transactionData = {
        transaction_details: {
            order_id: orderId,
            gross_amount: amount
        },
        credit_card: {
            secure: true
        },
        customer_details: {
            first_name: user.displayName || user.email.split('@')[0],
            email: user.email,
            phone: '08123456789'
        },
        item_details: [
            {
                id: 'ITEM1',
                price: amount,
                quantity: 1,
                name: 'Payment Transaction'
            }
        ]
    };
    
    // Untuk payment method tertentu
    if (paymentMethod === 'dana') {
        transactionData.payment_type = 'dana';
        transactionData.dana = { success_redirect_url: window.location.origin + '/payment-success.html' };
    } else if (paymentMethod === 'gopay') {
        transactionData.payment_type = 'gopay';
        transactionData.gopay = { enable_callback: true, callback_url: window.location.origin + '/payment-success.html' };
    } else if (paymentMethod === 'qris') {
        transactionData.payment_type = 'qris';
        transactionData.qris = { acquirer: 'gopay' };
    } else if (['bca', 'bri', 'bni', 'seabank'].includes(paymentMethod)) {
        transactionData.payment_type = 'bank_transfer';
        transactionData.bank_transfer = { bank: paymentMethod };
    } else if (paymentMethod === 'shopeepay') {
        transactionData.payment_type = 'shopeepay';
    } else if (paymentMethod === 'telkomsel') {
        transactionData.payment_type = 'telkomsel_cash';
    }
    
    return transactionData;
}

// Show QR Code for QRIS
function showQRCode(qrString) {
    const qrContainer = document.getElementById('qrCodeContainer');
    if (qrContainer) {
        // Generate QR Code menggunakan library
        qrContainer.innerHTML = '';
        const qrcode = new QRCode(qrContainer, {
            text: qrString,
            width: 200,
            height: 200
        });
    }
}

// Process Payment with Snap
async function processPayment(amount, paymentMethod, user) {
    showToast('Processing payment...', 'info');
    
    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    try {
        await loadMidtransScript();
        
        // Untuk production, sebaiknya buat transaction via backend
        // Demo ini menggunakan Snap langsung untuk kemudahan
        
        const transactionData = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount
            },
            customer_details: {
                first_name: user.displayName || user.email.split('@')[0],
                email: user.email,
                phone: '08123456789'
            },
            item_details: [
                {
                    id: 'PAYMENT_' + Date.now(),
                    price: amount,
                    quantity: 1,
                    name: `Payment via ${paymentMethod}`
                }
            ]
        };
        
        // Untuk demo, kita akan menggunakan Snap embed
        // Di production, kamu perlu memanggil API backend untuk mendapatkan token
        
        showToast('Please complete payment in popup', 'success');
        
        // Simulasi pembayaran berhasil
        setTimeout(() => {
            showToast(`Payment of Rp ${formatRupiah(amount)} successful via ${paymentMethod}!`, 'success');
            saveTransaction({
                orderId: orderId,
                amount: amount,
                paymentMethod: paymentMethod,
                status: 'success',
                timestamp: new Date().toISOString(),
                userEmail: user.email
            });
            window.location.href = 'payment-success.html';
        }, 2000);
        
    } catch (error) {
        console.error('Payment Error:', error);
        showToast('Payment failed: ' + error.message, 'error');
    }
}

// Format Rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Save Transaction to Local Storage
function saveTransaction(transaction) {
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = type === 'success' ? 'var(--success)' : 'var(--error)';
    toast.innerHTML = `
        <strong>${type === 'success' ? '✓' : '✗'}</strong> 
        ${message}
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}