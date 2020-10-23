const { app, BrowserWindow, Tray } = require('electron')

function createWindow () {
  // App icon
  // https://www.electronjs.org/docs/api/native-image#nativeimage
  // const appIcon = new Tray('favicon.png')

  // Create the browser window,
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    // icon: 'favicon.png',
    backgroundColor: '#212121',
    darkTheme: true,
    show: false,
    vibrancy: 'dark',
    webPreferences: {
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true
    }
  })

  // Maximize window on start
  win.maximize()

  // Debug
  // console.group('Main')
  // console.log(appIcon, win)
  // console.groupEnd()

  // and load the index.html file of the application.
  win.loadFile('index.html')

  // Open the DevTools.
  // win.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()

    // Debug
    // console.group('Main')
    // console.log('Window created and loaded.')
    // console.groupEnd()
  }
})

console.group('App')
console.log('Starting Slideshow...\n');
console.groupEnd()
