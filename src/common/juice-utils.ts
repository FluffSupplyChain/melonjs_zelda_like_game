import { FlashEffect, type Renderable, timer } from "melonjs";

// one flash effect per target, created on its first flash and reused afterwards
const flashEffects = new WeakMap<Renderable, FlashEffect>();

function getFlashEffect(target: Renderable): FlashEffect {
  let effect = flashEffects.get(target);
  if (effect === undefined) {
    effect = new FlashEffect(target.parentApp.renderer, { color: [1, 1, 1] });
    target.addPostEffect(effect);
    flashEffects.set(target, effect);
  }
  return effect;
}

/**
 * Creates a flash animation effect: the target turns solid white and semi-transparent
 * 4 times, 250ms apart, starting after 100ms, each flash lasting 150ms.
 * The white fill is a shader effect (WebGL / WebGPU only); on the Canvas renderer
 * only the transparency changes.
 * @param {Renderable} target The target game object that the effect will be applied to.
 * @param {() => void} [callback] The callback that will be invoked when the effect is finished
 * @returns {void}
 */
export function flash(target: Renderable, callback?: () => void): void {
  const effect = getFlashEffect(target);
  const flashCount = 4;
  const firstDelay = 100;
  const interval = 250;
  const flashDuration = 150;

  for (let i = 0; i < flashCount; i++) {
    // pauseable timers: they stop while the game is paused
    timer.setTimeout(
      () => {
        effect.setIntensity(1);
        target.alpha = 0.7;

        timer.setTimeout(
          () => {
            effect.setIntensity(0);
            target.alpha = 1;
            if (i === flashCount - 1 && callback) {
              callback();
            }
          },
          flashDuration,
          true,
        );
      },
      firstDelay + i * interval,
      true,
    );
  }
}
