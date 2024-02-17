import React from "react";

type PropsType = {
  isMe?: boolean;
  isScreenshare?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
  stream?: MediaStream;
};
export default function VideoElement({
  isMe = false,
  isScreenshare = false,
  stream,
  videoRef: videoRefProp,
}: PropsType) {
  const internalVideoRef = React.useRef<HTMLVideoElement>(null);
  const videoRef = videoRefProp || internalVideoRef;

  React.useEffect(() => {
    if (videoRefProp) return;

    if (internalVideoRef.current && stream) {
      internalVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className="w-full aspect-video"
      style={isScreenshare ? { border: "2px solid red" } : undefined}
    >
      <video
        muted={isMe}
        className="  border-solid border-2  rounded-xl shadow-md w-full  aspect-auto object-contain "
        ref={videoRef}
        autoPlay
        playsInline
      />
    </div>
  );
}
