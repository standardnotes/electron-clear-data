import { app, BrowserWindow } from 'electron';

const relaunchApp = () => {
  app.relaunch();
  app.exit();
};

const getFocusedWindow = () => {
  return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
};

/**
 * Removes the contents of the user data directory.
 * This directory is then recreated after re-launching the application.
 */
export function clearAllUserData(): void {
  const { webContents } = getFocusedWindow();
  webContents.session.flushStorageData();
  webContents.session.clearStorageData();
  relaunchApp();
};

/**
 * Removes directories containing leveldb databases.
 * Each directory is reinitialized after re-launching the application.
 */
export function clearSensitiveDirectories(): void {
  const { webContents } = getFocusedWindow();
  webContents.session.flushStorageData();
  webContents.session.clearStorageData({
    storages: [
      'indexdb',
      'localstorage',
      'websql'
    ]
  });
  relaunchApp();
};
