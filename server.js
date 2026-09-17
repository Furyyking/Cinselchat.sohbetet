const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const users = new Map();

const rooms = [
  "Genel",
  "Sohbet",
  "Arkadaşlık",
  "Müzik",
  "Oyun",
  "+18"
];

app.use(express.static(__dirname));

io.on("connection", (socket) => {

  // KULLANICI GİRİŞİ
  socket.on("join", (data) => {

    const nick = String(data?.nick || "")
      .trim()
      .slice(0, 24);

    const room = rooms.includes(data?.room)
      ? data.room
      : "Genel";

    if (!nick) return;

    // Daha önce bağlıysa eski kaydı temizle
    const oldUser = users.get(socket.id);

    if (oldUser) {
      socket.leave(oldUser.room);
    }

    users.set(socket.id, {
      nick,
      room
    });

    socket.join(room);

    socket.emit("state", {
      nick,
      room,
      rooms,
      users: getUsers(room)
    });

    io.to(room).emit(
      "system message",
      `${nick} sohbete katıldı.`
    );

    io.to(room).emit(
      "users",
      getUsers(room)
    );
  });


  // ODA DEĞİŞTİRME
  socket.on("change room", (room) => {

    const user = users.get(socket.id);

    if (!user) return;

    if (!rooms.includes(room)) return;

    const oldRoom = user.room;

    if (oldRoom === room) return;

    // Eski odadan çık
    socket.leave(oldRoom);

    io.to(oldRoom).emit(
      "system message",
      `${user.nick} odadan ayrıldı.`
    );

    io.to(oldRoom).emit(
      "users",
      getUsers(oldRoom)
    );

    // Yeni odaya gir
    user.room = room;

    socket.join(room);

    socket.emit(
      "room changed",
      room
    );

    io.to(room).emit(
      "system message",
      `${user.nick} odaya katıldı.`
    );

    io.to(room).emit(
      "users",
      getUsers(room)
    );
  });


  // MESAJ GÖNDERME
  socket.on("chat message", (text) => {

    const user = users.get(socket.id);

    if (!user) return;

    const clean = String(text || "")
      .trim()
      .slice(0, 500);

    if (!clean) return;

    io.to(user.room).emit(
      "chat message",
      {
        nick: user.nick,
        text: clean,
        time: new Date().toLocaleTimeString(
          "tr-TR",
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        )
      }
    );
  });


  // BAĞLANTI KESİLİRSE
  socket.on("disconnect", () => {

    const user = users.get(socket.id);

    if (!user) return;

    users.delete(socket.id);

    io.to(user.room).emit(
      "system message",
      `${user.nick} sohbetten ayrıldı.`
    );

    io.to(user.room).emit(
      "users",
      getUsers(user.room)
    );
  });

});


// ODADAKİ KULLANICILARI GETİR
function getUsers(room) {

  return Array.from(users.values())
    .filter((user) => user.room === room)
    .map((user) => user.nick);

}


// RENDER PORTU
server.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Sunucu ${PORT} portunda çalışıyor`
    );
  }
);
