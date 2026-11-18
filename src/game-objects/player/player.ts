import { collision, Rect, Sprite } from "melonjs";
import type { Position } from "../../common/types";
import { PLAYER_ANIMATION_KEYS } from "../../common/assets";
import { getTextureAtlas } from "../../common/textures";

export type PlayerConfig = {
  position: Position;
  assetKey: string;
};

export class Player extends Sprite {
  constructor(config: PlayerConfig) {
    const { position, assetKey } = config;
    const { x, y } = position;
    // every frame of the atlas, plus one animation per Aseprite tag
    super(x, y, getTextureAtlas(assetKey).getAnimationSettings());

    // physics body covering the sprite frame; built when the player is added to the world
    this.bodyDef = {
      type: "dynamic",
      shapes: [new Rect(0, 0, this.width, this.height)],
      collisionType: collision.types.PLAYER_OBJECT,
    };

    // loops forever unless told otherwise
    this.setCurrentAnimation(PLAYER_ANIMATION_KEYS.IDLE_DOWN);
  }
}
