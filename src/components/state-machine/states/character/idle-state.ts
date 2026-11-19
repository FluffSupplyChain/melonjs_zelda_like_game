import { isPhysicsBody } from "../../../../common/utils";
import { BaseCharacterState } from "./base-character-state";
import { CHARACTER_STATES } from "./character-states";
import type { Player } from "../../../../game-objects/player/player";

export class IdleState extends BaseCharacterState {
  constructor(gameObject: Player) {
    super(CHARACTER_STATES.IDLE_STATE, gameObject);
  }

  public onEnter(): void {
    // play idle animation based on game object direction
    this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);

    // reset game object velocity
    // (the body only exists once the player is in the world)
    if (isPhysicsBody(this._gameObject.body)) {
      this._gameObject.body.setVelocity(0, 0);
    }
  }

  public onUpdate(): void {
    const controls = this._gameObject.controls;

    // if no other input is provided, do nothing
    if (
      !controls.isDownDown &&
      !controls.isUpDown &&
      !controls.isLeftDown &&
      !controls.isRightDown
    ) {
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.MOVE_STATE);
  }
}
