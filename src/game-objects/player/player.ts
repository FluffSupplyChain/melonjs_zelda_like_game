import { collision, Rect, Sprite } from "melonjs";
import type { Position } from "../../common/types";
import { PLAYER_ANIMATION_KEYS } from "../../common/assets";
import { getTextureAtlas } from "../../common/textures";
import type { InputComponent } from "../../components/input/input-component";
import { ControlsComponent } from "../../components/game-object/controls-component";

export type PlayerConfig = {
  position: Position;
  assetKey: string;
  controls: InputComponent;
};

export class Player extends Sprite {
  #controlsComponent: ControlsComponent;

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

    // add components
    this.#controlsComponent = new ControlsComponent(this, config.controls);

    // loops forever unless told otherwise
    this.setCurrentAnimation(PLAYER_ANIMATION_KEYS.IDLE_DOWN);
  }

  // called by the world every frame while the player is in it
  override update(dt: number): boolean {
    const controls = this.#controlsComponent.controls;
    // selecting the animation already playing is a no-op, so this never restarts it

    // vertical movement
    if (controls.isUpDown) {
      this.setCurrentAnimation(PLAYER_ANIMATION_KEYS.IDLE_UP);
    } else if (controls.isDownDown) {
      this.setCurrentAnimation(PLAYER_ANIMATION_KEYS.IDLE_DOWN);
    }

    // horizontal movement
    if (controls.isLeftDown) {
      this.flipX(true);
      this.setCurrentAnimation(PLAYER_ANIMATION_KEYS.IDLE_SIDE);
    } else if (controls.isRightDown) {
      this.flipX(false);
      this.setCurrentAnimation(PLAYER_ANIMATION_KEYS.IDLE_SIDE);
    }

    // advances the animation; returns true when the sprite needs redrawing
    return super.update(dt);
  }
}
