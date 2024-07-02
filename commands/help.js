// commands/help.js

const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'help',
    description: 'Hiển thị thông tin về các lệnh có sẵn.',
    usage: '/help',
    permissions: ['public'],
    example: '/help',
    execute(bot, message, args) {
        const commandsDir = path.join(__dirname, '../commands');
        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

        let helpMessage = 'Danh sách các lệnh có sẵn:\n\n';

        for (const file of commandFiles) {
            const command = require(path.join(commandsDir, file));

            helpMessage += `Lệnh: ${command.name}\n`;
            helpMessage += `Miêu tả: ${command.description}\n`;
            helpMessage += `Sử dụng: ${command.usage}\n`;
            helpMessage += `Ví dụ: ${command.example}\n\n`;
        }

        bot.sendMessage(message.chat.id, helpMessage);
    }
};