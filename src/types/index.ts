import { MediaConnection } from "peerjs";

export type ParticipantType = {
  lastHeartbeat?: number;
  mediaConnection: MediaConnection;
  mediaStream: MediaStream;
};
