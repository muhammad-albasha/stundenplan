const {app, BrowserWindow, ipcMain, shell } = require("electron");
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS']=true
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    icon: "icon.ico",
    width: 1260,
    height: 700,
    minWidth: 1200,
    minHeight: 600,
    fullscreenable: true,
    autoHideMenuBar: false,
    frame: false,
    show: false,
    devTools: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: __dirname + "/preload.js",
    },
  });
  var splash = new BrowserWindow({
    icon: "icon.ico",
    width: 520,
    height: 310,
    transparent: false,
    frame: false,
    alwaysOnTop: true,
  });

  splash.loadFile("splash.html");
  splash.center();
  setTimeout(function () {
    splash.close();
    mainWindow.center();
    mainWindow.show();
  }, 5000);

  function handleRedirect(e, url) {
    e.preventDefault();
    if (url !== mainWindow.webContents.getURL()) {
      shell.openExternal(url);
    }
  }
  mainWindow.webContents.on("new-window", handleRedirect);

  mainWindow.loadFile("./src/index.html");
  ipcMain.on("close", (event, data) => {
    mainWindow.close();
  });
};
app.on('ready', function () {
createWindow()
});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
