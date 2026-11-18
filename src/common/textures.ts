import { loader, TextureAtlas } from "melonjs";
import { ASSET_KEYS } from "./assets";

const atlases = new Map<string, TextureAtlas>();

/**
 * Build the texture atlases once, right after preloading, and share them between
 * scenes. Aseprite JSON exports carry their animation tags (`meta.frameTags`):
 * `atlas.getAnimationSettings()` turns each tag into a named animation, with
 * each frame's own duration.
 */
export function createTextureAtlases(): void {
  for (const key of [ASSET_KEYS.PLAYER]) {
    const image = loader.getImage(key);
    console.log("what we get from loader.getImage(key) : ", image);
    if (image === null) {
      throw new Error(`Image "${key}" not loaded; add it to the resources list`);
    }
    atlases.set(key, new TextureAtlas(loader.getJSON(key), image));
  }
}

export function getTextureAtlas(key: string): TextureAtlas {
  const atlas = atlases.get(key);
  if (atlas === undefined) {
    throw new Error(`Texture atlas "${key}" not created; add it to createTextureAtlases()`);
  }
  return atlas;
}
