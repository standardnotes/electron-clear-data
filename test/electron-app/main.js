const { app, BrowserWindow } = require('electron');

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    height: 300,
    width: 400,
    title: 'Electron App',
    webPreferences: {
      devTools: false
    }
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');
});
