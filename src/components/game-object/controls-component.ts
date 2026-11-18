import type { GameObject } from "../../common/types";
import type { InputComponent } from "../input/input-component";
import { BaseGameObjectComponent } from "./base-game-object-component";

export class ControlsComponent extends BaseGameObjectComponent {
  #inputComponent: InputComponent;

  constructor(gameObject: GameObject, inputComponent: InputComponent) {
    super(gameObject);
    this.#inputComponent = inputComponent;
  }

  get controls(): InputComponent {
    return this.#inputComponent;
  }
}
