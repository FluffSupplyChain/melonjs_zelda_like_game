import { state } from "melonjs";

// melonJS identifies scenes (stages) by numeric state ids rather than strings.
export const SCENE_KEYS = {
  PRELOAD_SCENE: state.LOADING,
  GAME_SCENE: state.PLAY,
} as const;
