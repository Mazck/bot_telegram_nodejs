// commands/start.js

const cooldownTime = 5000; // 5 seconds cooldown

module.exports = {
    name: 'start',
    description: 'Start command for the bot',
    usage: '/start',
    permissions: ['admin'],
    example: '/start',
    cooldown: cooldownTime,
    execute(bot, message, args) {
        bot.sendMessage(message.chat.id, 'Bot started!');
    }
};