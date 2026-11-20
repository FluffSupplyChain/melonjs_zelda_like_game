import { collision, Rect, Sprite } from "melonjs";
import type { Direction, Position } from "../../common/types";
import { isPhysicsBody } from "../../common/utils";
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
  // keep the character inside the viewport (no built-in equivalent in melonJS)
  #collideWorldBounds = false;

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

  public setCollideWorldBounds(value: boolean): this {
    this.#collideWorldBounds = value;
    return this;
  }

  // called by the world every frame while the character is in it, right after the physics step
  override update(dt: number): boolean {
    this._stateMachine.update();

    if (this.#collideWorldBounds) {
      this.#keepInsideWorldBounds();
    }

    // advances the animation; returns true when the sprite needs redrawing
    return super.update(dt);
  }

  // pushes the (unrotated) sprite frame back inside the viewport and stops the velocity
  // on the blocked axis, like an arcade body hitting the world bounds
  #keepInsideWorldBounds(): void {
    const { width: worldWidth, height: worldHeight } = this.parentApp.viewport;
    const minX = this.width * this.anchorPoint.x;
    const maxX = worldWidth - this.width * (1 - this.anchorPoint.x);
    const minY = this.height * this.anchorPoint.y;
    const maxY = worldHeight - this.height * (1 - this.anchorPoint.y);

    const x = Math.min(Math.max(this.pos.x, minX), maxX);
    const y = Math.min(Math.max(this.pos.y, minY), maxY);
    const isBlockedX = x !== this.pos.x;
    const isBlockedY = y !== this.pos.y;
    if (!isBlockedX && !isBlockedY) {
      return;
    }

    this.pos.x = x;
    this.pos.y = y;
    if (isPhysicsBody(this.body)) {
      const velocity = this.body.getVelocity();
      this.body.setVelocity(isBlockedX ? 0 : velocity.x, isBlockedY ? 0 : velocity.y);
    }
  }
}
