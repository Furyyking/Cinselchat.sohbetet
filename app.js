  const socket = io();

const nickInput = document.getElementById("nick");
const joinBtn = document.getElementById("join");
const textInput = document.getElementById("text");
const form = document.getElementById("form");
const messages = document.getElementById("messages");
const status = document.getElementById("status");

socket.on("connect", () => {
  status.textContent = "🟢 Bağlandı";
});

socket.on("disconnect", () => {
  status.textContent = "🔴 Bağlantı kesildi";
});

joinBtn.addEventListener("click", () => {
  const nick = nickInput.value.trim();

  if (!nick) {
    alert("Nickini yaz kral 😄");
    return;
  }

  nickInput.disabled = true;
  joinBtn.disabled = true;
  textInput.focus();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nick = nickInput.value.trim();
  const text = textInput.value.trim();

  if (!nick || !text) return;

  socket.emit("chat message", {
    nick: nick,
    text: text
  });

  textInput.value = "";
});

socket.on("chat message", (data) => {
  const div = document.createElement("div");
  div.className = "msg";

  const name = document.createElement("b");
  name.textContent = (data.nick || "Misafir") + ": ";

  const message = document.createElement("span");
  message.textContent = data.text || "";

  div.appendChild(name);
  div.appendChild(message);
  messages.appendChild(div);

  messages.scrollTop = messages.scrollHeight;
});
