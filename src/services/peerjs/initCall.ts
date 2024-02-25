import Peer, { MediaConnection } from "peerjs";
import { ParticipantType } from "../../types";
import { StoreType } from "../../store/participantsStore";
import { getHostId, isHost } from ".";
import { handleNotifyConnectedParticipants } from "../../routes/call/_utils";

type ArgType = {
  participantsStore: StoreType;
  myPeer: Peer;
  myMediaStream: MediaStream;
  addParticipant: (newParticipant: ParticipantType) => void
  removeParticipant: (peerId: string) => void
  updateLastHeartbeat: (mediaConnection: MediaConnection) => void
}

export default function initCall({
  myPeer,
  participantsStore,
  myMediaStream,
  addParticipant,
  removeParticipant,
  updateLastHeartbeat,
}: ArgType): void {
      myPeer.on("call", (call) => {
        call.answer(myMediaStream);
        call.on("stream", (mediaStream) => {
          addParticipant({
            mediaConnection: call,
            mediaStream: mediaStream,
          });
        });

        if (isHost()) {
          const conn = myPeer.connect(call.peer);
          conn.on("open", () => {
            setInterval(() => {
              conn.send({
                type: "notify-connected-partcipants",
                peerIds: participantsStore
                  .getState()
                  .participants.map((p) => p.mediaConnection.peer),
              });
            }, 1000);
          });

          conn.on("data", (data) => {
            // @ts-expect-error ts-2339
            if (data?.type === "heartbeat") {
              updateLastHeartbeat(call);
            }
          });
        }
      });

      if (!isHost()) {
        setTimeout(() => {
          const userToCall = getHostId();
          const call = myPeer!.call(userToCall, myMediaStream);
          call.on("stream", (mediaStream) => {
            addParticipant({
              mediaConnection: call,
              mediaStream: mediaStream,
            });
          });
        }, 2000);

        myPeer.on("connection", (conn) => {
          conn.on("data", (data) => {
            // @ts-expect-error ts-2339
            if (data?.type === "notify-connected-partcipants") {
              const { peerIdsToCall, participantsToDisconnect } =
                handleNotifyConnectedParticipants(
                  myPeer.id,
                  // @ts-expect-error ts-2339
                  data.peerIds,
                  participantsStore.getState().participants,
                );

              peerIdsToCall.forEach((peerId) => {
                const call = myPeer!.call(peerId, myMediaStream);
                call.on("stream", (mediaStream) => {
                  addParticipant({
                    mediaConnection: call,
                    mediaStream: mediaStream,
                  });
                });
              });

              participantsToDisconnect.forEach((participant) => {
                removeParticipant(participant.mediaConnection.peer);
                participant.mediaConnection.close();
              });
            }
          });

          setInterval(() => {
            conn.send({ type: "heartbeat" });
          }, 500);
        });
      }
    }
