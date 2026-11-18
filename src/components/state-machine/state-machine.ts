import { ENABLE_LOGGING } from "../../common/config";

export interface State {
  stateMachine: StateMachine;
  name: string;
  onEnter?: (args: unknown[]) => void;
  onUpdate?: () => void;
}

// written out rather than read from `StateMachine.name`, which a production build minifies
const LOG_PREFIX = "StateMachine";

// `crypto.randomUUID()` only exists in secure contexts (https or localhost), so
// a page opened over plain http from another device falls back to a counter
let fallbackId = 0;
function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `state-machine-${++fallbackId}`;
}

export class StateMachine {
  #id: string;
  #states: Map<string, State>;
  #currentState: State | undefined;
  #isChangingState: boolean;
  #changingStateQueue: { state: string; args: unknown[] }[];

  /**
   * @param {string} [id] the unique identifier for this state machine instance.
   */
  constructor(id?: string) {
    this.#id = id ?? createId();
    this.#isChangingState = false;
    this.#changingStateQueue = [];
    this.#currentState = undefined;
    this.#states = new Map();
  }

  get currentStateName(): string | undefined {
    return this.#currentState?.name;
  }

  /**
   * Used for processing any queued states and is meant to be called during every step of our game loop.
   */
  public update(): void {
    const queuedState = this.#changingStateQueue.shift();
    if (queuedState !== undefined) {
      this.setState(queuedState.state, ...queuedState.args);
    }

    if (this.#currentState && this.#currentState.onUpdate) {
      this.#currentState.onUpdate();
    }
  }

  /**
   * Updates the current state of the state machine to the provided state name. If the state machine
   * is already transitioning states, or if there is a queue of states, the new state will be added
   * to that queue and processed after the queue is processed.
   */
  public setState(name: string, ...args: unknown[]): void {
    const methodName = "setState";

    if (!this.#states.has(name)) {
      console.warn(
        `[${LOG_PREFIX}-${this.#id}:${methodName}] tried to change to unknown state: ${name}`,
      );
      return;
    }

    if (this.#isCurrentState(name)) {
      return;
    }

    if (this.#isChangingState) {
      this.#changingStateQueue.push({ state: name, args });
      return;
    }

    this.#isChangingState = true;
    this.#log(methodName, `change from ${this.#currentState?.name ?? "none"} to ${name}`);

    this.#currentState = this.#states.get(name) as State;

    if (this.#currentState.onEnter) {
      this.#log(methodName, `${this.#currentState.name} on enter invoked`);
      this.#currentState.onEnter(args);
    }

    this.#isChangingState = false;
  }

  /**
   * Adds a new state to the current state machine instance. If a state already exists with the given name
   * that previous state will be replaced with the new state that was provided.
   */
  public addState(state: State): void {
    state.stateMachine = this;
    this.#states.set(state.name, state);
  }

  /**
   * Checks to see if the provided state name is the state that is currently being handled by the state machine instance.
   */
  #isCurrentState(name: string): boolean {
    if (!this.#currentState) {
      return false;
    }
    return this.#currentState.name === name;
  }

  #log(methodName: string, message: string): void {
    if (!ENABLE_LOGGING) {
      return;
    }
    console.log(`[${LOG_PREFIX}-${this.#id}:${methodName}] ${message}`);
  }
}
