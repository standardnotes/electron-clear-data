import { Application } from 'spectron';
import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import {
  clearUserDataDirectory,
  clearSensitiveDirectories
} from './main';
import { assert } from 'node:console';

const electronPath = path.resolve(__dirname, '../node_modules/.bin/electron');
const testAppPath = path.resolve(__dirname, '../test/electron-app');

function getDirContents(path: string) {
  return fs.readdirSync(path);
}

async function sleep(seconds: number) {
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function createTmpDir() {
  const tmpDir = path.join(__dirname, '../tmp');

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  return tmpDir;
}

const tmpUserDataDir = createTmpDir();
let testApplication: Application;

describe('electron-clear-data', () => {
  jest.setTimeout(25000);

  beforeEach(async () => {
    testApplication = new Application({
      path: electronPath,
      args: [testAppPath],
      env: {
        SPECTRON: true,
      },
      chromeDriverArgs: [`user-data-dir=${tmpUserDataDir}`]
    });
    return testApplication.start().then(() => {
      app.setPath('userData', tmpUserDataDir);
    });
  });

  afterEach(() => {
    if (testApplication && testApplication.isRunning()) {
      return testApplication.stop();
    }
  });

  test('user data directory should exist', () => {
    const testDirExists = fs.existsSync(tmpUserDataDir);
    expect(testDirExists).toBe(true);
  });

  describe('clearUserDataDirectory()', () => {
    it('should delete all files', () => {
      let dirContents = getDirContents(tmpUserDataDir);
      expect(dirContents.length).toBeGreaterThan(0);

      clearUserDataDirectory();

      dirContents = getDirContents(tmpUserDataDir);
      expect(dirContents.length).toBe(0);
    });

    it('should reload application', () => {
      const focusedWindow = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
      focusedWindow.webContents.reload = jest.fn().mockImplementation(() => '')

      clearUserDataDirectory();

      expect(focusedWindow.webContents.reload).toBeCalledTimes(1);
    });

    it('should create new files after reload', async () => {
      let dirContents = getDirContents(tmpUserDataDir);
      expect(dirContents.length).toBeGreaterThan(0);

      clearUserDataDirectory();

      dirContents = getDirContents(tmpUserDataDir);
      expect(dirContents.length).toBe(0);

      // Waiting a bit so Electron has a chance to create the user data directory.
      await sleep(20);

      dirContents = getDirContents(tmpUserDataDir);
      expect(dirContents.length).toBeGreaterThan(0);
    });
  });

  describe('clearSensitiveDirectories', () => {
    it('should clear leveldb directories', async () => {
      expect.assertions(3);
      clearSensitiveDirectories();

      const leveldbDirectories = [
        'Local Storage',
        'IndexedDB',
        'Session Storage'
      ];

      leveldbDirectories.forEach((item) => {
        const dataDir = path.join(tmpUserDataDir, item);
        const dirContents = fs.readdirSync(dataDir);
        expect(dirContents.length).toBe(0);
      });
    });

    it('should reload application', () => {
      const focusedWindow = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
      focusedWindow.webContents.reload = jest.fn().mockImplementation(() => '')

      clearSensitiveDirectories();

      expect(focusedWindow.webContents.reload).toBeCalledTimes(1);
    });
  });
});
