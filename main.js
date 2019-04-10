
const Electron = require('electron');
const app = Electron.app;
const BrowserWindow = Electron.BrowserWindow;
const ipcRenderer = Electron.ipcRenderer;

let mainWindow

function createWindow () {

	mainWindow = new BrowserWindow({
		width: 350,
		height: 480,
		webPreferences: {
			nodeIntegration: true
		},
		transparent: true,
		frame: false,
		resizable: false,
		show: false
	});


	mainWindow.loadFile('index.html');

	mainWindow.toggleDevTools();

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	});

	mainWindow.on('closed', function () {
		mainWindow = null;
	});
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {

	if (process.platform !== 'darwin'){
		app.quit();
	}
});

app.on('activate', function () {


	if (mainWindow === null) {
		createWindow();
	}
})

