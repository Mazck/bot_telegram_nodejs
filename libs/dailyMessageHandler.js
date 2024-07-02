const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const dailyMessageFilePath = path.join(__dirname, '../data/dailyMessage.json');

// Initialize dailyMessage.json
function initializeDailyMessageFile() {
    if (!fs.existsSync(dailyMessageFilePath)) {
        fs.writeFileSync(dailyMessageFilePath, JSON.stringify([], null, 2));
    }
}

// Function to get daily message data
function getDailyMessageData() {
    try {
        const dailyMessageData = JSON.parse(fs.readFileSync(dailyMessageFilePath, 'utf-8'));
        return dailyMessageData;
    } catch (error) {
        console.error('Error reading dailyMessage.json:', error);
        return [];
    }
}

// Function to save daily message data
function saveDailyMessageData(dailyMessageData) {
    try {
        fs.writeFileSync(dailyMessageFilePath, JSON.stringify(dailyMessageData, null, 2));
    } catch (error) {
        console.error('Error saving dailyMessage.json:', error);
    }
}

// Convert 12-hour format to 24-hour format
function convertTo24HourFormat(time) {
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) {
        hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
        hours = 0;
    }

    return { hours, minutes };
}

// Function to schedule daily messages
function scheduleDailyMessages(bot) {
    const dailyMessages = getDailyMessageData();
    dailyMessages.forEach(({ chatId, time, text }) => {
        const { hours, minutes } = convertTo24HourFormat(time);
        console.log(`Scheduling message for chat ${chatId} at ${hours}:${minutes} with text: "${text}"`);
        const cronTime = `${minutes} ${hours} * * *`; // Cron time format
        cron.schedule(cronTime, () => {
            bot.sendMessage(chatId, text);
        });
    });
}

module.exports = { initializeDailyMessageFile, scheduleDailyMessages, getDailyMessageData, saveDailyMessageData, convertTo24HourFormat };