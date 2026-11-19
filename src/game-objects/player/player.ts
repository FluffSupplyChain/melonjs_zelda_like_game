import { collision, Rect, Sprite } from "melonjs";
import type { Direction, Position } from "../../common/types";
import { getTextureAtlas } from "../../common/textures";
import type { InputComponent } from "../../components/input/input-component";
import { ControlsComponent } from "../../components/game-object/controls-component";
import { StateMachine } from "../../components/state-machine/state-machine";
import { IdleState } from "../../components/state-machine/states/character/idle-state";
import { CHARACTER_STATES } from "../../components/state-machine/states/character/character-states";
import { MoveState } from "../../components/state-machine/states/character/move-state";
import { SpeedComponent } from "../../components/game-object/speed-component";
import { PLAYER_SPEED } from "../../common/config";
import { DirectionComponent } from "../../components/game-object/direction-component";
import {
  AnimationComponent,
  type AnimationConfig,
} from "../../components/game-object/animation-component";
import { PLAYER_ANIMATION_KEYS } from "../../common/assets";

export type PlayerConfig = {
  position: Position;
  assetKey: string;
  controls: InputComponent;
};

export class Player extends Sprite {
  #controlsComponent: ControlsComponent;
  #speedComponent: SpeedComponent;
  #directionComponent: DirectionComponent;
  #animationComponent: AnimationComponent;
  #stateMachine: StateMachine;

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

    // create animation config for component
    // (left and right share the side animations; the sprite is mirrored for left)
    const animationConfig: AnimationConfig = {
      WALK_DOWN: { key: PLAYER_ANIMATION_KEYS.WALK_DOWN, repeat: -1, ignoreIfPlaying: true },
      WALK_UP: { key: PLAYER_ANIMATION_KEYS.WALK_UP, repeat: -1, ignoreIfPlaying: true },
      WALK_LEFT: { key: PLAYER_ANIMATION_KEYS.WALK_SIDE, repeat: -1, ignoreIfPlaying: true },
      WALK_RIGHT: { key: PLAYER_ANIMATION_KEYS.WALK_SIDE, repeat: -1, ignoreIfPlaying: true },
      IDLE_DOWN: { key: PLAYER_ANIMATION_KEYS.IDLE_DOWN, repeat: -1, ignoreIfPlaying: true },
      IDLE_UP: { key: PLAYER_ANIMATION_KEYS.IDLE_UP, repeat: -1, ignoreIfPlaying: true },
      IDLE_LEFT: { key: PLAYER_ANIMATION_KEYS.IDLE_SIDE, repeat: -1, ignoreIfPlaying: true },
      IDLE_RIGHT: { key: PLAYER_ANIMATION_KEYS.IDLE_SIDE, repeat: -1, ignoreIfPlaying: true },
    };

    // add components
    this.#controlsComponent = new ControlsComponent(this, config.controls);
    this.#speedComponent = new SpeedComponent(this, PLAYER_SPEED);
    this.#directionComponent = new DirectionComponent(this);
    this.#animationComponent = new AnimationComponent(this, animationConfig);

    // add state machine
    this.#stateMachine = new StateMachine("player");
    this.#stateMachine.addState(new IdleState(this));
    this.#stateMachine.addState(new MoveState(this));
    this.#stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
  }

  get controls(): InputComponent {
    return this.#controlsComponent.controls;
  }

  // in pixels per second
  get speed(): number {
    return this.#speedComponent.speed;
  }

  get direction(): Direction {
    return this.#directionComponent.direction;
  }

  set direction(value: Direction) {
    this.#directionComponent.direction = value;
  }

  get animationComponent(): AnimationComponent {
    return this.#animationComponent;
  }

  // called by the world every frame while the player is in it
  override update(dt: number): boolean {
    this.#stateMachine.update();

    // advances the animation; returns true when the sprite needs redrawing
    return super.update(dt);
  }
}
