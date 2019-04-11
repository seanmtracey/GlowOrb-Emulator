// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

(function(){

    'use strict';

    const Electron = require('electron');
    const ipcRenderer = Electron.ipcRenderer; 

    const settingsButton = document.querySelector('#settingsBtn');
    
    const GlowOrb = document.querySelector('#gloworb');
    const Orb = GlowOrb.querySelector('#orb');

    const status = document.querySelector('#status');

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
        status.querySelector('span').textContent = `Color set at ${timeString}`
    }

    settingsButton.addEventListener('click', function(){
        document.body.dataset.settingsshowing = "true";
    }, false);

    ipcRenderer.on('message' , function(event , message){ 
        console.log(message);
        
        if(message.data){
            setGlowOrbColor(message.data);
            setStatus(message.data);
        }
        
    });

    setTimeout(function(){
        document.body.dataset.ready = "true";
    }, 50);

}());