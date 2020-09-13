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

  // 会話
  socket.on(Events.CONNECTION, (data: Types.Conversation) => {
    const roomId = data.roomId;
    const message = data.message;
    const currentDate: string = formatDate("yyyy/MM/dd HH:mm:ss");

    for (let room of rooms) {
      if (room.id === roomId) {
        room.logs.push({
          logId: room.logs.length + 1,
          userName: data.userName,
          time: currentDate,
          message,
        });
        break;
      }
    }

    const result: Types.ConversationResult = {
      type: Events.CONVERSATION,
      roomId,
      userName: data.userName,
      time: currentDate,
      message,
    };

    io.emit(Events.CONVERSATION, result);
  });

  // チャットルーム一覧の取得
  socket.on(Events.GET_ROOM_LIST, () => {
    const result = {
      tyep: Events.GET_ROOM_LIST,
      rooms,
    };
    io.emit(Events.GET_ROOM_LIST, result);
  });

  // 現在のチャットルーム情報取得
  socket.on(Events.GET_CURRENT_ROOM, (data: Types.CurrentRoom) => {
    const currentRoom = rooms.filter((d) => d.id === data.roomId);

    if (currentRoom.length === 1) {
      const result: Types.CurrrrentRoomResult = {
        type: Events.GET_CURRENT_ROOM,
        roomId: currentRoom[0].id,
        roomName: currentRoom[0].name,
        users: currentRoom[0].users,
        logs: currentRoom[0].logs,
      };
      io.emit(Events.GET_CURRENT_ROOM, result);
    }
  });

  socket.on(Events.LEAVE_ROOM, () => {
    if (currentRoomId) {
      // 接続が切れる際にルームからユーザーを削除する
      outer: for (const room of rooms) {
        if (room.id === currentRoomId) {
          for (let i = 0; i < room.users.length; i++) {
            if (room.users[i].sockeId === socket.id) {
              room.users.splice(i, 1);
              socket.leave(currentRoomId);
              break outer;
            }
          }
        }
      }

      const result: Types.DisconnectResult = {
        type: Events.LEAVE_ROOM,
        roomId: currentRoomId,
        sockeId: socket.id,
      };

      io.emit(Events.LEAVE_ROOM, result);
    }
  });

  // 接続切断
  socket.on(Events.DISCONNECT, () => {
    if (currentRoomId) {
      outer: for (const room of rooms) {
        if (room.id === currentRoomId) {
          for (let i = 0; i < room.users.length; i++) {
            if (room.users[i].sockeId === socket.id) {
              room.users.splice(i, 1);
              socket.leave(currentRoomId);
              break outer;
            }
          }
        }
      }

      const result: Types.DisconnectResult = {
        type: Events.DISCONNECT,
        roomId: currentRoomId,
        sockeId: socket.id,
      };

      io.emit(Events.DISCONNECT, result);
    }
  });
});

server.listen(3333, () => console.log("listening on *:3333"));
