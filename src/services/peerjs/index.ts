import { Peer } from "peerjs";

let myPeer: Peer;

export async function createOrGetMyPeer(id: string) {
  if (myPeer) {
    return myPeer;
  }

  myPeer = new Peer(id);
  return myPeer;
}

export async function getMediaStream() {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });

  return mediaStream;
}


export function getMyPeer() {
  return myPeer;
}

export function connectToPeer(id: string) {
  return myPeer.connect(id);
}
