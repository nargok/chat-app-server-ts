import http from "http";
import socketio from "socket.io";

import rooms, { Room } from "./rooms";
import * as Types from "./types";
import * as Events from "./events";
import { formatDate } from "./utils";

const server: http.Server = http.createServer();
const io: socketio.Server = socketio(server);

let currentRoomIdCounter: number = 1;
const ROOM_NAME_PREFIX = "ROOM_";

io.sockets.on(Events.CONNECTION, (socket: socketio.Socket) => {
  let currentRoomId: string;

  //　チャットルーム作成
  socket.on(Events.CREATE_ROOM, (data: Types.CreateRoom) => {
    const roomId: string = ROOM_NAME_PREFIX + currentRoomIdCounter++;

    const room: Room = {
      id: roomId,
      name: data.roomName,
      users: [],
      logs: [],
    };

    rooms.push(room);

    const result: Types.CreateRoomResult = {
      type: Events.CREATE_ROOM,
      rooms,
    };

    io.emit(Events.CREATE_ROOM, result);
  });

  // チャットルーム入室
  socket.on(Events.JOIN_ROOM, (data: Types.JoinRoom) => {
    const roomId = data.roomId;
    currentRoomId = roomId;

    for (const room of rooms) {
      if (room.id === roomId) {
        room.users.push({
          sockeId: socket.id,
          name: data.userName,
        });
        socket.join(room.id);

        const result: Types.JoinRoomResult = {
          type: Events.JOIN_ROOM,
          roomId: roomId,
          userName: data.userName,
          users: room.users,
        };

        io.emit(Events.JOIN_ROOM, result);
        break;
      }
    }
  });
});

server.listen(3333, () => console.log("listening on *:3333"));
