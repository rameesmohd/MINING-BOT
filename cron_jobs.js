const cron = require('node-cron');
const { notifyTransactions,sendClaimMessage } = require('./controller/transactionAutomater');

const randomNotify = async () => {
    const rand = Math.random();
    if (rand < 0.5) {
        await notifyTransactions({ type: 'withdraw', wallet:'usdt' });
    } else {
        await notifyTransactions({ type: 'deposit', wallet: 'usdt' });
    }
};

function scheduleRandomInvocations() {
    const numberOfInvocations = Math.floor(Math.random() * 5) + 2; 
    const scheduledTimes = new Set();

    for (let i = 0; i < numberOfInvocations; i++) {
        let randomMinute;

        do {
            randomMinute = Math.floor(Math.random() * 60);
        } while (scheduledTimes.has(randomMinute));
        
        scheduledTimes.add(randomMinute);

        const randomMilliseconds = randomMinute * 60 * 1000; // Convert minutes to milliseconds

        setTimeout(() => {
            sendClaimMessage();
        }, randomMilliseconds);
    }

    // console.log(`Scheduled ${numberOfInvocations} random invocations this hour at minutes: ${[...scheduledTimes].join(', ')}`);
}

cron.schedule('0 * * * *', async () => {
    console.log('Scheduling random task within the hour...');
    scheduleRandomInvocations();
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


