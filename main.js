
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
					port : data.port,
					connectTimeout : 15 * 1000,
					username : data.username,
					password : data.password,
					clientId : data.clientId
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

				mqttClient.on('error', function (err) {

					console.log('error:', err);

					mainWindow.webContents.send('connectionChange' , {
						status: "error",
						details : err
					});

				});

				mqttClient.on('reconnect', function (err) {

					console.log('reconnect:', err);

					mainWindow.webContents.send('connectionChange' , {
						status: "reconnecting",
					});

				});

				mqttClient.on('offline', function (err) {

					console.log('offline:', err);

					mainWindow.webContents.send('connectionChange' , {
						status: "offline"
					});

				});

				mqttClient.on('close', function (err) {

					console.log('close:', err);

					mainWindow.webContents.send('connectionChange' , {
						status: "closed"
					});

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
		height: 430,
		webPreferences: {
			nodeIntegration: true
		},
		transparent: true,
		frame: false,
		resizable: false,
		show: false,
		hasShadow : false
	});


	mainWindow.loadFile('index.html');

	// mainWindow.toggleDevTools();

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

