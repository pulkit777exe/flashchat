import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(socket) {
  console.log("User connected");

  socket.on("message", (e) => {
    console.log(e.toString());
    if(e.toString() === "ping") {
      socket.send("pong");
    };
  })
});