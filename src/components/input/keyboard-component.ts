import { input } from "melonjs";
import { InputComponent } from "./input-component";

/**
 * melonJS polls named actions rather than key codes. Every key is bound with
 * `lock = true`, which gives each action two readings:
 * - `input.keyStatus(action)`: whether the key is held right now
 * - `input.isKeyPressed(action)`: true once per press, then false until the key
 *   is released and pressed again
 */
const KEYBOARD_ACTIONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
  ATTACK: "attack",
  ACTION: "action",
  SELECT: "select",
  ENTER: "enter",
} as const;

export class KeyboardComponent extends InputComponent {
  constructor() {
    super();
    input.bindKey(input.KEY.UP, KEYBOARD_ACTIONS.UP, true);
    input.bindKey(input.KEY.DOWN, KEYBOARD_ACTIONS.DOWN, true);
    input.bindKey(input.KEY.LEFT, KEYBOARD_ACTIONS.LEFT, true);
    input.bindKey(input.KEY.RIGHT, KEYBOARD_ACTIONS.RIGHT, true);
    input.bindKey(input.KEY.Z, KEYBOARD_ACTIONS.ATTACK, true);
    input.bindKey(input.KEY.X, KEYBOARD_ACTIONS.ACTION, true);
    input.bindKey(input.KEY.SHIFT, KEYBOARD_ACTIONS.SELECT, true);
    input.bindKey(input.KEY.ENTER, KEYBOARD_ACTIONS.ENTER, true);

    // z = B, Attack
    // x = A, Talk, Run, Lift/Throw, Push/Pull
    // shift = Select, Open Save Menu
    // return/enter = Start, Open Inventory
  }

  override get isUpDown(): boolean {
    return input.keyStatus(KEYBOARD_ACTIONS.UP);
  }

  override get isUpJustDown(): boolean {
    return input.isKeyPressed(KEYBOARD_ACTIONS.UP);
  }

  override get isDownDown(): boolean {
    return input.keyStatus(KEYBOARD_ACTIONS.DOWN);
  }

  override get isDownJustDown(): boolean {
    return input.isKeyPressed(KEYBOARD_ACTIONS.DOWN);
  }

  override get isLeftDown(): boolean {
    return input.keyStatus(KEYBOARD_ACTIONS.LEFT);
  }

  override get isRightDown(): boolean {
    return input.keyStatus(KEYBOARD_ACTIONS.RIGHT);
  }

  override get isActionKeyJustDown(): boolean {
    return input.isKeyPressed(KEYBOARD_ACTIONS.ACTION);
  }

  override get isAttackKeyJustDown(): boolean {
    return input.isKeyPressed(KEYBOARD_ACTIONS.ATTACK);
  }

  override get isSelectKeyJustDown(): boolean {
    return input.isKeyPressed(KEYBOARD_ACTIONS.SELECT);
  }

  override get isEnterKeyJustDown(): boolean {
    return input.isKeyPressed(KEYBOARD_ACTIONS.ENTER);
  }
}
