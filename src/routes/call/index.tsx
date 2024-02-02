import { useParams } from "react-router";
import { getOrCreateMyPeer, getMediaStream } from "../../services/peerjs";
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
  const [myPeer, setMyPeer] = React.useState<Peer | null>(null);

  React.useEffect(() => {
    (async () => {
      if (!myId) {
        throw new Error("No id");
      }

      console.log('getting peer')
      const createdPeer = await getOrCreateMyPeer(myId);
      setMyPeer(createdPeer);

      const myStream = await getMediaStream();
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = myStream;
      }

      createdPeer.on("call", (call) => {
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
        const call = myPeer!.call(getOtherUserId(myId), myStream);
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
      <h1 className="video-page-title">Here is call {myPeer?.id}. The other user is {getOtherUserId(myId)}</h1>
      <div className="video-page-container">
        <div className="video-element-container">
          <video ref={myVideoRef} width="100%" height="100%" autoPlay />
        </div>
        <div className="video-element-container">
          <video ref={otherVideoRef} width="100%" height="100%" autoPlay />
        </div>
      </div>
    </div>
  );
}
