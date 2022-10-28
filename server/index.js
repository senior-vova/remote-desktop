const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const clients = [];

app.get("/view", (req, res) => {
  res.sendFile(__dirname + "/display.html");
});

io.on("connection", (socket) => {
  socket.on("join-message", (roomId) => {
    socket.join(roomId);
    if (!clients.find((c) => c.room == roomId)) {
      clients.push({ room: roomId, img: "" });
    }
    console.log("User joined in a room : " + roomId);
  });

  socket.on("screen-data", function (data) {
    const obj = JSON.parse(data);
    const room = obj.room;
    const imgStr = obj.image;
    const client = clients.find((c) => c.room == room);
    if (client) {
      client.img = imgStr;
    }
  });

  socket.on("get-screen-data", function (data, cb) {
    try {
      const room = data.room;
      const client = clients.find((c) => c.room == room);
      cb(client ? client.img : "");
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("mouse-move", function (data) {
    const room = JSON.parse(data).room;
    socket.broadcast.to(room).emit("mouse-move", data);
  });

  socket.on("mouse-click", function (data) {
    const room = JSON.parse(data).room;
    socket.broadcast.to(room).emit("mouse-click", data);
  });

  socket.on("type", function (data) {
    const room = JSON.parse(data).room;
    socket.broadcast.to(room).emit("type", data);
  });
});

http.listen(5000, () => {
  console.log("Server has been started");
});
