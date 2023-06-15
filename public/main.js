const {app, BrowserWindow} = require('electron');


const createWindow =  () =>{
    const win = new BrowserWindow({
       width: 800,
       height: 600,
        title: 'E-Smart IOT',
        frame: true,
        center: true,
        hasShadow: false,
       webPreferences:{
           nodeIntegration: true
       }
    });

    const url = 'http://localhost:3000'
    win.loadURL(url).then(() =>console.log(`loaded from url: ${url}`));

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
