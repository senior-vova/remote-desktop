const { app, BrowserWindow, ipcMain } = require("electron");
const screenshot = require("screenshot-desktop");
const robot = require("@hurdlegroup/robotjs");
const path = require("path");
const { io } = require("socket.io-client");

const socket = io("http://127.0.0.1:5000");

let interval;

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 150,
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.removeMenu();
  win.loadFile("index.html");

  socket.on("mouse-move", function (data) {
    const obj = JSON.parse(data);
    const x = obj.x;
    const y = obj.y;

    robot.moveMouse(x, y);
  });

  socket.on("mouse-click", function (data) {
    robot.mouseClick();
  });

  socket.on("type", function (data) {
    const obj = JSON.parse(data);
    const key = String(obj.key).toLowerCase();

    try {
      console.log(key);
      robot.keyTap(key);
    } catch (error) {
      console.log("Error");
    }
  });

  console.log("Run app");
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle("start-share", (_, arg) => {
    const uuid = arg;

    socket.emit("join-message", uuid);

    interval = setInterval(function () {
      screenshot().then((img) => {
        const imgStr = Buffer.from(img).toString("base64");

        const obj = { room: uuid, image: imgStr };

        socket.emit("screen-data", JSON.stringify(obj));
      });
    }, 500);
  });

  ipcMain.handle("stop-share", () => {
    clearInterval(interval);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
