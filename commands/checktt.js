// commands/stats.js

const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'checktt',
    description: 'Check message statistics and user interaction percentage',
    usage: '/checktt',
    permissions: ['public'],
    example: '/stats',
    cooldown: 10000, // 10 seconds cooldown
    execute(bot, message, args) {
        const chatId = message.chat.id;
        const messageStatsPath = path.join(__dirname, '../data/messageStats.json');
        const stats = JSON.parse(fs.readFileSync(messageStatsPath, 'utf-8'));

        if (!stats.userMessages[chatId]) {
            bot.sendMessage(chatId, 'Không có dữ liệu thống kê cho cuộc trò chuyện này.');
            return;
        }

        const userMessages = stats.userMessages[chatId];
        const totalUserMessages = Object.values(userMessages).reduce((a, b) => a + b, 0);
        const totalMessages = totalUserMessages; // Tổng số tin nhắn từ người dùng

        const userInteractionPercentage = totalMessages > 0 ? (totalUserMessages / totalMessages) * 100 : 0;

        bot.sendMessage(chatId, `Số lượng tin nhắn của người dùng: ${totalUserMessages}\nTỉ lệ tương tác của người dùng: ${userInteractionPercentage.toFixed(2)}%`);
    }
};