const {app, BrowserWindow} = require('electron');

const isDev = require('electron-is-dev');

const createWindow =  () =>{
    const win = new BrowserWindow({
       width: 960,
       height: 678,
        title: 'E-Smart IOT',
        frame: true,
        center: true,
        hasShadow: false,
       webPreferences:{
           nodeIntegration: true
       }
    });

    const url = isDev ? 'http://localhost:3000' : 'https://e-smart-iot.web.app';
    win.loadURL(url).then(() =>console.log(`loaded from url: ${url}`));
    if(isDev)
        win.webContents.openDevTools();
}

app.whenReady().then(createWindow);
app.on('activate', () =>{
    if(BrowserWindow.getAllWindows().length === 0)
        createWindow();
});

app.on('window-all-closed', () =>{
   if(process.platform !== 'darwin')
       app.quit();
});
