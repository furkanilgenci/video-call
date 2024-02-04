import { Peer } from "peerjs"

let myPeer: Peer

// Recursive promise 🤯
export async function getOrCreateMyPeer(id: string, idOffset: number = 0): Promise<Peer> {
  console.log('called', { id, idOffset })
  if (myPeer) {
    return myPeer
  }

  return new Promise((resolve, reject) => {
    const attemptedPeer = new Peer(`${id}-${idOffset}`)

    attemptedPeer.on('error', (err) => {
      if (!err.type) {
        reject(err)
      }

      if (['invalid-id', 'browser-incompatible'].indexOf(err.type) !== -1) {
        reject(err)
      }

      if (err.type === 'unavailable-id') {
        console.log('My peer is unavailable. Trying again with a different id.')
        getOrCreateMyPeer(id, idOffset + 1).then(resolve).catch(reject)
        return
      }

      // Basically 500 for all other error types.
      const errorMessage = 'Oops. Something went wrong internally! :(: ' + err
      reject(Error(errorMessage))
    })

    attemptedPeer.on('open', () => {
      console.log('My peer is open')
      myPeer = attemptedPeer
      resolve(attemptedPeer)
    })
  })
}

export async function getMediaStream() {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: 128, height: 72,
      frameRate: {
        ideal: 30,
        max: 60
      },
      facingMode: "environment"
    },
  })

  return mediaStream
}

export function getHostId(id: string) {
  return id.split('-')[0] + '-0'
}

export function isHost(id: string) {
  return id.endsWith('-0')
}

