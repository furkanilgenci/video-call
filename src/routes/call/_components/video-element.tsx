import React from "react"

type PropsType = {
  isMe?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
  stream?: MediaStream;
};
export default function VideoElement({
  isMe = false,
  stream,
  videoRef: videoRefProp,
}: PropsType) {

  React.useEffect(() => {
    if(videoRefProp) return;

    if (internalVideoRef.current && stream) {
      internalVideoRef.current.srcObject = stream
    }
  }, [stream])


  return (
    <div className="w-full aspect-video  ">
      <video
        muted={isMe}
        className="  border-solid border-2  rounded-xl shadow-md w-full  aspect-auto object-contain "
        ref={videoRef}
        autoPlay
        playsInline
      />
    </div>
  )
}

