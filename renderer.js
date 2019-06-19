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

    const saveSettingsBtn = settingsForm.querySelector('input[type="button"][data-type="save"]');
    const cancelSettingsBtn = settingsForm.querySelector('input[type="button"][data-type="cancel"]');
    
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

        function showTheMostRecentSavedSettingsInForm(){

            const lastSavedData = getStoredSettingsForBroker();

            settingsForm[0].value = lastSavedData.broker || "";
            settingsForm[1].value = lastSavedData.port || "";
            settingsForm[2].value = lastSavedData.topic || "";
            settingsForm[3].value = lastSavedData.username || "";
            settingsForm[4].value = lastSavedData.password || "";
            settingsForm[5].value = lastSavedData.clientId || "";

        }

        return {
            get : getStoredSettingsForBroker,
            set : saveSettingsForBroker,
            setFromSaved : showTheMostRecentSavedSettingsInForm,
            send : sendBrokerSettingsToMainProcess
        };

    })();

    settingsButton.addEventListener('click', function(){
        document.body.dataset.settingsshowing = "true";
    }, false);

    settingsForm.addEventListener('submit', function(e){
        
        e.preventDefault();
        e.stopImmediatePropagation();

    }, false);

    saveSettingsBtn.addEventListener('click', function(){

        brokerSettings.set({
            broker : settingsForm[0].value,
            port : settingsForm[1].value || 1883,
            topic : settingsForm[2].value,
            username : settingsForm[3].value,
            password : settingsForm[4].value,
            clientId : settingsForm[5].value
        });

        brokerSettings.send();

        document.body.dataset.settingsshowing = "false";

    }, false);

    cancelSettingsBtn.addEventListener('click', function(){
        document.body.dataset.settingsshowing = "false";
        brokerSettings.setFromSaved();
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

    brokerSettings.setFromSaved();

}());