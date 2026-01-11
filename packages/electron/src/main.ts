import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as child_process from 'child_process';

let mainWindow: BrowserWindow | null = null;
let serverProcess: child_process.ChildProcess | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true,
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#00000000',
            symbolColor: '#ffffff'
        }
    });

    // In dev, load from Vite dev server with retry
    const loadURL = async () => {
        try {
            await mainWindow?.loadURL('http://localhost:5173');
        } catch (e) {
            console.log('Vite server not ready, retrying in 1s...');
            setTimeout(loadURL, 1000);
        }
    };
    loadURL();

    // Prevent navigation to external URLs (keep them in webview or open in browser)
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (url !== mainWindow?.webContents.getURL()) {
            // Allow hot module reload
            if (url.includes('localhost')) return;

            event.preventDefault();
            console.log('Prevented navigation to:', url);
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// IPC Handlers
ipcMain.handle('select-folder', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (result.canceled) return null;
    return result.filePaths[0];
});

function startServer() {
    // Spawn the server process using the system 'node' executable
    const serverPath = path.join(__dirname, '../../server/dist/index.js');
    console.log('Starting server from:', serverPath);

    serverProcess = child_process.spawn('node', [`"${serverPath}"`], {
        env: { ...process.env, PORT: '3001' },
        stdio: 'inherit',
        shell: true
    });
}

app.on('ready', () => {
    startServer();
    // Give server a moment to start
    setTimeout(createWindow, 2000);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
