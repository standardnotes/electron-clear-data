import { app } from 'electron';
import fs from 'fs-extra';
import { join } from 'path';

/**
 * Clears all user data.
 * The user data directory is recreated by Electron automatically.
 */
export const clearUserData = () => {
    const userDataPath = app.getPath('userData');
    fs.unlink(userDataPath);
};

/**
 * Clears all app data.
 * The app data directory is recreated by Electron automatically.
 */
export const clearAppData = () => {
    const appName = app.getName();
    const basePath = app.getPath('appData');
    const appDataPath = join(basePath, appName);
    fs.unlink(appDataPath);
};
