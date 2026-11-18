import { type Application, Stage, Text } from "melonjs";
import { ASSET_KEYS } from "../common/assets";

export class GameScene extends Stage {
  // runs every time the scene is entered (Phaser's create())
  override onResetEvent(app: Application): void {
    app.world.addChild(
      new Text(app.viewport.width / 2, app.viewport.height / 2, {
        font: ASSET_KEYS.FONT_PRESS_START_2P,
        size: 16,
        fillStyle: "#ffffff",
        textAlign: "center",
        textBaseline: "middle",
        text: "Game Scene",
      }),
    );
  }
}
