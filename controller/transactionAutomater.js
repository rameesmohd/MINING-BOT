const botToken = process.env.BOT_API;
const channelId = process.env.CHANNEL_ID
const TRC20_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const axios = require('axios');

const escapeMarkdownV2 = (text) => {
    text = String(text);
    return text.replace(/([_*[\]()~`>#+\-={}|.!\\])/g, '\\$1');
};
  
const formatTxid = (txid) => {
      if (txid.length <= 8) {
      return txid; 
      }
      const firstFour = txid.substring(0, 4);
      const lastFour = txid.substring(txid.length - 4);
      return `${firstFour}...${lastFour}`;
};
      
const sendWithdrawMessage = async ({user,amount,wallet,transaction}) => {
      const fName =user.length > 3 ? `${user.substring(0, 3)}...` : user
      const escapedFName = escapeMarkdownV2(fName);
      const nAmount = parseFloat(amount).toFixed(2).toString().replace(/\./g, '\\.');
      const coin = wallet=='main' ? 'USDT' : wallet=='second' ? 'TRX' : 'GEN'
  
      let explorerUrl
      let formattedTxid
  
      if(transaction!=null){
          explorerUrl = `https://tronscan.org/#/transaction/${transaction}`;
          formattedTxid = formatTxid(transaction);
          formattedTxid = escapeMarkdownV2(formattedTxid)
      }
  
      const caption =`*✅New Successful ${coin} Withdrawal:*\n\n💰Amount: ${nAmount} ${coin}\n👨‍💻User: ${escapedFName}\n🔗TxId:${transaction!=null ? `[${formattedTxid}](${explorerUrl})` : `${formattedTxid}`}`;
  
      const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      
      const params = {
        chat_id: channelId,
        photo: 'https://res.cloudinary.com/dee3eurcm/image/upload/v1721848888/ykajigg8xlq0tqkct7ad.png',
        caption: caption, 
        parse_mode: 'MarkdownV2',
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: 'Open App',
                url: 't.me/genblockminerbot',
              }
            ],
            [
              {
                text: 'Open Channel',
                url: 't.me/+v9Qgh0SSd_VhY2U1',
              }
            ]
          ],
        }),
      };
    
      try {
        const response = await axios.post(url, params);
        // console.log('Photo sent successfully:', response.data);
      } catch (error) {
        console.error('Error sending photo:', error.response ? error.response.data : error.message);
      }
      return true
  }
  
const sendDepositMessage = async ({user,amount,transaction,hash}) => {
    if(!user|| !amount || !transaction || !hash){
        return false
    }
      const fName =user.length > 3 ? `${user.substring(0, 3)}...` : user
      const escapedFName = escapeMarkdownV2(fName);
      const nAmount = parseFloat(amount).toFixed(2).toString().replace(/\./g, '\\.');
      const escapedHash = escapeMarkdownV2(hash)
      let explorerUrl
      let formattedTxid
  
      if(transaction!=null){
          explorerUrl = `https://tronscan.org/#/transaction/${transaction}`;
          formattedTxid = formatTxid(transaction);
          formattedTxid = escapeMarkdownV2(formattedTxid)
      }
  
      const caption =`*✅ New Power Upgrade:*\n\n💰Amount: ${nAmount} USDT\n👨‍💻User: ${escapedFName}\n⚡Hash: ${escapedHash}\n🔗TxId:${transaction!=null ? `[${formattedTxid}](${explorerUrl})` : `${formattedTxid}`}`;
  
      const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      
      const params = {
        chat_id: channelId,
        photo: 'https://res.cloudinary.com/dee3eurcm/image/upload/v1721848889/mfpnmwmmr62bg0exl7id.png',
        caption: caption, 
        parse_mode: 'MarkdownV2',
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: 'Open App',
                url: 't.me/genblockminerbot',
              }
            ],
            [
              {
                text: 'Open Channel',
                url: 't.me/+v9Qgh0SSd_VhY2U1',
              }
            ]
          ],
        }),
      };
    
      try {
        const response = await axios.post(url, params);
        console.log('Photo sent successfully:', response.data);
      } catch (error) {
        console.error('Error sending photo:', error.response ? error.response.data : error.message);
      }
      return true
}

