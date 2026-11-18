import { collision, Rect, Sprite, Vector2d } from "melonjs";
import type { Position } from "../../common/types";
import { PLAYER_ANIMATION_KEYS } from "../../common/assets";
import { getTextureAtlas } from "../../common/textures";
import type { InputComponent } from "../../components/input/input-component";
import { ControlsComponent } from "../../components/game-object/controls-component";
import { isPhysicsBody } from "../../common/utils";

export type PlayerConfig = {
  position: Position;
  assetKey: string;
  controls: InputComponent;
};

// 80 pixels per second; the built-in physics counts velocity in pixels per step (60 steps a second)
const PLAYER_SPEED = 80 / 60;

export class Player extends Sprite {
  #controlsComponent: ControlsComponent;
  // direction requested by the controls this frame, scaled to the speed before reaching the body
  #velocity = new Vector2d(0, 0);

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
      this.setCurrentAnimation(PLAYER_ANIMATION_KEYS.WALK_UP);
      this.#updateVelocity(false, -1);
    } else if (controls.isDownDown) {
      this.setCurrentAnimation(PLAYER_ANIMATION_KEYS.WALK_DOWN);
      this.#updateVelocity(false, 1);
    } else {
      this.#updateVelocity(false, 0);
    }

    // horizontal movement
    const isMovingVertically = controls.isDownDown || controls.isUpDown;
    if (controls.isLeftDown) {
      this.flipX(true);
      this.#updateVelocity(true, -1);
      if (!isMovingVertically) {
        this.setCurrentAnimation(PLAYER_ANIMATION_KEYS.WALK_SIDE);
      }
    } else if (controls.isRightDown) {
      this.flipX(false);
      this.#updateVelocity(true, 1);
      if (!isMovingVertically) {
        this.setCurrentAnimation(PLAYER_ANIMATION_KEYS.WALK_SIDE);
      }
    } else {
      this.#updateVelocity(true, 0);
    }

    // if no input is provided, show idle animation
    if (
      !controls.isDownDown &&
      !controls.isUpDown &&
      !controls.isLeftDown &&
      !controls.isRightDown
    ) {
      this.setCurrentAnimation(PLAYER_ANIMATION_KEYS.IDLE_DOWN);
    }

    this.#normalizeVelocity();

    // advances the animation; returns true when the sprite needs redrawing
    return super.update(dt);
  }

  #updateVelocity(isX: boolean, value: number): void {
    if (isX) {
      this.#velocity.x = value;
      return;
    }
    this.#velocity.y = value;
  }

  #normalizeVelocity(): void {
    // if the player is moving diagonally, the resultant vector will have a magnitude greater than the defined speed.
    // if we normalize the vector, this will make sure the magnitude matches defined speed
    // (normalizing a zero vector leaves it at zero, so standing still stays still)
    if (!isPhysicsBody(this.body)) {
      return;
    }
    this.#velocity.normalize().scale(PLAYER_SPEED);
    this.body.setVelocity(this.#velocity.x, this.#velocity.y);
  }
}
