
const Electron = require('electron');
const mqtt = require('mqtt');
const validHexColor = require('valid-hex-color');

const app = Electron.app;
const BrowserWindow = Electron.BrowserWindow;
const ipcMain = Electron.ipcMain;

let mqttClient;

ipcMain.on('brokerSettings', (evt, message) => {

	console.log(message);
	const data = message;

	if(data.broker && data.port && data.topic){

		let brokerDisconnect;
		
		if(mqttClient){

			brokerDisconnect = new Promise( (resolve, reject) => {
				
				mqttClient.end(true, function(){
					console.log('Disconnected from broker');
					resolve();
				});

			} );

		} else {
			brokerDisconnect = Promise.resolve();
		}

		brokerDisconnect
			.then(function(){

				mainWindow.webContents.send('connectionChange' , {
					status: "connecting"
				});

				mqttClient = mqtt.connect(data.broker, {
					port : data.port
				});
		
				mqttClient.on('connect', function () {
		
					console.log('Connected to MQTT Broker');

					mainWindow.webContents.send('connectionChange' , {
						status: "connected"
					});
				
					mqttClient.subscribe(data.topic, function (err) {
						
						if (err) {
							console.log('MQTT Subscription Error:', err);
						} else {
							console.log('Successful subscription to topic');
				
							mqttClient.on('message', function (topic, message) {
								// message is Buffer
								console.log(topic, message.toString());
				
								if( validHexColor.check(message.toString() ) ){
				
									if(mainWindow){
										mainWindow.webContents.send('message' , {
											data: message.toString(),
											topic : topic
										});
									}
				
								}
				
							});
				
						}
				
					})
				
				});

			})
			.catch(err => {
				console.log(err);
			})
		;

	}

});

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

