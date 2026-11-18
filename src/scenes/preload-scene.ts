import { loader, state } from "melonjs";
import { SCENE_KEYS } from "./scene-keys";
import { resources } from "../common/assets";
import { createTextureAtlases } from "../common/textures";

/**
 * melonJS ships its own loading stage (registered as `state.LOADING`, with a
 * progress bar): `loader.preload()` switches to it and loads everything, then
 * the texture atlases (and their animations) are built and the game scene starts.
 */
export async function preloadAssets(): Promise<void> {
  await loader.preload(resources);
  createTextureAtlases();
  state.change(SCENE_KEYS.GAME_SCENE);
}
