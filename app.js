const socket = io();

const login = document.getElementById("login");
const app = document.getElementById("app");
const loginNick = document.getElementById("loginNick");
const loginBtn = document.getElementById("loginBtn");
const myNick = document.getElementById("myNick");
const status = document.getElementById("status");
const roomsEl = document.getElementById("rooms");
const usersEl = document.getElementById("users");
const messages = document.getElementById("messages");
const form = document.getElementById("form");
const text = document.getElementById("text");
const roomName = document.getElementById("roomName");
const onlineCount = document.getElementById("onlineCount");
const userCount = document.getElementById("userCount");
const logoutBtn = document.getElementById("logoutBtn");
const emojiBtn = document.getElementById("emojiBtn");

let nick = "";
let currentRoom = "Genel";

const roomIcons = {
  "Genel": "💬",
  "Sohbet": "🗨️",
  "Arkadaşlık": "👥",
  "Müzik": "🎵",
  "Oyun": "🎮",
  "+18": "♥"
};

loginBtn.addEventListener("click", join);

loginNick.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    join();
  }
});

function join() {
  const value = loginNick.value.trim();

  if (!value) {
    loginNick.focus();
    return;
  }

  nick = value.slice(0, 24);

  myNick.textContent = nick;

  login.classList.add("hidden");
  app.classList.remove("hidden");

  socket.emit("join", {
    nick: nick,
    room: "Genel"
  });

  text.focus();
}

socket.on("connect", () => {
  status.textContent = "🟢 Bağlandı";

  if (nick) {
    socket.emit("join", {
      nick: nick,
      room: currentRoom
    });
  }
});

socket.on("disconnect", () => {
  status.textContent = "🔴 Bağlantı kesildi";
});

socket.on("state", (state) => {
  currentRoom = state.room;

  renderRooms(state.rooms);
  renderUsers(state.users);
  updateRoom();
});

socket.on("room changed", (room) => {
  currentRoom = room;

  messages.innerHTML = "";

  updateRoom();
});

socket.on("users", (users) => {
  renderUsers(users);
});

socket.on("system message", (message) => {
  addMessage("Sistem", message, "system");
});

socket.on("chat message", (data) => {
  addMessage(
    data.nick,
    data.text,
    "chat",
    data.time
  );
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const value = text.value.trim();

  if (!value || !nick) {
    return;
  }

  socket.emit("chat message", value);

  text.value = "";
  text.focus();
});

function renderRooms(rooms) {
  roomsEl.innerHTML = "";

  rooms.forEach((room) => {
    const button = document.createElement("button");

    button.className =
      "room-btn" +
      (room === currentRoom ? " active" : "");

    button.innerHTML = `
      <span>${roomIcons[room] || "💬"}</span>
      <b>${escapeHtml(room)}</b>
    `;

    button.addEventListener("click", () => {
      if (room !== currentRoom) {
        socket.emit("change room", room);
      }
    });

    roomsEl.appendChild(button);
  });
}

function renderUsers(list) {
  usersEl.innerHTML = "";

  userCount.textContent = list.length;
  onlineCount.textContent = `${list.length} kişi online`;

  list.forEach((name) => {
    const row = document.createElement("div");

    row.className = "user-row";

    const dot = document.createElement("span");

    dot.className = "online-dot";

    const nameEl = document.createElement("span");

    nameEl.textContent = name;

    if (name === nick) {
      const crown = document.createElement("span");

      crown.textContent = " 👑";

      nameEl.appendChild(crown);
    }

    row.append(dot, nameEl);

    usersEl.appendChild(row);
  });
}

function addMessage(name, content, type, time = "") {
  const row = document.createElement("div");

  row.className = `message ${type}`;

  if (type === "system") {
    row.textContent = content;
  } else {
    row.innerHTML = `
      <div class="message-avatar">
        ${escapeHtml(name.charAt(0).toUpperCase())}
      </div>

      <div class="message-body">

        <div class="message-meta">
          <b>${escapeHtml(name)}</b>
          <small>${escapeHtml(time)}</small>
        </div>

        <div class="message-text">
          ${escapeHtml(content)}
        </div>

      </div>
    `;
  }

  messages.appendChild(row);

  messages.scrollTop = messages.scrollHeight;
}

function updateRoom() {
  roomName.textContent = currentRoom;

  document.querySelectorAll(".room-btn").forEach((button) => {
    const b = button.querySelector("b");

    button.classList.toggle(
      "active",
      b && b.textContent === currentRoom
    );
  });
}

logoutBtn.addEventListener("click", () => {
  location
