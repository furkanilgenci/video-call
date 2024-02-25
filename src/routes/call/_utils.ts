import type { MediaConnection } from "peerjs";
import { isHost } from "../../services/peerjs";
import { ParticipantType } from "../../types";

export function addParticipant(
  setState: React.Dispatch<React.SetStateAction<ParticipantType[]>>,
  newParticipant: ParticipantType
) {
  setState((current) => {
    if (
      current.some(
        (participant) =>
          participant.mediaStream.id === newParticipant.mediaStream.id
      )
    ) {
      return current;
    }
    return [...current, newParticipant];
  });
}

export function addScreenshareParticipant(
  setState: React.Dispatch<React.SetStateAction<ParticipantType[]>>,
  newParticipant: ParticipantType
) {
  setState((current) => {
    if (
      current.some(
        (participant) =>
          participant.mediaStream.id === newParticipant.mediaStream.id
      )
    ) {
      return current;
    }
    return [...current, newParticipant];
  });
}

export function removeParticipant(
  setState: React.Dispatch<React.SetStateAction<ParticipantType[]>>,
  peerId: string
) {
  setState((current) => {
    return current.filter(
      (participant) => participant.mediaConnection.peer !== peerId
    );
  });
}

export function handleHeartbeat(
  setState: React.Dispatch<React.SetStateAction<ParticipantType[]>>,
  mediaConnection: MediaConnection
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

export function handleNotifyConnectedParticipants(
  myPeerId: string,
  peerIds: string[],
  participants: ParticipantType[]
) {
  const peerIdsToCall = peerIds.filter(
    (peerId) =>
      peerId !== myPeerId &&
      !participants.some(
        (participant) => participant.mediaConnection.peer === peerId
      )
  );
  const participantsToDisconnect = participants.filter(
    (participant) =>
      !peerIds.includes(participant.mediaConnection.peer) &&
      !isHost(participant.mediaConnection.peer)
  );

  return { peerIdsToCall, participantsToDisconnect };
}

export function removeInactiveParticipants(
  setState: React.Dispatch<React.SetStateAction<ParticipantType[]>>
) {
  if (!isHost()) return;

  setState((current) => {
    return current.filter(
      (participant) =>
        !participant.lastHeartbeat ||
        Date.now() - participant.lastHeartbeat < 2000
    );
  });
}
