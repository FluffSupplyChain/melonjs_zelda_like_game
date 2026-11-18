import type { GameObject } from "../../common/types";

/**
 * Components attached to each game object, keyed by component class.
 * A WeakMap keeps the objects free of extra properties and lets a destroyed
 * object's components be garbage collected with it. Keying by the class itself,
 * not its name, keeps working once a production build minifies class names.
 */
const componentsByObject = new WeakMap<GameObject, Map<Function, BaseGameObjectComponent>>();

export class BaseGameObjectComponent {
  protected gameObject: GameObject;

  constructor(gameObject: GameObject) {
    this.gameObject = gameObject;
    this.assignComponentToObject(gameObject);
  }

  static getComponent<T>(gameObject: GameObject): T {
    return componentsByObject.get(gameObject)?.get(this) as T;
  }

  static removeComponent(gameObject: GameObject): void {
    componentsByObject.get(gameObject)?.delete(this);
  }

  protected assignComponentToObject(object: GameObject): void {
    let components = componentsByObject.get(object);
    if (components === undefined) {
      components = new Map();
      componentsByObject.set(object, components);
    }
    components.set(this.constructor, this);
  }
}
