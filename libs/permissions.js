// libs/permissions.js

const fs = require('fs');

// Load admin data from JSON
let adminData;
try {
    adminData = JSON.parse(fs.readFileSync('./admins.json', 'utf-8'));
} catch (error) {
    adminData = { admins: [], admin_groups: [] };
    fs.writeFileSync('./admins.json', JSON.stringify(adminData, null, 2));
}

// Function to check if user is admin or in admin group
function isAdmin(userId) {
    return adminData.admins.includes(userId.toString());
}

function isAdminGroup(chatId) {
    return adminData.admin_groups.includes(chatId.toString());
}

// Function to check permissions
function checkPermissions(permissions, userId, chatId) {
    if (!permissions || permissions.includes('public')) {
        return true; // Public command
    }

    // Admin-only commands
    if (permissions.includes('admin') && isAdmin(userId)) {
        return true;
    }

    // Admin group-only commands
    if (permissions.includes('admin_group') && isAdminGroup(chatId)) {
        return true;
    }

    return false;
}

module.exports = { checkPermissions, isAdmin, isAdminGroup, adminData };