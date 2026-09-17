const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

const users = new Map();

io.on("connection", (socket) => {
  console.log("Bir kullanıcı bağlandı");

  socket.on("join", (nick) => {
    users.set(socket.id, nick);

    io.emit("users", Array.from(users.values()));

    io.emit("chat message", {
      nick: "Sistem",
      text: `${nick} sohbete katıldı.`
    });
  });

  socket.on("chat message", (data) => {
    if (!data || !data.text) return;

    io.emit("chat message", {
      nick: data.nick || users.get(socket.id) || "Misafir",
      text: data.text
    });
  });

  socket.on("disconnect", () => {
    const nick = users.get(socket.id);

    if (nick) {
      users.delete(socket.id);
      io.emit("users", Array.from(users.values()));

      io.emit("chat message", {
        nick: "Sistem",
        text: `${nick} sohbetten ayrıldı.`
      });
    }

    console.log("Bir kullanıcı ayrıldı");
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
