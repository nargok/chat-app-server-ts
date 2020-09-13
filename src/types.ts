import { User, Log, Room } from "./rooms";

/*
1. Clientから送られるデータの型
2. WebSocketからクライアントへ返却するデータの型
を定義する
2.の型にはResultをつける
*/

interface ResultCommon {
  type: string;
}

export interface CreateRoom {
  roomName: string;
  userName: string;
}

export interface CreateRoomResult extends ResultCommon {
  rooms: Room[];
}

export interface JoinRoom {
  roomId: string;
  userName: string;
}

export interface JoinRoomResult extends ResultCommon {
  roomId: string;
  userName: string;
  users: User[];
}

export interface Conversation {
  roomId: string;
  userName: string;
  message: string;
}

export interface ConversationResult extends ResultCommon {
  roomId: string;
  userName: string;
  time: string;
  message: string;
}

export interface DisconnectResult extends ResultCommon {
  roomId: string;
  sockeId: string;
}

export interface CurrentRoom {
  roomId: string;
}

export interface CurrrrentRoomResult extends ResultCommon {
  roomId: string;
  roomName: string;
  users: User[];
  logs: Log[];
}
