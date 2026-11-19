import { collision, Rect, Sprite } from "melonjs";
import type { Direction, Position } from "../../common/types";
import { getTextureAtlas } from "../../common/textures";
import type { InputComponent } from "../../components/input/input-component";
import { ControlsComponent } from "../../components/game-object/controls-component";
import { StateMachine } from "../../components/state-machine/state-machine";
import { SpeedComponent } from "../../components/game-object/speed-component";
import { DirectionComponent } from "../../components/game-object/direction-component";
import {
  AnimationComponent,
  type AnimationConfig,
} from "../../components/game-object/animation-component";

export type CharacterConfig = {
  position: Position;
  assetKey: string;
  inputComponent: InputComponent;
  animationConfig: AnimationConfig;
  // in pixels per second
  speed: number;
  id?: string;
  isPlayer: boolean;
};

export abstract class CharacterGameObject extends Sprite {
  protected _controlsComponent: ControlsComponent;
  protected _speedComponent: SpeedComponent;
  protected _directionComponent: DirectionComponent;
  protected _animationComponent: AnimationComponent;
  protected _stateMachine: StateMachine;
  protected _isPlayer: boolean;

  constructor(config: CharacterConfig) {
    const { position, assetKey, speed, animationConfig, inputComponent, id, isPlayer } = config;
    const { x, y } = position;
    // every frame of the atlas, plus one animation per Aseprite tag
    super(x, y, getTextureAtlas(assetKey).getAnimationSettings());

    // physics body covering the sprite frame; built when the character is added to the world.
    // characters pass through each other for now: no collision between them is set up yet
    this.bodyDef = {
      type: "dynamic",
      shapes: [new Rect(0, 0, this.width, this.height)],
      collisionType: isPlayer ? collision.types.PLAYER_OBJECT : collision.types.ENEMY_OBJECT,
      collisionMask:
        collision.types.ALL_OBJECT &
        ~(collision.types.PLAYER_OBJECT | collision.types.ENEMY_OBJECT),
    };

    // add components
    this._controlsComponent = new ControlsComponent(this, inputComponent);
    this._speedComponent = new SpeedComponent(this, speed);
    this._directionComponent = new DirectionComponent(this);
    this._animationComponent = new AnimationComponent(this, animationConfig);

    // add state machine
    this._stateMachine = new StateMachine(id);

    // general config
    this._isPlayer = isPlayer;
  }

  get isEnemy(): boolean {
    return !this._isPlayer;
  }

  get controls(): InputComponent {
    return this._controlsComponent.controls;
  }

  // in pixels per second
  get speed(): number {
    return this._speedComponent.speed;
  }

  get direction(): Direction {
    return this._directionComponent.direction;
  }

  set direction(value: Direction) {
    this._directionComponent.direction = value;
  }

  get animationComponent(): AnimationComponent {
    return this._animationComponent;
  }

  // called by the world every frame while the character is in it
  override update(dt: number): boolean {
    this._stateMachine.update();

    // advances the animation; returns true when the sprite needs redrawing
    return super.update(dt);
  }
}
