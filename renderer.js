// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

(function(){

    'use strict';

    const Electron = require('electron');
    const ipcRenderer = Electron.ipcRenderer; 

    const settingsButton = document.querySelector('#settingsBtn');
    const settingsPanel = document.querySelector('#settingsPanel');
    const settingsForm = settingsPanel.querySelector('form');
    
    const GlowOrb = document.querySelector('#gloworb');
    const Orb = GlowOrb.querySelector('#orb');

    const status = document.querySelector('#status');

    const connectionStatus = document.querySelector('#connectionStatus');

    function zeroPad(number){
        if(number < 10){
            return `0${number}`;
        } else {
            return `${number}`;
        }
    }

    function setGlowOrbColor(color){
        Orb.style.backgroundColor = color;
        Orb.style.boxShadow = `0 0 50px ${color}`;
    }

    function setStatus(color){

        const time = new Date();
        const timeString = `${ zeroPad( time.getHours() )}:${ zeroPad( time.getMinutes() )}:${ zeroPad( time.getSeconds( ))}`;

        status.querySelector('h1').textContent = color;
        status.querySelector('span').textContent = `Color set at ${timeString}`;

    }

    const brokerSettings = (function(){

        function getStoredSettingsForBroker(){
            
            const data = localStorage.getItem('brokerSettings');

            if(data){
                return JSON.parse(data);
            } else {
                return {};
            }

        }

        function saveSettingsForBroker(data){

            localStorage.setItem('brokerSettings', JSON.stringify(data) );

        }

        function sendBrokerSettingsToMainProcess(){
            
            const data = getStoredSettingsForBroker();
            ipcRenderer.send('brokerSettings', data);

        }

        return {
            get : getStoredSettingsForBroker,
            set : saveSettingsForBroker,
            send : sendBrokerSettingsToMainProcess
        };

    })();

    settingsButton.addEventListener('click', function(){
        document.body.dataset.settingsshowing = "true";
    }, false);

    settingsForm.addEventListener('submit', function(e){
        
        e.preventDefault();
        e.stopImmediatePropagation();
        
        brokerSettings.set({
            broker : this[0].value,
            port : this[1].value || 1883,
            topic : this[2].value,
            username : this[3].value,
            password : this[4].value,
            clientId : this[5].value
        });

        brokerSettings.send();
        document.body.dataset.settingsshowing = "false";

    }, false);

    ipcRenderer.on('message' , function(event, message){ 
        console.log(message);
        
        if(message.data){
            setGlowOrbColor(message.data);
            setStatus(message.data);
        }
        
    });

    ipcRenderer.on('connectionChange', function(event, message){

        if(message){

            if(message.status === "connecting"){
                document.body.dataset.connecting = "true";
                connectionStatus.querySelector('h1').textContent = "Connecting...";
            }

            if(message.status === "connected"){
                connectionStatus.querySelector('h1').textContent = "Connected!";
                
                setTimeout(function(){
                    document.body.dataset.connecting = "false";
                }, 1500);

            }

            /*if(message.status === "error"){
                document.body.dataset.connecting = "true";

            }*/

        }

    });

    setTimeout(function(){
        document.body.dataset.ready = "true";
    }, 50);

    const storedData = brokerSettings.get();

    if(storedData.broker && storedData.port && storedData.topic){
        brokerSettings.send();
    } else {
        document.body.dataset.settingsshowing = "true";
    }

    settingsForm[0].value = storedData.broker || "";
    settingsForm[1].value = storedData.port || "";
    settingsForm[2].value = storedData.topic || "";
    settingsForm[3].value = storedData.username || "";
    settingsForm[4].value = storedData.password || "";
    settingsForm[5].value = storedData.clientId || "";


}());