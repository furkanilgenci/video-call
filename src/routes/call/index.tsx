import { useParams } from "react-router";
import {
  getOrCreateMyPeer,
  getMyMediaStream,
  isHost,
  getHostId,
  getDisplayMediaStream,
  getOrCreateMyScreensharePeer,
} from "../../services/peerjs";
import { useEffect, useRef } from "react";
import Peer from "peerjs";
import VideoElement from "./_components/video-element";
import { useState } from "react";
import {
  addParticipant,
  handleHeartbeat,
  handleNotifyConnectedParticipants,
  removeInactiveParticipants,
  removeParticipant,
} from "./_utils";
import { participantsStore } from "../../store/participantsStore";

export default function Call() {
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const myScreenshareRef = useRef<HTMLVideoElement>(null);
  const [myPeer, setMyPeer] = useState<Peer | null>(null);
  const [myScreensharePeer, setMyScreensharePeer] = useState<Peer | null>(null);
  const [videoStatus, setVideoStatus] = useState(true);
  const [micStatus, setMicStatus] = useState(true);
  const { participants, setParticipants } = participantsStore();
  const { callId } = useParams();

  useEffect(() => {
    const interval = setInterval(
      () => removeInactiveParticipants(setParticipants),
      500,
    );
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (myPeer) return;
      if (!callId) {
        throw new Error("No id");
      }

      const createdPeer = await getOrCreateMyPeer(callId);
      setMyPeer(createdPeer);

      const myMediaStream = await getMyMediaStream();
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = myMediaStream;
      }

      createdPeer.on("call", (call) => {
        call.answer(myMediaStream);
        call.on("stream", (mediaStream) => {
          addParticipant(setParticipants, {
            mediaConnection: call,
            mediaStream: mediaStream,
          });
        });

        if (isHost()) {
          const conn = createdPeer.connect(call.peer);
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
            // @ts-ignore
            if (data?.type === "heartbeat") {
              handleHeartbeat(setParticipants, call);
            }
          });
        }
      });

      if (!isHost()) {
        setTimeout(() => {
          const userToCall = getHostId();
          const call = createdPeer!.call(userToCall, myMediaStream);
          call.on("stream", (mediaStream) => {
            addParticipant(setParticipants, {
              mediaConnection: call,
              mediaStream: mediaStream,
            });
          });
        }, 2000);

        createdPeer.on("connection", (conn) => {
          conn.on("data", (data) => {
            // @ts-ignore
            if (data?.type === "notify-connected-partcipants") {
              const { peerIdsToCall, participantsToDisconnect } =
                handleNotifyConnectedParticipants(
                  createdPeer.id,
                  // @ts-ignore
                  data.peerIds,
                  participantsStore.getState().participants
                );

              peerIdsToCall.forEach((peerId) => {
                const call = createdPeer!.call(peerId, myMediaStream);
                call.on("stream", (mediaStream) => {
                  addParticipant(setParticipants, {
                    mediaConnection: call,
                    mediaStream: mediaStream,
                  });
                });
              });

              participantsToDisconnect.forEach((participant) => {
                removeParticipant(
                  setParticipants,
                  participant.mediaConnection.peer
                );
                participant.mediaConnection.close();
              });
            }
          });

          setInterval(() => {
            conn.send({ type: "heartbeat" });
          }, 500);
        });
      }
    })();
  }, []);

  const handleMicrophone = () => {
    const videoRef = myVideoRef.current;
    if (videoRef && videoRef.srcObject instanceof MediaStream) {
      const tracks = videoRef.srcObject.getAudioTracks();
      setMicStatus(!micStatus);
      tracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  const handleVideo = () => {
    const videoRef = myVideoRef.current;
    if (videoRef && videoRef.srcObject instanceof MediaStream) {
      const tracks = videoRef.srcObject.getVideoTracks();
      setVideoStatus(!videoStatus);
      tracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  const handleScreenshare = async () => {
    if (myScreensharePeer) {
      myScreensharePeer.disconnect();
      setMyScreensharePeer(null);
    } else {
      const myScreensharePeer = getOrCreateMyScreensharePeer();
      const myScreenshareMediaStream = await getDisplayMediaStream();
      const userToCall = getHostId();

      if (myScreenshareRef.current) {
        myScreenshareRef.current.srcObject = myScreenshareMediaStream;
      }

      myScreensharePeer.call(userToCall, myScreenshareMediaStream, {
        metadata: { type: "screenshare", ownerPeerId: myPeer!.id },
      });

      setMyScreensharePeer(myScreensharePeer);
    }
  };

  return (
    <div>
      <div className="flex grid font-mono h-max ontent-center p-20">
        <div>
          <h1 className=" h2 text-center text-2xl m-2">
            Here is call the call, I am {myPeer?.id}.
          </h1>
          <div className="flex justify-around">
            <button
              className="bg-gray-50 hover:bg-gray-100 active:bg-gray-200  rounded-md shadow-md cursor-pointer m-2 w-1/4"
              onClick={handleScreenshare}
            >
              {!myScreensharePeer ? "Screenshare on" : "Screenshare off"}
            </button>
            <button
              className="bg-gray-50 hover:bg-gray-100 active:bg-gray-200  rounded-md shadow-md cursor-pointer m-2 w-1/4"
              onClick={handleMicrophone}
            >
              {micStatus ? "Mic On" : "Mic Off"}
            </button>
            <button
              className="bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-md shadow-md cursor-pointer m-2 w-1/4"
              onClick={handleVideo}
            >
              {videoStatus ? "Video On" : "Video Off"}
            </button>
          </div>
        </div>
        <div className="grid xl:grid-cols-2 sm:grid-cols-1 gap-6 p-5  grow">
          <VideoElement videoRef={myVideoRef} isMe />
          {myScreensharePeer && (
            <VideoElement videoRef={myScreenshareRef} isMe isScreenshare />
          )}
          {...participants.map((participant, index) => (
            <VideoElement
              key={index}
              stream={participant.mediaStream}
              isScreenshare={
                participant.mediaConnection.metadata?.type === "screenshare"
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
