// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.onload = function(){



};

(function(){

    'use strict';

    const settingsButton = document.querySelector('#settingsBtn');

    settingsButton.addEventListener('click', function(){
        document.body.dataset.settingsshowing = "true";
    }, false);

    setTimeout(function(){
        document.body.dataset.ready = "true";
    }, 50);

}());