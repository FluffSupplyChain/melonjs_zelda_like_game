import type { loader } from "melonjs";

type Asset = loader.Asset;

/**
 * Names used to read assets back once loaded
 * (`loader.getImage(name)`, `new Sprite(x, y, { image: name })`, `level.load(name)`, ...).
 */
export const ASSET_KEYS = {
  FONT_PRESS_START_2P: "FONT_PRESS_START_2P",
  HUD_NUMBERS: "HUD_NUMBERS",
  UI_DIALOG: "UI_DIALOG",
  UI_CURSOR: "UI_CURSOR",
  UI_ICONS: "UI_ICONS",
  PLAYER: "PLAYER",
  DAGGER: "DAGGER",
  COLLISION: "COLLISION",
  DUNGEON_OBJECTS: "DUNGEON_OBJECTS",
  POT: "POT",
  POT_BREAK: "POT_BREAK",
  SPIDER: "SPIDER",
  WISP: "WISP",
  ENEMY_DEATH: "ENEMY_DEATH",
  DROW: "DROW",
  DUNGEON_1_BACKGROUND: "DUNGEON_1_BACKGROUND",
  DUNGEON_1_FOREGROUND: "DUNGEON_1_FOREGROUND",
  DUNGEON_1_LEVEL: "DUNGEON_1_LEVEL",
  WORLD_BACKGROUND: "WORLD_BACKGROUND",
  WORLD_FOREGROUND: "WORLD_FOREGROUND",
  WORLD_LEVEL: "WORLD_LEVEL",
} as const;

/**
 * melonJS loads a sprite sheet as a plain image and takes the frame size when
 * the Sprite is built: `new Sprite(x, y, { image: key, ...SPRITESHEET_FRAMES[key] })`.
 */
export const SPRITESHEET_FRAMES = {
  [ASSET_KEYS.UI_ICONS]: { framewidth: 16, frameheight: 16 },
  [ASSET_KEYS.DAGGER]: { framewidth: 16, frameheight: 16 },
  [ASSET_KEYS.POT_BREAK]: { framewidth: 32, frameheight: 32 },
  [ASSET_KEYS.ENEMY_DEATH]: { framewidth: 16, frameheight: 16 },
} as const;

// An atlas (TexturePacker or Aseprite JSON export) is an "image" and a "json"
// sharing one name; build it later with `new TextureAtlas(loader.getJSON(key), loader.getImage(key))`.
const atlas = (name: string, path: string, file: string): Asset[] => [
  { name, type: "image", src: `${path}/${file}.png` },
  { name, type: "json", src: `${path}/${file}.json` },
];
const image = (name: string, src: string): Asset => ({ name, type: "image", src });

/**
 * melonJS equivalent of the Phaser asset pack (public/assets/data/assets.json).
 * A flat list for now; it can be split into `{ common, world, dungeon_1 }`
 * bundles later to load and free a level's assets on their own.
 */
export const resources: Asset[] = [
  // fonts — usable afterwards as a CSS font family under this name
  {
    name: ASSET_KEYS.FONT_PRESS_START_2P,
    type: "fontface",
    src: "assets/fonts/Press_Start_2P/PressStart2P-Regular.ttf",
  },

  // hud
  ...atlas(ASSET_KEYS.HUD_NUMBERS, "assets/images/hud", "heart_and_hud_numbers"),

  // ui
  image(ASSET_KEYS.UI_DIALOG, "assets/images/ui/dialog_ui.png"),
  image(ASSET_KEYS.UI_CURSOR, "assets/images/ui/cursor_white.png"),
  image(ASSET_KEYS.UI_ICONS, "assets/images/ui/icons.png"),

  // player
  ...atlas(ASSET_KEYS.PLAYER, "assets/images/player", "main_green"),
  image(ASSET_KEYS.DAGGER, "assets/images/player/dagger.png"),

  // common level objects
  image(ASSET_KEYS.COLLISION, "assets/images/levels/common/collision.png"),
  ...atlas(ASSET_KEYS.DUNGEON_OBJECTS, "assets/images/levels/common", "dungeon_objects"),
  image(ASSET_KEYS.POT, "assets/images/levels/common/pot.png"),
  image(ASSET_KEYS.POT_BREAK, "assets/images/levels/common/pot_break.png"),

  // enemies
  ...atlas(ASSET_KEYS.SPIDER, "assets/images/enemies", "spider"),
  ...atlas(ASSET_KEYS.WISP, "assets/images/enemies", "wisp"),
  image(ASSET_KEYS.ENEMY_DEATH, "assets/images/enemies/enemy_death.png"),
  ...atlas(ASSET_KEYS.DROW, "assets/images/enemies", "drow"),

  // dungeon 1 (Tiled JSON maps load under the "tmx" type)
  image(ASSET_KEYS.DUNGEON_1_BACKGROUND, "assets/images/levels/dungeon_1/dungeon_1_background.png"),
  image(ASSET_KEYS.DUNGEON_1_FOREGROUND, "assets/images/levels/dungeon_1/dungeon_1_foreground.png"),
  {
    name: ASSET_KEYS.DUNGEON_1_LEVEL,
    type: "tmx",
    src: "assets/images/levels/dungeon_1/dungeon_1.json",
  },

  // world
  image(ASSET_KEYS.WORLD_BACKGROUND, "assets/images/levels/world/world_background.png"),
  image(ASSET_KEYS.WORLD_FOREGROUND, "assets/images/levels/world/world_foreground.png"),
  { name: ASSET_KEYS.WORLD_LEVEL, type: "tmx", src: "assets/images/levels/world/world.json" },
];
