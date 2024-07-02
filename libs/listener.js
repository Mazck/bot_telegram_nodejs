// libs/listener.js

const fs = require('fs');
const path = require('path');

// Initialize message stats file
const messageStatsPath = path.join(__dirname, '../data/messageStats.json');

if (!fs.existsSync(messageStatsPath)) {
    fs.writeFileSync(messageStatsPath, JSON.stringify({ userMessages: {}, botMessages: {} }, null, 2));
}

// Function to load commands
function loadCommands() {
    const commands = {};
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        commands[command.name] = command;
    }
    return commands;
}

// Function to listen for commands and messages
function listen(bot, commands, checkPermissions) {
    const cooldowns = {};

    bot.onText(/\/(.+)/, (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const commandName = match[1].split(' ')[0].toLowerCase();

        if (commands[commandName]) {
            const command = commands[commandName];

            // Check permissions
            if (!checkPermissions(command.permissions, userId, chatId)) {
                bot.sendMessage(chatId, 'Bạn không có quyền truy cập lệnh này.');
                return;
            }

            // Check cooldown
            if (!cooldowns[userId]) {
                cooldowns[userId] = {};
            }

            const now = Date.now();
            const cooldownTime = command.cooldown || 0; // Default cooldown time in milliseconds

            if (cooldowns[userId][commandName] && now - cooldowns[userId][commandName] < cooldownTime) {
                const timeLeft = (cooldownTime - (now - cooldowns[userId][commandName])) / 1000;
                bot.sendMessage(chatId, `Xin lỗi, bạn cần chờ ${timeLeft.toFixed(1)} giây trước khi sử dụng lệnh này lại.`);
                return;
            }

            // Execute command
            command.execute(bot, msg, match[1].split(' ').slice(1));

            // Update cooldown timestamp
            cooldowns[userId][commandName] = now;
        } else {
            bot.sendMessage(chatId, 'Lệnh không hợp lệ. Vui lòng sử dụng /help để xem danh sách các lệnh có sẵn.');
        }

        // Record user message
        recordMessage('userMessages', userId, chatId);
    });

    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        if (msg.text && !msg.text.startsWith('/')) {
            // Record user message
            recordMessage('userMessages', userId, chatId);
        }

        if (msg.from.is_bot) {
            // Record bot message
            recordMessage('botMessages', userId, chatId);
        }
    });
}

// Function to record messages
function recordMessage(type, userId, chatId) {
    const stats = JSON.parse(fs.readFileSync(messageStatsPath, 'utf-8'));

    if (!stats[type][chatId]) {
        stats[type][chatId] = {};
    }
    if (!stats[type][chatId][userId]) {
        stats[type][chatId][userId] = 0;
    }

    stats[type][chatId][userId]++;

    fs.writeFileSync(messageStatsPath, JSON.stringify(stats, null, 2));
}

module.exports = { loadCommands, listen };