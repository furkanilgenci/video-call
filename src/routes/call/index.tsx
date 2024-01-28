import { useParams } from "react-router";
import { createOrGetMyPeer, getMediaStream } from "../../services/peerjs";
import React from "react";
import Peer from "peerjs";


// temp
function getOtherUserId(id: string) {
  return id === "furkan-1" ? "furkan-2" : "furkan-1";
}

export default function Call() {
  const { id } = useParams();
  const myId = `furkan-${id}`;
  const myVideoRef = React.useRef<HTMLVideoElement>(null);
  const otherVideoRef = React.useRef<HTMLVideoElement>(null);
  const myPeer = React.useRef<Peer | null>(null);

  React.useEffect(() => {
    (async () => {
      if (!myId) {
        throw new Error("No id");
      }

      myPeer.current = await createOrGetMyPeer(myId);

      const myStream = await getMediaStream();
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = myStream;
      }

      myPeer.current.on("call", (call) => {
        console.log("Got call");
        call.answer(myStream);
        call.on("stream", (otherStream) => {
          if (otherVideoRef.current) {
            otherVideoRef.current.srcObject = otherStream;
          }
        });
      });

      console.log('calling', getOtherUserId(myId), myStream)
      setTimeout(() => {
        const call = myPeer.current!.call(getOtherUserId(myId), myStream);
        call.on("stream", (otherStream) => {
          if (otherVideoRef.current) {
            otherVideoRef.current.srcObject = otherStream;
          }
        }
      );
      }, 2000)
    })()
  }, [])

  return (
    <div>
      <p>Here is call {myId}. The other user is {getOtherUserId(myId)}</p>
      <div>
        <video ref={myVideoRef} width="64" height="48" autoPlay />
        <video ref={otherVideoRef} width="64" height="48" autoPlay />
      </div>
    </div>
  );
}
