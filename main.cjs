const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const { startServer } = require('./backend/server.js');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    title: "Teklif360 - Profesyonel Teklif Sistemi",
    backgroundColor: '#0f172a',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, 'assets', 'icon.ico')
  });

  // Remove default menu
  mainWindow.setMenuBarVisibility(false);

  const startURL = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, 'dist', 'index.html')}`;

  mainWindow.loadURL(startURL);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (!isDev) {
      // --- Auto Updater Events ---
  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-available');
  });

  ipcMain.handle('check-for-updates', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  ipcMain.handle('start-update', () => {
    autoUpdater.downloadUpdate();
  });

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
  });

  // Initial Check
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 5000);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

let serverInstance = null;

async function startApp() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'database.sqlite');
  
  try {
    serverInstance = await startServer(dbPath);
    const port = serverInstance.address().port;
    const apiUrl = `http://127.0.0.1:${port}`;
    
    // Global variable for the window
    app.commandLine.appendSwitch('api-url', apiUrl);
    
    console.log('Database initialized at:', dbPath);
    console.log('API URL:', apiUrl);
  } catch (err) {
    console.error('Failed to start backend:', err);
  }

  createWindow();
}

app.on('ready', startApp);

app.on('window-all-closed', () => {
  if (serverInstance) {
    serverInstance.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// --- IPC Handlers ---
ipcMain.handle('get-api-url', () => {
  if (serverInstance) {
    const port = serverInstance.address().port;
    return `http://127.0.0.1:${port}`;
  }
  return null;
});

ipcMain.on('toMain', (event, arg) => {
  if (arg.action === 'restart_app') {
    autoUpdater.quitAndInstall();
  }
});

// --- Auto Updater ---
autoUpdater.on('update-available', () => {
  if (mainWindow) mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) mainWindow.webContents.send('update_downloaded');
});