const fetchTrxTransactions = async()=> {
    try {
        const response = await axios.get(`https://api.tronscan.org/api/transaction?sort=-timestamp&limit=50&start=0`);
        const transactions = response.data.data;
        console.log(`Total transactions fetched: ${transactions.length}`);

        if (!transactions || transactions.length === 0) {
            console.log('No transactions found');
            return [];
        }
        
        const filteredTransactions = transactions.filter(tx => {
            const amount = parseFloat(tx.amount) / 1e6; 
            const isWalletToWallet = !tx.contract_address;
            return isWalletToWallet && amount >= 19 && amount <= 50;
        });

        if (!filteredTransactions || filteredTransactions.length === 0) {
            console.log('No filteredTransactions found');
            return [];
        }

        return filteredTransactions;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

const fetchDepUsdtTransactions = async()=> {
    try {
        const response = await axios.get(`https://api.tronscan.org/api/token_trc20/transfers?limit=50&start=0&contract_address=${TRC20_CONTRACT}`);
        
        const transactions = response.data.token_transfers || []; 
        
        if (!transactions || transactions.length === 0) {
            console.log('No transactions found');
            return [];
        }
        console.log(transactions.length);
        
        const isContractAddress = async (address) => {
          try {
              const contractCheckResponse = await axios.get(`https://api.tronscan.org/api/account?address=${address}`);
              return contractCheckResponse.data.isContract;
          } catch (error) {
              console.error(`Error checking address ${address}:`, error);
              return false;
          }
        };
        
        const filteredTransactions = [];
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        for (const tx of transactions) {
            const amount = parseFloat(tx.quant) / 1e6;
            if (amount >= 30 && amount <= 200) {
                const fromIsContract = await isContractAddress(tx.from_address);
                await delay(1000);
                const toIsContract = await isContractAddress(tx.to_address);
                if (!fromIsContract && !toIsContract) {
                    filteredTransactions.push(tx);
                }
            }
            await delay(2000);
        }
                
        return filteredTransactions;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

const fetchUsdtTransactions = async()=> {
    try {
        const response = await axios.get(`https://api.tronscan.org/api/token_trc20/transfers?limit=50&start=0&contract_address=${TRC20_CONTRACT}`);
        
        const transactions = response.data.token_transfers || []; 
        
        if (!transactions || transactions.length === 0) {
            console.log('No transactions found');
            return [];
        }
        console.log(transactions.length);
        
        const isContractAddress = async (address) => {
          try {
              const contractCheckResponse = await axios.get(`https://api.tronscan.org/api/account?address=${address}`);
              return contractCheckResponse.data.isContract;
          } catch (error) {
              console.error(`Error checking address ${address}:`, error);
              return false;
          }
        };
        
        const filteredTransactions = [];
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        for (const tx of transactions) {
            const amount = parseFloat(tx.quant) / 1e6;
            if (amount >= 18 && amount <= 100) {
                const fromIsContract = await isContractAddress(tx.from_address);
                await delay(2000);
                const toIsContract = await isContractAddress(tx.to_address);
                if (!fromIsContract && !toIsContract) {
                    filteredTransactions.push(tx);
                }
            }
            await delay(2000);
        }
        
        return filteredTransactions;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

const names = {
      en: [
        'Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Hannah', 'Ivy', 'Jack', 'Katherine', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quincy', 'Rachel', 'Sophia', 'Thomas',
        'Ursula', 'Victor', 'Wendy', 'Xander', 'Yara', 'Zachary', 'Aiden', 'Bella', 'Carter', 'Daisy', 'Ethan', 'Fiona', 'George', 'Harper', 'Isaac', 'Jasmine', 'Kevin', 'Luna', 'Mason', 'Nora',
        'Oscar', 'Peyton', 'Quinn', 'Ryan', 'Samantha', 'Tyler', 'Ulysses', 'Violet', 'Willow', 'Xena', 'Yvonne', 'Zane', 'Aaron', 'Brenda', 'Colin', 'Diana', 'Elena', 'Felix', 'Gabriel', 'Hazel',
        'Ian', 'Julia', 'Kyle', 'Leah', 'Miles', 'Natalie', 'Owen', 'Penelope', 'Reed', 'Stella', 'Troy', 'Umar', 'Vanessa', 'Walter', 'Xavier', 'Yvette', 'Zara', 'Austin', 'Brooke', 'Caleb', 'Delilah',
        'Ella', 'Finn', 'Gemma', 'Henry', 'Isla', 'Jake', 'Kira', 'Logan', 'Madeline', 'Nate', 'Olga', 'Patrick', 'Rosie', 'Sawyer', 'Theo', 'Uma', 'Vincent', 'Wyatt', 'Ximena', 'Yasmin', 'Zeke'
    ],
    ru: [
        'Алексей', 'Ирина', 'Дмитрий', 'Мария', 'Сергей', 'Елена', 'Ольга', 'Андрей', 'Наталья', 'Михаил', 'Татьяна', 'Александр', 'Екатерина', 'Павел', 'Анастасия', 'Виктор', 'Юлия', 'Роман', 'Светлана', 'Владимир',
        'Марина', 'Иван', 'Олеся', 'Денис', 'Людмила', 'Кирилл', 'Евгения', 'Юрий', 'Лариса', 'Георгий', 'Нина', 'Артем', 'София', 'Станислав', 'Валентина', 'Ярослав', 'Наталья', 'Александра', 'Борис', 'Евгений', 'Семен',
        'Ирина', 'Петр', 'Ольга', 'Тимофей', 'Наталья', 'Денис', 'Яна', 'Сергей', 'Светлана', 'Екатерина'
    ],
    ar: [
        'أحمد', 'فاطمة', 'علي', 'سارة', 'محمد', 'ريم', 'عائشة', 'حسن', 'ليلى', 'يوسف', 'نور', 'خالد', 'زهراء', 'عمر', 'منى', 'محمود', 'سلمى', 'سعيد', 'جمال', 'هند',
        'سعيد', 'رانيا', 'بدر', 'مروان', 'أمينة', 'حسن', 'سماح', 'جهاد', 'عبير', 'آية', 'حسام', 'سيد', 'هالة', 'علياء', 'سيد', 'سمر', 'ماجد', 'نور', 'فتحي', 'جميلة', 'أحمد',
        'محمد', 'سحر', 'علي', 'أميمة', 'شريف', 'نجلاء', 'أحمد', 'زينة', 'غادة', 'عادل', 'سيدة', 'حسين'
    ]
};

function getRandomName(lang) {
    const languageNames = names[lang] || names.en;
    
    if (lang === 'en') {
        const weightedNames = [...languageNames, ...languageNames, ...languageNames]; 
        return weightedNames[Math.floor(Math.random() * weightedNames.length)];
    }
    
    return languageNames[Math.floor(Math.random() * languageNames.length)];
}

const notifyTransactions = async({type,wallet})=> {
    const lang = Math.random() < 0.8 ? 'en' : ['ru', 'ar'][Math.floor(Math.random() * 2)]; 
    const userName = getRandomName(lang);
    try {
        if(type == 'withdraw'){
            if(wallet=='usdt'){
                const transactions = await fetchUsdtTransactions();
                if (transactions.length === 0) {
                    console.log('No transactions in the specified range.');
                    return;
                }
                const targetTransaction = transactions.find(tx => {
                    const amount = parseFloat(tx.quant) / 1e6;
                    return amount >= 20 && amount <= 30;
                });
                
                const selectedTransaction = targetTransaction || transactions[0];
                const amount = parseFloat(selectedTransaction.quant) / 1e6;
                
                console.log( 'target withdraw transaction :',selectedTransaction );
                if(selectedTransaction == null){
                    return;
                }

                await sendWithdrawMessage({
                    user: userName,
                    amount: amount + 3,
                    wallet: 'main',
                    transaction: selectedTransaction.transaction_id
                });
            }
            if(wallet == 'trx'){
                const transactions = await fetchTrxTransactions();
                if (transactions.length === 0) {
                    console.log('No transactions in the specified range.');
                    return;
                }
                const tx = transactions[0]
                const amount = parseFloat(tx.amount) / 1e6;
                await sendWithdrawMessage({user:userName,amount:amount+2,wallet:'second',transaction:tx.hash})
        }
        }
        if (type == 'deposit') {
        const maxRetries = 4;
        const retryInterval = 30 * 1000; 
    
        let attempt = 0;
        let tx = null;
        let transactions;    
        while (attempt <= maxRetries) {
            transactions = await fetchDepUsdtTransactions();
    
            if (transactions.length === 0) {
                console.log('No transactions in the specified range.');
                return;
            }
    
            tx = transactions.find(transaction => {
                const amount = parseFloat(transaction.quant) / 1e6;
                return amount % 5 === 0;
            });
    
            if (tx) {
                break; 
            }
    
            if (attempt < maxRetries) {
                console.log(`No suitable transaction found, retrying in 1 minute... (${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryInterval));
            }
    
            attempt++;
        }

        if(transactions.length === 0){
            return;
        }
        
        if (!tx) {
            tx = transactions[0];
        }
    
        const amount = parseFloat(tx.quant) / 1e6;
    
        await sendDepositMessage({
            user: userName,
            amount: amount,
            transaction: tx.transaction_id,
            hash: parseFloat(amount / 2.5).toFixed(2)
        });
        }
    } catch (error) {
        console.error('Unexpected error in notifyTransactions function:', error);
    }
}

module.exports = {
    notifyTransactions
}