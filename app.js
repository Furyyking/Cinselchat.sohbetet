const socket = io();

const nickInput = document.getElementById("nick");
const joinBtn = document.getElementById("join");
const textInput = document.getElementById("text");
const form = document.getElementById("form");
const messages = document.getElementById("messages");
const status = document.getElementById("status");
const users = document.getElementById("users");
const rooms = document.getElementById("rooms");

let nick = "";

socket.on("connect", () => {
  status.textContent = "🟢 Bağlandı";
});

socket.on("disconnect", () => {
  status.textContent = "🔴 Bağlantı kesildi";
});

joinBtn.addEventListener("click", () => {
  const name = nickInput.value.trim();

  if (!name) {
    alert("Önce nickini yaz kral 😄");
    return;
  }

  nick = name;
  nickInput.disabled = true;
  joinBtn.disabled = true;
  textInput.focus();

  socket.emit("join", nick);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = textInput.value.trim();

  if (!message || !nick) return;

  socket.emit("chat message", {
    nick: nick,
    text: message
  });

  textInput.value = "";
  textInput.focus();
});

socket.on("chat message", (data) => {
  const div = document.createElement("div");
  div.className = "message";

  if (typeof data === "string") {
    div.textContent = data;
  } else {
    div.innerHTML =
      "<b>" +
      escapeHtml(data.nick || "Misafir") +
      ":</b> " +
      escapeHtml(data.text || "");
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

socket.on("users", (list) => {
  users.innerHTML = "";

  list.forEach((name) => {
    const div = document.createElement("div");
    div.textContent = "🟢 " + name;
    users.appendChild(div);
  });
});

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
