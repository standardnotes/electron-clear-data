import { app, BrowserWindow } from 'electron';

export const relaunchApp = () => {
  const relaunchOptions = {
    execPath: process.execPath,
    args: process.argv
  };
  /**
   * Fix for AppImage on Linux.
   */
  if (process.env.APPIMAGE) {
    relaunchOptions.execPath = process.env.APPIMAGE;
    relaunchOptions.args.unshift('--appimage-extract-and-run');
  }
  app.relaunch(relaunchOptions);
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
export function clearSensitiveDirectories(restart = true): void {
  const { webContents } = getFocusedWindow();
  webContents.session.flushStorageData();
  webContents.session.clearStorageData({
    storages: [
      'indexdb',
      'localstorage',
      'websql'
    ]
  });
  if (restart) {
    relaunchApp();
  }
};
