import type { Renderable } from "melonjs";
import type { CHARACTER_ANIMATIONS } from "./assets";

export type CharacterAnimation = keyof typeof CHARACTER_ANIMATIONS;

export type Position = {
  x: number;
  y: number;
};

// melonJS `Renderable` is the base of every drawable object (`Sprite`, `Text`, ...)
export type GameObject = Renderable;
