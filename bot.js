const { Markup, Telegraf } =require('telegraf')
const { message } =require('telegraf/filters')
const dotenv =require('dotenv')
const rateLimit =require('telegraf-ratelimit')
const CryptoJS =require('crypto-js')
const path =require('path')
const imageUrl = path.join(__dirname, 'assets', 'ASVSDFFF.png');

dotenv.config();

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
const bot = new Telegraf(TELEGRAM_API_KEY);
const WEBAPP_URL = process.env.WEBAPP_URL;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

const limiter = rateLimit({
  window: 1000, // 1 second
  limit: 3,
  onLimitExceeded: (ctx, next) => ctx.reply('Rate limit exceeded')
});

bot.use(limiter);

function encryptData(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
}

bot.use((ctx, next) => {
  if (ctx.message) {
    console.log(`Received command: ${ctx.message.text}`);
  }
  return next();
});

bot.start((ctx) => {
  try {
    const args = ctx.message.text.split(' ');
    let referralCode = null;

    if (args.length > 1) {
      referralCode = args[1];
    }

    const userId = ctx.from.id;
    const username = ctx.from.username || 'Unknown';
    const first_name = ctx.from.first_name || 'Unknown';

    const dataToEncrypt = {
      user_id: userId,
      username,
      first_name,
      inviter_code: referralCode ? referralCode : '',
    };

    const encryptedData = encryptData(dataToEncrypt);
    const webAppUrlWithParams = `${WEBAPP_URL}?data=${encodeURIComponent(encryptedData)}`;
    
    console.log(webAppUrlWithParams);
    console.log('Referral Code:', referralCode);

    const caption = `
    ⭐️Welcome to GEN Mining,

    We are here to build the largest community to revolutionize gaming payments with cryptocurrency GEN Coin.

    GEN Coin will be released at 2 million members in our community. Till then, here you can mine real money every second. Get free 2 GH/s Hashrate and 5 TRX welcome bonus. Top miners and promoters will be rewarded with free GEN coins. Don’t miss the opportunity to become part of this revolution.

    Tap the start button to become part of the revolution.💰🚀`;
    ctx.replyWithPhoto(
      { source: imageUrl },
      {
        caption: caption,
        ...Markup.inlineKeyboard([
          [
            Markup.button.webApp('Open App', webAppUrlWithParams)        
          ],
          [
            Markup.button.url('ℹ What is GEN?','https://telegra.ph/GEN-COIN-07-18')
          ],
          [
            Markup.button.url('📢 Announcements', 'https://t.me/+v9Qgh0SSd_VhY2U1'),
            Markup.button.url('👥 Community', 'https://t.me/+E5QY8NGDZ9ljMzQ9'),
          ],
          [
            Markup.button.url('🆘 Support', 'https://t.me/gencoinsupport')
          ]
        ])
      }
    );
  } catch (error) {
    console.log('Error in start command:', error);
    ctx.reply('An error occurred. Please try again.');
  }
});

bot.launch();
console.log('Bot started!!');
