import { useParams } from "react-router";
import {
  getOrCreateMyPeer,
  getMyMediaStream,
  isHost,
  getHostId,
} from "../../services/peerjs";
import React from "react";
import Peer from "peerjs";
import VideoElement from "./_components/video-element";
import { useState } from "react";
import {
  ParticipantType,
  addParticipant,
  handleHeartbeat,
  removeInactiveParticipants,
} from "./_utils";

export default function Call() {
  const myVideoRef = React.useRef<HTMLVideoElement>(null);
  const [myPeer, setMyPeer] = React.useState<Peer | null>(null);
  const [videoStatus, setVideoStatus] = useState(true);
  const [micStatus, setMicStatus] = useState(true);
  const [participants, setParticipants] = React.useState<ParticipantType[]>([]);
  const { callId } = useParams();

  React.useEffect(() => {
    const interval = setInterval(
      () => removeInactiveParticipants(setParticipants),
      500,
    );
    return () => {
      clearInterval(interval);
    };
  }, []);

  React.useEffect(() => {
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

      let usersCount = 0;
      createdPeer.on("call", (call) => {
        call.answer(myMediaStream);
        call.on("stream", (mediaStream) => {
          addParticipant(setParticipants, {
            mediaConnection: call,
            mediaStream: mediaStream,
          });
        });

        // if host, send how many people are connected to the call
        if (isHost()) {
          usersCount++;
          const conn = createdPeer.connect(call.peer);
          conn.on("open", () => {
            conn.send(usersCount);
          });

          conn.on("data", (data) => {
            if (data === "heartbeat") {
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
          let usersCount = 0;
          conn.on("data", (data) => {
            usersCount = data as number;

            // After receiving the number of users, call the rest of the users
            for (let i = 1; i < usersCount; i++) {
              setTimeout(() => {
                const userToCall = `${callId}-${i}`;
                const call = createdPeer!.call(userToCall, myMediaStream);
                call.on("stream", (mediaStream) => {
                  addParticipant(setParticipants, {
                    mediaConnection: call,
                    mediaStream: mediaStream,
                  });
                });
              }, 2000);
            }
          });

          setInterval(() => {
            conn.send("heartbeat");
          }, 1000);
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
          <VideoElement videoRef={myVideoRef} />
          {...participants.map((participant, index) => (
            <VideoElement key={index} stream={participant.mediaStream} />
          ))}
        </div>
      </div>
    </div>
  );
}
