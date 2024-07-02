// commands/warnManager.js

const fs = require('fs');
const path = require('path');
const { getWarnData, saveWarnData } = require('../libs/warnHandler');

const warnFilePath = path.join(__dirname, '../data/warn.json');
const MAX_WARNINGS = 3; // Maximum warnings before kicking user

module.exports = {
    name: 'warn',
    description: 'Quản lý cảnh báo người dùng và danh sách cảnh báo.',
    usage: '/warn <list | warn | reset> [user_id]',
    permissions: ['admin'],
    example_list: '/warn list',
    example_warn: '/warn warn 123456',
    example_reset: '/warn reset',
    execute(bot, message, args) {
        if (args.length === 0) {
            bot.sendMessage(message.chat.id, 'Sử dụng lệnh sai cú pháp. Vui lòng nhập lại.');
            return;
        }

        const command = args[0].toLowerCase();
        const userId = args[1]; // Optional user ID

        switch (command) {
            case 'list':
                this.list(bot, message);
                break;
            case 'warn':
                this.warn(bot, message, userId);
                break;
            case 'reset':
                this.reset(bot, message);
                break;
            default:
                bot.sendMessage(message.chat.id, 'Lệnh không hợp lệ. Vui lòng sử dụng list, warn hoặc reset.');
                break;
        }
    },
    list(bot, message) {
        try {
            const warnData = getWarnData();
            let response = 'Danh sách người dùng đã bị cảnh báo và số lần cảnh báo:\n';

            if (Object.keys(warnData).length === 0) {
                response += 'Không có người dùng nào đã bị cảnh báo.';
            } else {
                for (const userId in warnData) {
                    response += `User ID: ${userId} - Số lần cảnh báo: ${warnData[userId]}\n`;
                }
            }

            bot.sendMessage(message.chat.id, response);
        } catch (error) {
            console.error('Error reading warn.json:', error);
            bot.sendMessage(message.chat.id, 'Đã xảy ra lỗi khi đọc danh sách cảnh báo.');
        }
    },
    warn(bot, message, userId) {
        if (!userId) {
            bot.sendMessage(message.chat.id, 'Vui lòng cung cấp user ID để cảnh báo.');
            return;
        }

        try {
            let warnData = getWarnData();

            if (!warnData[userId]) {
                warnData[userId] = 0;
            }

            warnData[userId]++;

            saveWarnData(warnData);

            if (warnData[userId] >= MAX_WARNINGS) {
                // Perform kick action
                bot.kickChatMember(message.chat.id, userId)
                    .then(() => {
                        bot.sendMessage(message.chat.id, `Người dùng với ID ${userId} đã bị kick khỏi nhóm do đạt ${MAX_WARNINGS} lần cảnh báo.`);
                        delete warnData[userId]; // Remove user from warn list after kick
                        saveWarnData(warnData);
                    })
                    .catch((error) => {
                        console.error('Error kicking member:', error);
                        bot.sendMessage(message.chat.id, 'Đã xảy ra lỗi khi thực hiện kick thành viên.');
                    });
            } else {
                bot.sendMessage(message.chat.id, `Người dùng với ID ${userId} đã được cảnh báo. Số lần cảnh báo: ${warnData[userId]}`);
            }
        } catch (error) {
            console.error('Error updating warn.json:', error);
            bot.sendMessage(message.chat.id, 'Đã xảy ra lỗi khi cập nhật dữ liệu cảnh báo.');
        }
    },
    reset(bot, message) {
        try {
            fs.writeFileSync(warnFilePath, JSON.stringify({}, null, 2));
            bot.sendMessage(message.chat.id, 'Đã xóa toàn bộ dữ liệu cảnh báo.');
        } catch (error) {
            console.error('Error resetting warn.json:', error);
            bot.sendMessage(message.chat.id, 'Đã xảy ra lỗi khi xóa dữ liệu cảnh báo.');
        }
    }
};