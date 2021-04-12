import { app } from 'electron';
import { emptyDirSync } from 'fs-extra';
import path from 'path';

const relaunchApp = () => {
  app.relaunch();
  app.exit();
};

/**
 * Removes the contents of the user data directory.
 * This directory is then recreated after re-launching the application.
 */
export function clearUserDataDirectory(): void {
  const userDataPath = app.getPath('userData');
  emptyDirSync(userDataPath);
  relaunchApp();
};

/**
 * Removes directories containing leveldb databases.
 * Each directory is reinitialized after re-launching the application.
 */
export function clearSensitiveDirectories(): void {
  const userDataPath = app.getPath('userData');
  /**
   * A list of directories that contain leveldb databases.
   * All data is wiped along the *.log and *.ldb files.
   */
  const directoriesToRemove = [
    'Local Storage',
    'IndexedDB',
    'Session Storage'
  ];
  directoriesToRemove.forEach((item) => {
    const removeDirectory = path.join(userDataPath, item);
    emptyDirSync(removeDirectory);
  });
  relaunchApp();
};
