import { app } from 'electron';
import fs from 'fs-extra';

/**
 * Clears all user data.
 * The user data directory is recreated after re-launching the application.
 */
export function clearUserData () {
    const userDataPath = app.getPath('userData');
    fs.removeSync(userDataPath);
    app.relaunch();
    app.exit();
};
