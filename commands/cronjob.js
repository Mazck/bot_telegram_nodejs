const { getDailyMessageData, saveDailyMessageData, convertTo24HourFormat } = require('../libs/dailyMessageHandler');
const cron = require('node-cron');

module.exports = {
    name: 'schedule',
    description: 'Schedule a daily message',
    usage: '/schedule <time> <message>',
    permissions: ['admin'],
    example: '/schedule 09:00 AM Hello, this is your daily reminder!',
    cooldown: 5000,
    execute(bot, message, args) {
        const chatId = message.chat.id;
        const time = args[0];
        const text = args.slice(1).join(' ');

        if (!time || !text) {
            bot.sendMessage(chatId, 'Usage: /schedule <time> <message>');
            return;
        }

        const { hours, minutes } = convertTo24HourFormat(time);
        const dailyMessages = getDailyMessageData();
        dailyMessages.push({ chatId, time, text });
        saveDailyMessageData(dailyMessages);

        bot.sendMessage(chatId, `Message scheduled at ${hours}:${minutes} with text: "${text}"`);

        const cronTime = `${minutes} ${hours} * * *`; // Cron time format
        cron.schedule(cronTime, () => {
            bot.sendMessage(chatId, text);
        });
    }
};