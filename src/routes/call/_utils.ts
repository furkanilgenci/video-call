import type { MediaConnection } from "peerjs";
import { isHost } from "../../services/peerjs";

export type ParticipantType = {
  lastHeartbeat?: number;
  mediaConnection: MediaConnection;
  mediaStream: MediaStream;
};

export function addParticipant(
  setState: React.Dispatch<React.SetStateAction<ParticipantType[]>>,
  newParticipant: ParticipantType,
) {
  setState((current) => {
    if (
      current.some(
        (participant) =>
          participant.mediaStream.id === newParticipant.mediaStream.id,
      )
    ) {
      return current;
    }
    return [...current, newParticipant];
  });
}

export function handleHeartbeat(
  setState: React.Dispatch<React.SetStateAction<ParticipantType[]>>,
  mediaConnection: MediaConnection,
) {
  setState((current) => {
    return current.map((p) => {
      if (p.mediaConnection.peer === mediaConnection.peer) {
        return {
          ...p,
          lastHeartbeat: Date.now(),
        };
      }
      return p;
    });
  });
}

export function removeInactiveParticipants(
  setState: React.Dispatch<React.SetStateAction<ParticipantType[]>>,
) {
  if (!isHost()) return;

  setState((current) => {
    return current.filter(
      (participant) =>
        !participant.lastHeartbeat ||
        Date.now() - participant.lastHeartbeat < 2000,
    );
  });
}
