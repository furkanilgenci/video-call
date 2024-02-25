import { create as createStore } from "zustand";
import { ParticipantType } from "../types";

export const participantsStore = createStore<{
  participants: ParticipantType[];
  setParticipants: React.Dispatch<React.SetStateAction<ParticipantType[]>>;
}>((set) => ({
  participants: [],
  setParticipants: (arg: any) =>
    set((state) => {
      if (arg instanceof Function) {
        return { participants: arg(state.participants) };
      }
      return { participants: arg };
    }),
}));
