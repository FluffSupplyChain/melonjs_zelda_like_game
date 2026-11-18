import { Application, BuiltinAdapter, state, Vector2d, video } from "melonjs";
import "./style.css";
import { SCENE_KEYS } from "./scenes/scene-keys";
import { preloadAssets } from "./scenes/preload-scene";
import { GameScene } from "./scenes/game-scene";

const app = new Application(256, 224, {
  parent: "game-container",
  renderer: video.AUTO, // WebGPU -> WebGL 2 -> Canvas
  // pixelArt: nearest-neighbour sampling, no smoothing
  antiAlias: false,
  // roundPixels: draw on whole pixels
  subPixel: false,
  // fixed 256x224 frame scaled to fit the container, aspect ratio kept and centred
  scale: "auto",
  scaleMethod: "fit",
  backgroundColor: "#000000",
  // arcade physics without gravity (top-down game)
  physic: await BuiltinAdapter.create({ gravity: new Vector2d(0, 0) }),
});
await app.init(); // mandatory in melonJS 20+

state.set(SCENE_KEYS.GAME_SCENE, new GameScene());
await preloadAssets();
