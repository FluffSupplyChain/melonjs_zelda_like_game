import { type Application, Stage, Text } from "melonjs";
import { ASSET_KEYS } from "../common/assets";
import { Player } from "../game-objects/player/player";
import { KeyboardComponent } from "../components/input/keyboard-component";

export class GameScene extends Stage {
  #controls!: KeyboardComponent;
  #player!: Player;

  // runs every time the scene is entered
  override onResetEvent(app: Application): void {
    this.#controls = new KeyboardComponent();
    const center = { x: app.viewport.width / 2, y: app.viewport.height / 2 };

    app.world.addChild(
      new Text(center.x, center.y, {
        font: ASSET_KEYS.FONT_PRESS_START_2P,
        size: 16,
        fillStyle: "#ffffff",
        textAlign: "center",
        textBaseline: "middle",
        text: "Game Scene",
      }),
      1,
    );

    this.#player = new Player({
      position: center,
      assetKey: ASSET_KEYS.PLAYER,
      controls: this.#controls,
    });
    // adding it to the world also creates its physics body
    app.world.addChild(this.#player, 2);
  }
}
