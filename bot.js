const { Markup, Telegraf } =require('telegraf')
const { message } =require('telegraf/filters')
const dotenv =require('dotenv')
const rateLimit =require('telegraf-ratelimit')
const winston =require('winston')
const CryptoJS =require('crypto-js')
const path =require('path')
const imageUrl = path.join(__dirname, 'assets', 'cryptocurrency-mining.png');

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

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

bot.use(limiter);

function encryptData(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
}

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
    // const referralCode = ctx.match[2] ? ctx.match[2] : null;

    logger.info(ctx.from);
    logger.info(`User ID: ${userId}, Username: ${username}, First Name: ${first_name}, Referral Code: ${referralCode}`);

    const dataToEncrypt = {
      user_id: userId,
      username,
      first_name,
      inviter_code: referralCode ? referralCode : '',
    };
    console.log(dataToEncrypt,'dataToEncrypt');
    const encryptedData = encryptData(dataToEncrypt);
    const webAppUrlWithParams = `${WEBAPP_URL}?data=${encodeURIComponent(encryptedData)}`;
    logger.info(webAppUrlWithParams);
    console.log(webAppUrlWithParams);

    console.log('Referral Code:', referralCode);
    console.log(Markup.button);

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
            Markup.button.callback('ℹ How it works?', 'about')
          ],
          [
            Markup.button.url('📢 Announcements', 'https://t.me/+v9Qgh0SSd_VhY2U1'),
            Markup.button.url('👥 Community', 'https://t.me/+E5QY8NGDZ9ljMzQ9'),
          ],
          [
            Markup.button.switchToChat('🆘  Support', 'https://t.me/nmk122')
          ]
        ])
      }
    );
  } catch (error) {
    logger.error('Error in start command:', error);
    ctx.reply('An error occurred. Please try again.');
  }
});

bot.action('about', (ctx) => {
  try {
    ctx.reply('Here is the readme...');
    // Add your logic for showing the readme
  } catch (error) {
    logger.error('Error in readme action:', error);
    ctx.reply('An error occurred. Please try again.');
  }
});

bot.action('news', (ctx) => {
  try {
    ctx.reply('Here are the latest news...');
    // Add your logic for showing the news
  } catch (error) {
    logger.error('Error in news action:', error);
    ctx.reply('An error occurred. Please try again.');
  }
});

bot.action('chat', (ctx) => {
  try {
    ctx.reply('Starting the chat...');
    // Add your logic for starting the chat
  } catch (error) {
    logger.error('Error in chat action:', error);
    ctx.reply('An error occurred. Please try again.');
  }
});

bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on(message('sticker'), (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.launch();
console.log('Bot started!!');
