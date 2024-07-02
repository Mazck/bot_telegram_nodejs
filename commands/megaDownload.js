const { downloadFromMega, sendFilesToChat } = require('../libs/megaDownloader');

let locked = false;

function lock() {
    locked = true;
}

function unlock() {
    locked = false;
}

function sLocked() {
    return locked;
}

module.exports = {
    name: 'downloadmega',
    description: 'Tải xuống tất cả các tệp từ một thư mục Mega.nz.',
    usage: '/downloadmega <Mega.nz URL>',
    permissions: ['admin'],
    example: '/downloadmega https://mega.nz/folder/1IJQkDqJ#_La1JCRlnurFr4Ny0ko8Ww',
    async execute(bot, message, args) {
        if (args.length !== 1) {
            bot.sendMessage(message.chat.id, 'Sử dụng lệnh sai cú pháp. Vui lòng nhập lại theo định dạng /downloadmega <Mega.nz URL>.');
            return;
        }

        if (sLocked()) {
            bot.sendMessage(message.chat.id, 'Lệnh hiện đang được thực thi. Vui lòng chờ lệnh trước hoàn tất.');
            return;
        }

        lock();

        const url = args[0];
        try {
            bot.sendMessage(message.chat.id, 'Đang tải xuống các tệp từ Mega.nz...');
            const files = await downloadFromMega(url);
            bot.sendMessage(message.chat.id, 'Tải xuống thành công. Đang gửi các tệp lên nhóm...');
            await sendFilesToChat(bot, message.chat.id, files);
            bot.sendMessage(message.chat.id, 'Gửi các tệp thành công và đã xóa các tệp cục bộ.');
        } catch (error) {
            console.log(error.message)
            bot.sendMessage(message.chat.id, `Lỗi khi tải xuống: ${error.message}`);
        } finally {
            unlock();
        }
    }
};