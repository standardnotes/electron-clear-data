import { app } from 'electron';
import { emptyDirSync } from 'fs-extra';

/**
 * Clears all user data.
 * The user data directory is recreated after re-launching the application.
 */
export function clearUserData () {
    const userDataPath = app.getPath('userData');
    emptyDirSync(userDataPath);
    app.relaunch();
    app.exit();
};
