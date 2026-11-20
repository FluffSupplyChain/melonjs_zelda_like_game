import { math, timer } from "melonjs";
import type { Direction, Position } from "../../common/types";
import { InputComponent } from "../../components/input/input-component";
import { IdleState } from "../../components/state-machine/states/character/idle-state";
import { CHARACTER_STATES } from "../../components/state-machine/states/character/character-states";
import { MoveState } from "../../components/state-machine/states/character/move-state";
import {
  ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MAX,
  ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MIN,
  ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_WAIT,
  ENEMY_SPIDER_SPEED,
} from "../../common/config";
import type { AnimationConfig } from "../../components/game-object/animation-component";
import { ASSET_KEYS, SPIDER_ANIMATION_KEYS } from "../../common/assets";
import { CharacterGameObject } from "../common/character-game-object";
import { DIRECTION } from "../../common/common";
import { exhaustiveGuard } from "../../common/utils";

export type SpiderConfig = {
  position: Position;
};

// gives each spider its own state machine id (shown in the logs)
let spiderCount = 0;

export class Spider extends CharacterGameObject {
  // current rotation in radians and horizontal mirror, combined into the sprite's transform
  #angle = 0;
  #isFlipped = false;
  // pending engine timer driving the movement pattern, cleared when the spider is destroyed
  #timerId: number | undefined;

  constructor(config: SpiderConfig) {
    // create animation config for component
    // (the spider has a single walk animation for every direction and state)
    const animConfig = {
      key: SPIDER_ANIMATION_KEYS.WALK,
      repeat: -1,
      ignoreIfPlaying: true,
    } as const;
    const animationConfig: AnimationConfig = {
      WALK_DOWN: animConfig,
      WALK_UP: animConfig,
      WALK_LEFT: animConfig,
      WALK_RIGHT: animConfig,
      IDLE_DOWN: animConfig,
      IDLE_UP: animConfig,
      IDLE_LEFT: animConfig,
      IDLE_RIGHT: animConfig,
    };

    spiderCount += 1;
    super({
      position: config.position,
      assetKey: ASSET_KEYS.SPIDER,
      id: `spider-${spiderCount}`,
      isPlayer: false,
      animationConfig,
      speed: ENEMY_SPIDER_SPEED,
      // driven by the simple ai below rather than by a keyboard
      inputComponent: new InputComponent(),
    });

    // add shared components
    this._directionComponent.callback = (direction: Direction) => {
      this.#handleDirectionChange(direction);
    };

    // add state machine
    this._stateMachine.addState(new IdleState(this));
    this._stateMachine.addState(new MoveState(this));
    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);

    // start simple ai movement pattern
    this.#scheduleDirectionChange();
  }

  // called when the spider is removed from the world (including when the scene is left)
  override onDestroyEvent(...args: unknown[]): void {
    if (this.#timerId !== undefined) {
      timer.clearTimeout(this.#timerId);
      this.#timerId = undefined;
    }
    super.onDestroyEvent(...args);
  }

  #handleDirectionChange(direction: Direction): void {
    switch (direction) {
      case DIRECTION.DOWN:
        this.#setAngle(0);
        return;
      case DIRECTION.UP:
        this.#setAngle(180);
        return;
      case DIRECTION.LEFT:
        this.#setAngle(90);
        return;
      case DIRECTION.RIGHT:
        this.#setAngle(270);
        return;
      default:
        exhaustiveGuard(direction);
    }
  }

  // the built-in flipX mirrors the sprite on the screen, after its rotation: a spider rotated to
  // face left would end up facing right. Mirror it in its own frame instead, before the rotation
  override flipX(flip = true): this {
    if (flip !== this.#isFlipped) {
      this.#isFlipped = flip;
      this.#updateTransform();
    }
    return this;
  }

  // rotates the sprite to an absolute angle in degrees (clockwise, around its centre)
  #setAngle(degrees: number): void {
    this.#angle = math.degToRad(degrees);
    this.#updateTransform();
  }

  // rebuilds the transform from scratch: rotation, then the mirror in the sprite's own frame
  #updateTransform(): void {
    this.currentTransform.identity().rotate(this.#angle);
    if (this.#isFlipped) {
      this.currentTransform.scale(-1, 1);
    }
    this.updateBounds();
    this.isDirty = true;
  }

  #scheduleDirectionChange(): void {
    // math.random excludes its max, hence the + 1
    const delay = math.random(
      ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MIN,
      ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MAX + 1,
    );
    // engine timers follow the game's pause state
    this.#timerId = timer.setTimeout(() => this.#changeDirection(), delay, true);
  }

  #changeDirection(): void {
    // reset existing enemy input
    this.controls.reset();

    // wait a small period of time and then choose a random direction to move
    this.#timerId = timer.setTimeout(
      () => {
        const randomDirection = math.random(0, 4);
        if (randomDirection === 0) {
          this.controls.isUpDown = true;
        } else if (randomDirection === 1) {
          this.controls.isRightDown = true;
        } else if (randomDirection === 2) {
          this.controls.isDownDown = true;
        } else {
          this.controls.isLeftDown = true;
        }

        // set up event for next direction change
        this.#scheduleDirectionChange();
      },
      ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_WAIT,
      true,
    );
  }
}
