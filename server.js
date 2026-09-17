socket.on("chat message", (data) => {
  if (!data || !data.text) return;

  io.emit("chat message", {
    nick: data.nick || users.get(socket.id) || "Misafir",
    text: data.text
  });
});
