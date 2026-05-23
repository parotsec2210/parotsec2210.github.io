// Telegram Configuration
// Ganti dengan Bot Token dan Chat ID kamu
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID_HERE';

async function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const formData = new URLSearchParams();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('text', message);
    formData.append('parse_mode', 'HTML');
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        return response.ok;
    } catch (error) {
        console.error('Telegram Error:', error);
        return false;
    }
}

async function sendUserLoginNotification(user) {
    const message = `
🚨 <b>NEW USER LOGIN</b> 🚨

👤 <b>Name:</b> ${user.displayName || 'No Name'}
📧 <b>Email:</b> ${user.email}
🕐 <b>Time:</b> ${new Date().toLocaleString('id-ID')}
📱 <b>Device:</b> ${navigator.userAgent}
🌐 <b>Browser:</b> ${navigator.platform}
    `;
    
    await sendTelegramMessage(message);
}