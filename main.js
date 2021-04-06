const { app } = require('electron');
const { emptyDirSync } = require('fs-extra');

/**
 * Clears all user data.
 * The user data directory is recreated after re-launching the application.
 */
exports.clearUserData = function() {
    const userDataPath = app.getPath('userData');
    emptyDirSync(userDataPath);
    app.relaunch();
    app.exit();
};
