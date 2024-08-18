const cron = require('node-cron');
const { notifyTransactions } = require('./controller/transactionAutomater');

const randomNotify = async () => {
    const rand = Math.random();
    if (rand < 0.5) {
        await notifyTransactions({ type: 'withdraw', wallet:'usdt' });
    } else {
        await notifyTransactions({ type: 'deposit', wallet: 'usdt' });
    }
};

cron.schedule('0 * * * *', async () => {
    console.log('Scheduling random task within the hour...');
    
    const randomMinutes = Math.floor(Math.random() * 60);
    const randomMilliseconds = randomMinutes * 60 * 1000; 
    
    setTimeout(async () => {
        await randomNotify();
    }, randomMilliseconds);
});

cron.schedule('0 */3 * * *', async () => {
    const randomMinutes = Math.floor(Math.random() * 60);
    const randomMilliseconds = randomMinutes * 60 * 1000; 
    
    setTimeout(async () => {
        await notifyTransactions({ type: 'withdraw', wallet: 'trx' });
    }, randomMilliseconds);
});

module.exports ={
    randomNotify
}


