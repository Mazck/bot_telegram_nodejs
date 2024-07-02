// libs/warnHandler.js

const fs = require('fs');
const path = require('path');

const warnFilePath = path.join(__dirname, '../data/warn.json');

// Initialize warn.json
function initializeWarnFile() {
    if (!fs.existsSync(warnFilePath)) {
        fs.writeFileSync(warnFilePath, JSON.stringify({}, null, 2));
    }
}

// Function to get warn data
function getWarnData() {
    try {
        const warnData = JSON.parse(fs.readFileSync(warnFilePath, 'utf-8'));
        return warnData;
    } catch (error) {
        console.error('Error reading warn.json:', error);
        return {};
    }
}

// Function to save warn data
function saveWarnData(warnData) {
    try {
        fs.writeFileSync(warnFilePath, JSON.stringify(warnData, null, 2));
    } catch (error) {
        console.error('Error saving warn.json:', error);
    }
}

module.exports = { initializeWarnFile, getWarnData, saveWarnData };