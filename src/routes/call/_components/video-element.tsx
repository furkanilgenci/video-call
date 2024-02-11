import React from "react"

type PropsType = {
  videoRef?: React.RefObject<HTMLVideoElement>
  stream?: MediaStream
}
export default function VideoElement({ stream, videoRef: videoRefProp }: PropsType) {
  const internalVideoRef = React.useRef<HTMLVideoElement>(null)
  const videoRef = videoRefProp || internalVideoRef

  React.useEffect(() => {
    if(videoRefProp) return;

    if (internalVideoRef.current && stream) {
      internalVideoRef.current.srcObject = stream
    }
  }, [stream])


  return (
      <div className="w-full aspect-video  ">
        <video
          className="  border-solid border-2  rounded-xl shadow-md w-full  aspect-auto object-contain "
          ref={videoRef}
          autoPlay
          muted
          playsInline
        />
    </div>
  )
}

