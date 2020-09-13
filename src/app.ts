import http from "http";
import socketio from "socket.io";
import * as Events from "./events";

const server: http.Server = http.createServer();
const io: socketio.Server = socketio(server);

io.sockets.on(Events.CONNECTION, (socket: socketio.Socket) => {});

server.listen(3333, () => console.log("listening on *:3333"));
