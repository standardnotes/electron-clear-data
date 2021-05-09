import { Application } from 'spectron';
import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import {
  clearAllUserData,
  clearSensitiveDirectories
} from './main';

const electronPath = path.resolve(__dirname, '../node_modules/.bin/electron');
const testAppPath = path.resolve(__dirname, '../test/electron-app');

/**
 * app.exit() and app.relaunch() are mocked here because 
 * relaunching the application would disconnect the test session.
 */
app.exit = jest.fn().mockImplementation(() => '');
app.relaunch = jest.fn().mockImplementation(() => {
  if (testApplication && !testApplication.isRunning()) {
    return testApplication.start()
  }
});

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

  let clearStorageData: jest.SpyInstance<Promise<void>, [options?: Electron.ClearStorageDataOptions]>;

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
      const focusedWindow = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
      clearStorageData = jest.spyOn(focusedWindow!.webContents.session, 'clearStorageData');
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

  describe('clearAllUserData()', () => {
    it('should clear all user data', () => {
      clearAllUserData();

      expect(clearStorageData).toBeCalledTimes(1);
      expect(clearStorageData).toBeCalledWith();

      let dirContents = getDirContents(tmpUserDataDir);
      expect(dirContents.length).toBeGreaterThan(0);
    });

    it('should relaunch application', () => {
      clearAllUserData();

      expect(app.exit).toBeCalledTimes(1);
      expect(app.relaunch).toBeCalledTimes(1);
    });
  });

  describe('clearSensitiveDirectories', () => {
    it('should clear sensitive leveldb directories', async () => {
      clearSensitiveDirectories();

      expect(clearStorageData).toBeCalledTimes(1);
      expect(clearStorageData).toBeCalledWith({
        storages: [
          'indexdb',
          'localstorage',
          'websql'
        ]
      });

      let dirContents = getDirContents(tmpUserDataDir);
      expect(dirContents.length).toBeGreaterThan(0);
    });

    it('should relaunch application', () => {
      clearSensitiveDirectories();

      expect(app.exit).toBeCalledTimes(1);
      expect(app.relaunch).toBeCalledTimes(1);
    });
  });
});