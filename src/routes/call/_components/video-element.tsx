import React from "react"

type PropsType = {
  stream: MediaStream
}
export default function VideoElement({ stream }: PropsType) {
  const myVideoRef = React.useRef<HTMLVideoElement>(null)

  React.useEffect(() => {
    if (myVideoRef.current) {
      myVideoRef.current.srcObject = stream
    }
  }, [stream])


  return (
    <div className="video-element-container">
      <video ref={myVideoRef} width="100%" height="100%" autoPlay />
    </div>
  )
}

