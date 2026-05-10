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
    setupAutoUpdater();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupAutoUpdater() {
  // Config
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  // Logs (will show in console)
  console.log('Auto-updater initialized. Current version:', app.getVersion());

  // Events
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('update_available', info.version);
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available.');
    if (mainWindow) {
      mainWindow.webContents.send('update_not_available');
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err);
    if (mainWindow) {
      mainWindow.webContents.send('update_error', err.message || 'Bilinmeyen bir hata oluştu');
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent);
    console.log(`Download progress: ${percent}%`);
    if (mainWindow) {
      mainWindow.webContents.send('update_progress', percent);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded and ready to install.');
    if (mainWindow) {
      mainWindow.webContents.send('update_downloaded');
    }
  });

  // Manual trigger via IPC
  ipcMain.handle('check-for-updates', async () => {
    console.log('Manual update check triggered.');
    try {
      const result = await autoUpdater.checkForUpdates();
      return result;
    } catch (error) {
      console.error('Manual check error:', error);
      throw error;
    }
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

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

