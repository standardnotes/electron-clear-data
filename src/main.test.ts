import { Application } from 'spectron';
import electron, { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { clearUserData } from './main';

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

function getUserDataPath() {
  const app = electron.app || electron.remote.app;
  const userDataPath = app.getPath('userData');
  return userDataPath;
}

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

let testApplication: Application;

describe('electron-clear-data', () => {
  jest.setTimeout(15000);

  const userDataDir = getUserDataPath();

  beforeEach(() => {
    const tmpDir = createTmpDir();
    testApplication = new Application({
      path: electronPath,
      args: [testAppPath],
      env: {
        SPECTRON: true,
      },
      chromeDriverArgs: [`user-data-dir=${tmpDir}`]
    });
    return testApplication.start();
  });

  afterEach(() => {
    if (testApplication && testApplication.isRunning()) {
      return testApplication.stop();
    }
  });

  test('user data directory should exist', () => {
    const testDirExists = fs.existsSync(userDataDir);
    expect(testDirExists).toBe(true);
  });

  describe('clearUserData()', () => {
    it('should delete all files', () => {
      let dirContents = getDirContents(userDataDir);
      expect(dirContents.length).toBeGreaterThan(0);
      
      clearUserData();

      dirContents = getDirContents(userDataDir);
      expect(dirContents.length).toBe(0);
    });

    it('should relaunch application', () => {
      clearUserData();

      expect(app.exit).toBeCalledTimes(1);
      expect(app.relaunch).toBeCalledTimes(1);
    });

    it('should create new files after relaunch', async () => {
      let dirContents = getDirContents(userDataDir);
      expect(dirContents.length).toBeGreaterThan(0);

      clearUserData();

      dirContents = getDirContents(userDataDir);
      expect(dirContents.length).toBe(0);

      // Waiting a bit so Electron has a chance to create the user data directory.
      await sleep(15);

      dirContents = getDirContents(userDataDir);
      expect(dirContents.length).toBeGreaterThan(0);
    });
  });
});
