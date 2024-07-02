const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const { loadCommands, listen } = require('./libs/listener');
const { checkPermissions } = require('./libs/permissions');
const { initializeDailyMessageFile, scheduleDailyMessages } = require('./libs/dailyMessageHandler');

dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Initialize files
initializeDailyMessageFile();

// Load commands
const commands = loadCommands();

// Schedule existing daily messages
scheduleDailyMessages(bot);

// Listen for commands
listen(bot, commands, checkPermissions);
bot.on("message", (msg) => console.log(msg));

console.log('Bot is running...');