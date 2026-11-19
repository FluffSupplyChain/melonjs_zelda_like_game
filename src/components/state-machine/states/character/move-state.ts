import { Vector2d } from "melonjs";
import { PLAYER_ANIMATION_KEYS } from "../../../../common/assets";
import { BaseCharacterState } from "./base-character-state";
import { CHARACTER_STATES } from "./character-states";
import type { Player } from "../../../../game-objects/player/player";
import { isPhysicsBody } from "../../../../common/utils";

// 80 pixels per second; the built-in physics counts velocity in pixels per step (60 steps a second)
const SPEED = 80 / 60;

export class MoveState extends BaseCharacterState {
  // direction requested by the controls this frame, scaled to the speed before reaching the body
  #velocity = new Vector2d(0, 0);

  constructor(gameObject: Player) {
    super(CHARACTER_STATES.MOVE_STATE, gameObject);
  }

  public onUpdate(): void {
    const controls = this._gameObject.controls;

    // if no input is provided transition back to idle state
    if (
      !controls.isDownDown &&
      !controls.isUpDown &&
      !controls.isLeftDown &&
      !controls.isRightDown
    ) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      return;
    }

    // selecting the animation already playing is a no-op, so this never restarts it

    // vertical movement
    if (controls.isUpDown) {
      this._gameObject.setCurrentAnimation(PLAYER_ANIMATION_KEYS.WALK_UP);
      this.#updateVelocity(false, -1);
    } else if (controls.isDownDown) {
      this._gameObject.setCurrentAnimation(PLAYER_ANIMATION_KEYS.WALK_DOWN);
      this.#updateVelocity(false, 1);
    } else {
      this.#updateVelocity(false, 0);
    }

    const isMovingVertically = controls.isDownDown || controls.isUpDown;
    // horizontal movement
    if (controls.isLeftDown) {
      this.#flip(true);
      this.#updateVelocity(true, -1);
      if (!isMovingVertically) {
        this._gameObject.setCurrentAnimation(PLAYER_ANIMATION_KEYS.WALK_SIDE);
      }
    } else if (controls.isRightDown) {
      this.#flip(false);
      this.#updateVelocity(true, 1);
      if (!isMovingVertically) {
        this._gameObject.setCurrentAnimation(PLAYER_ANIMATION_KEYS.WALK_SIDE);
      }
    } else {
      this.#updateVelocity(true, 0);
    }

    this.#normalizeVelocity();
  }

  #normalizeVelocity(): void {
    // if the player is moving diagonally, the resultant vector will have a magnitude greater than the defined speed.
    // if we normalize the vector, this will make sure the magnitude matches defined speed
    if (!isPhysicsBody(this._gameObject.body)) {
      return;
    }
    this.#velocity.normalize().scale(SPEED);
    this._gameObject.body.setVelocity(this.#velocity.x, this.#velocity.y);
  }

  #flip(value: boolean): void {
    this._gameObject.flipX(value);
  }

  #updateVelocity(isX: boolean, value: number): void {
    if (isX) {
      this.#velocity.x = value;
      return;
    }
    this.#velocity.y = value;
  }
}
