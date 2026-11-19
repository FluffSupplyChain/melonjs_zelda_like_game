import type { Position } from "../../common/types";
import { InputComponent } from "../../components/input/input-component";
import { IdleState } from "../../components/state-machine/states/character/idle-state";
import { CHARACTER_STATES } from "../../components/state-machine/states/character/character-states";
import { MoveState } from "../../components/state-machine/states/character/move-state";
import { ENEMY_SPIDER_SPEED } from "../../common/config";
import type { AnimationConfig } from "../../components/game-object/animation-component";
import { ASSET_KEYS, SPIDER_ANIMATION_KEYS } from "../../common/assets";
import { CharacterGameObject } from "../common/character-game-object";

export type SpiderConfig = {
  position: Position;
};

// gives each spider its own state machine id (shown in the logs)
let spiderCount = 0;

export class Spider extends CharacterGameObject {
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
      // no input source yet: nothing ever asks the spider to move
      inputComponent: new InputComponent(),
    });

    // add state machine
    this._stateMachine.addState(new IdleState(this));
    this._stateMachine.addState(new MoveState(this));
    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
  }
}
