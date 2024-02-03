import { useParams } from "react-router"
import { getOrCreateMyPeer, getMediaStream, isHost, getHostId } from "../../services/peerjs"
import React from "react"
import Peer from "peerjs"
import VideoElement from "./_components/video-element"

export default function Call() {
  const { id } = useParams()
  const myId = id
  const myVideoRef = React.useRef<HTMLVideoElement>(null)
  const [myPeer, setMyPeer] = React.useState<Peer | null>(null)
  const [connectedStreams, setConnectedStreams] = React.useState<MediaStream[]>([])

  React.useEffect(() => {
    (async () => {
      if (!myId) {
        throw new Error("No id")
      }

      console.log('getting peer')
      const createdPeer = await getOrCreateMyPeer(myId)
      setMyPeer(createdPeer)

      const myStream = await getMediaStream()
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = myStream
      }

      createdPeer.on("call", (call) => {
        console.log("Got call")
        call.answer(myStream)
        call.on("stream", (otherStream) => {
          setConnectedStreams(current => [...current, otherStream])
        })
      })

      if (!isHost(myId)) {
        setTimeout(() => {
          const userToCall = getHostId(myId)
          console.log('calling', userToCall, myStream)
          const call = createdPeer!.call(userToCall, myStream)
          call.on("stream", (otherStream) => {
            setConnectedStreams(current => [...current, otherStream])
          }
          )
        }, 2000)
      }
    })()
  }, [])

  return (
    <div>
      <h1 className="video-page-title">Here is call the call, I am {myPeer?.id}.</h1>
      <div className="video-page-container">
        <div className="video-element-container">
          <video ref={myVideoRef} width="100%" height="100%" autoPlay muted playsInline />
        </div>
        {connectedStreams.map((stream, index) => (
          <VideoElement key={index} stream={stream} />
        ))}
      </div>
    </div>
  )
}
