import type { MediaConnection } from "peerjs";

export type ParticipantType = {
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

