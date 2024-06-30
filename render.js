const { ipcRenderer } = require('electron');

function windowsClose()
{
    ipcRenderer.send('close');
}