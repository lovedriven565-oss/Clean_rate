import { create } from "zustand";

interface TransitionState {
  active: boolean;
  x: number;
  y: number;
  target: string | null;
  color: string;
  trigger: (x: number, y: number, target: string, color: string) => void;
  reset: () => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
  active: false,
  x: 0,
  y: 0,
  target: null,
  color: "#0b0e11",
  trigger: (x, y, target, color) => set({ active: true, x, y, target, color }),
  reset: () => set({ active: false, target: null }),
}));
