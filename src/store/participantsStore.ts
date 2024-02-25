import { create as createStore } from "zustand";
import type { MediaConnection } from "peerjs";
import { ParticipantType } from "../types";

function isFunction(arg: any): arg is Function {
  return typeof arg === "function";
}

export const participantsStore = createStore<{
  participants: ParticipantType[];
  setParticipants: React.Dispatch<React.SetStateAction<ParticipantType[]>>;
  updateLastHeartbeat: (mediaConnection: MediaConnection) => void;
  addParticipant: (newParticipant: ParticipantType) => void;
  removeParticipant: (peerId: string) => void;
  addScreenShareParticipant: (screenShareParticipant: ParticipantType) => void;
}>((set, getState) => ({
  participants: [],
  setParticipants: (arg: any) =>
    set((state) => {
      // To be compatible with React useState API
      return { participants: isFunction(arg) ? arg(state) : arg };
    }),

  // actions
  addParticipant(newParticipant: ParticipantType) {
    const { participants, setParticipants } = getState();

    // Add new participant to the list, if not already present using a set
    const newParticipants = Array.from(
      new Set([...participants, newParticipant]),
    );
    setParticipants(newParticipants);
  },
  removeParticipant(peerId: string) {
    const { participants, setParticipants } = getState();

    setParticipants(
      participants.filter((p) => p.mediaConnection.peer !== peerId),
    );
  },
  addScreenShareParticipant(screenShareParticipant: ParticipantType) {
    const { participants, setParticipants } = getState();

    // Add new participant to the list, if not already present using a set
    const newParticipants = Array.from(
      new Set([...participants, screenShareParticipant]),
    );
    setParticipants(newParticipants);
  },
  updateLastHeartbeat: (mediaConnection: MediaConnection) => {
    set((state) => {
      return {
        participants: state.participants.map((p) => {
          if (p.mediaConnection.peer === mediaConnection.peer) {
            return {
              ...p,
              lastHeartbeat: Date.now(),
            };
          }
          return p;
        }),
      };
    });
  },
}));

export type StoreType = typeof participantsStore;
