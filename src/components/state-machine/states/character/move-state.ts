import { Vector2d } from "melonjs";
import { BaseCharacterState } from "./base-character-state";
import { CHARACTER_STATES } from "./character-states";
import type { CharacterGameObject } from "../../../../game-objects/common/character-game-object";
import { isPhysicsBody } from "../../../../common/utils";
import type { Direction } from "../../../../common/types";
import { DIRECTION } from "../../../../common/common";

export class MoveState extends BaseCharacterState {
  // direction requested by the controls this frame, scaled to the speed before reaching the body
  #velocity = new Vector2d(0, 0);

  constructor(gameObject: CharacterGameObject) {
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

    // vertical movement
    if (controls.isUpDown) {
      this.#updateVelocity(false, -1);
      this.#updateDirection(DIRECTION.UP);
    } else if (controls.isDownDown) {
      this.#updateVelocity(false, 1);
      this.#updateDirection(DIRECTION.DOWN);
    } else {
      this.#updateVelocity(false, 0);
    }

    const isMovingVertically = controls.isDownDown || controls.isUpDown;
    // horizontal movement
    if (controls.isLeftDown) {
      this.#flip(true);
      this.#updateVelocity(true, -1);
      if (!isMovingVertically) {
        this.#updateDirection(DIRECTION.LEFT);
      }
    } else if (controls.isRightDown) {
      this.#flip(false);
      this.#updateVelocity(true, 1);
      if (!isMovingVertically) {
        this.#updateDirection(DIRECTION.RIGHT);
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
    // the speed is in pixels per second; the built-in physics counts velocity in pixels per step (60 steps a second)
    this.#velocity.normalize().scale(this._gameObject.speed / 60);
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

  #updateDirection(direction: Direction): void {
    this._gameObject.direction = direction;
    this._gameObject.animationComponent.playAnimation(`WALK_${this._gameObject.direction}`);
  }
}
