import type { Sprite } from "melonjs";
import type { CharacterAnimation, GameObject } from "../../common/types";
import { BaseGameObjectComponent } from "./base-game-object-component";

/**
 * - `key`: the sprite animation to play
 * - `repeat`: -1 loops forever, 0 plays once and holds the last frame
 *   (melonJS has no counted repeats, so only these two values are supported)
 * - `ignoreIfPlaying`: keep the animation going if it is already playing,
 *   instead of restarting it from its first frame
 */
export type AnimationConfig = {
  [key in CharacterAnimation]?: { key: string; repeat: -1 | 0; ignoreIfPlaying: boolean };
};

export class AnimationComponent extends BaseGameObjectComponent {
  declare protected gameObject: Sprite;

  #config: AnimationConfig;
  // callbacks waiting for a play-once animation to finish, keyed by sprite animation
  #completeCallbacks = new Map<string, (() => void)[]>();
  // whether the current play-once animation has finished and holds its last frame
  #isDone = false;

  constructor(gameObject: GameObject, config: AnimationConfig) {
    super(gameObject);
    this.#config = config;
  }

  public getAnimationKey(characterAnimationKey: CharacterAnimation): string | undefined {
    if (this.#config[characterAnimationKey] === undefined) {
      return undefined;
    }
    return this.#config[characterAnimationKey].key;
  }

  /**
   * Plays the animation set up for the given character animation. The callback runs when a
   * play-once animation finishes; a looping animation never finishes, so it never runs.
   * With no animation set up, the callback runs straight away.
   */
  public playAnimation(characterAnimationKey: CharacterAnimation, callback?: () => void): void {
    const animationConfig = this.#config[characterAnimationKey];
    if (animationConfig === undefined) {
      if (callback) {
        callback();
      }
      return;
    }
    const { key, repeat, ignoreIfPlaying } = animationConfig;

    if (callback) {
      const callbacks = this.#completeCallbacks.get(key) ?? [];
      callbacks.push(callback);
      this.#completeCallbacks.set(key, callbacks);
    }

    const isPlaying = this.gameObject.isCurrentAnimation(key) && !this.#isDone;
    if (isPlaying) {
      if (!ignoreIfPlaying) {
        // selecting the animation already playing is a no-op in melonJS, so rewind it by hand
        this.gameObject.setAnimationFrame(0);
        this.gameObject.dt = 0;
      }
      this.gameObject.play();
      return;
    }

    this.#isDone = false;
    // also clears a pause
    this.gameObject.play(
      key,
      repeat === -1 ? undefined : { loop: false, onComplete: () => this.#onComplete(key) },
    );
  }

  public isAnimationPlaying(): boolean {
    return !this.gameObject.animationpause && !this.#isDone;
  }

  #onComplete(key: string): void {
    this.#isDone = true;
    const callbacks = this.#completeCallbacks.get(key);
    this.#completeCallbacks.delete(key);
    callbacks?.forEach((callback) => callback());
  }
}
