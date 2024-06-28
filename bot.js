import { Markup, Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY
const bot = new Telegraf(TELEGRAM_API_KEY)
const WEBAPP_URL = process.env.WEBAPP_URL
const SECRET_KEY=process.env.SECRET_KEY

//https://t.me/your_bot_username?start=referral_code


bot.start((ctx) => {
  const args = ctx.message.text.split(' ');
  let referralCode = null;

  if (args.length > 1) {
      referralCode = args[1];
  }

  console.log('Referral Code:', referralCode);

    ctx.reply(
      `Welcome ramees${referralCode ? ` (Referred by ${referralCode})` : ''}`,
      Markup.inlineKeyboard([
        Markup.button.callback('Start App',  `start_app${referralCode ? `_${referralCode}` : ''}`),
        Markup.button.callback('Readme', 'readme'),
        Markup.button.callback('News', 'news'),
        Markup.button.callback('Chat', 'chat')
      ])
    );
  });
  
  bot.action(/start_app_(.+)/, (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || 'Unknown'; // Handle missing username
    const first_name = ctx.from.first_name || 'Unknown'; // Handle missing first name
    const referralCode = ctx.match[1] ? ctx.match[1].substring(1) : null; // Extract referral code

    const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: '1h' });

    console.log(ctx.from);
    console.log(userId , username)
    console.log('User ID:', userId, 'Username:', username,'first_name : ', first_name, 'Referral Code:', referralCode);

    // {
    //     id: 876993861,
    //     is_bot: false,
    //     first_name: 'matt',
    //     username: 'matt_fm',
    //     language_code: 'en'
    //   }

    const webAppUrlWithParams=`${WEBAPP_URL}?user_id=${userId}&username=${username}&first_name=${first_name}&referral_code=${referralCode}?token=${token}`;
    console.log(webAppUrlWithParams);
    ctx.reply(
        'Launching the app...',
        Markup.inlineKeyboard([
            Markup.button.webApp('Open App', webAppUrlWithParams)
        ])
    );
});
  
bot.action('readme', (ctx) => {
ctx.reply('Here is the readme...');
// Add your logic for showing the readme
});

bot.action('news', (ctx) => {
ctx.reply('Here are the latest news...');
// Add your logic for showing the news
});

bot.action('chat', (ctx) => {
ctx.reply('Starting the chat...');
// Add your logic for starting the chat
});
  
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()