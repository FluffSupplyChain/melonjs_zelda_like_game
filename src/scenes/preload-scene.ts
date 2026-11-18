import { loader, state } from "melonjs";
import { SCENE_KEYS } from "./scene-keys";
import { resources } from "../common/assets";

/**
 * melonJS ships its own loading stage (registered as `state.LOADING`, with a
 * progress bar): `loader.preload()` switches to it, loads everything, and we
 * then move on to the game scene — the same job as Phaser's preload()/create().
 */
export async function preloadAssets(): Promise<void> {
  await loader.preload(resources);
  state.change(SCENE_KEYS.GAME_SCENE);
}
