import { isHost } from "../../services/peerjs";
import { ParticipantType } from "../../types";

export function handleNotifyConnectedParticipants(
  myPeerId: string,
  peerIds: string[],
  participants: ParticipantType[],
) {
  const peerIdsToCall = peerIds.filter(
    (peerId) =>
      peerId !== myPeerId &&
      !participants.some(
        (participant) => participant.mediaConnection.peer === peerId,
      ),
  );
  const participantsToDisconnect = participants.filter(
    (participant) =>
      !peerIds.includes(participant.mediaConnection.peer) &&
      !isHost(participant.mediaConnection.peer),
  );

  return { peerIdsToCall, participantsToDisconnect };
}

export function getInactiveParticipants(participants: ParticipantType[]) {
  if (!isHost()) return participants;

  return participants.filter(
    (participant) =>
      participant.lastHeartbeat &&
      Date.now() - participant.lastHeartbeat > 2000,
  );
}
