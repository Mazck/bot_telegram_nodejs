// commands/setadmin.js

const fs = require('fs');

const cooldownTime = 10000; // 10 seconds cooldown

module.exports = {
    name: 'setadmin',
    description: 'Set admin or admin group',
    usage: '/setadmin <admin|admingroup> <id>',
    permissions: ['admin'],
    example: '/setadmin admin 12345\n/setadmin admingroup -12345',
    cooldown: cooldownTime,
    execute(bot, message, args) {
        const chatId = message.chat.id;
        const userId = message.from.id;

        if (args.length < 2) {
            bot.sendMessage(chatId, 'Sử dụng không đúng. Ví dụ: /setadmin <admin|admingroup> <id>');
            return;
        }

        const type = args[0];
        const id = args[1];
        const adminData = JSON.parse(fs.readFileSync('./admins.json', 'utf-8'));

        if (type === 'admin') {
            if (!adminData.admins.includes(id)) {
                adminData.admins.push(id);
                fs.writeFileSync('./admins.json', JSON.stringify(adminData, null, 2));
                bot.sendMessage(chatId, `Đã thêm admin với ID: ${id}`);
                bot.sendMessage(id, `Bạn đã được thêm làm admin bởi người dùng ID: ${userId}`);
            } else {
                bot.sendMessage(chatId, `Admin với ID ${id} đã tồn tại.`);
            }
        } else if (type === 'admingroup') {
            if (!adminData.admin_groups.includes(id)) {
                adminData.admin_groups.push(id);
                fs.writeFileSync('./admins.json', JSON.stringify(adminData, null, 2));
                bot.sendMessage(chatId, `Đã thêm nhóm admin với ID: ${id}`);
                bot.sendMessage(id, `Nhóm của bạn đã được thêm làm nhóm admin bởi người dùng ID: ${userId}`);
            } else {
                bot.sendMessage(chatId, `Nhóm admin với ID ${id} đã tồn tại.`);
            }
        } else {
            bot.sendMessage(chatId, 'Loại không hợp lệ. Sử dụng "admin" hoặc "admingroup".');
        }
    }
};