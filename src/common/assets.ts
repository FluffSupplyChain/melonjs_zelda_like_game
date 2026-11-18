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
 * Every asset the game preloads.
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

/** Aseprite tag names (meta.frameTags), used as melonJS animation names. */
export const PLAYER_ANIMATION_KEYS = {
  WALK_DOWN: "player_walk_down",
  WALK_UP: "player_walk_up",
  WALK_SIDE: "player_walk_side",
  IDLE_DOWN: "player_idle_down",
  IDLE_UP: "player_idle_up",
  IDLE_SIDE: "player_idle_side",
  IDLE_HOLD_DOWN: "player_hand_in_air_down",
  IDLE_HOLD_UP: "player_hand_in_air_up",
  IDLE_HOLD_SIDE: "player_hand_in_air_side",
  WALK_HOLD_DOWN: "player_walk_hand_in_air_down",
  WALK_HOLD_UP: "player_walk_hand_in_air_up",
  WALK_HOLD_SIDE: "player_walk_hand_in_air_side",
  LIFT_DOWN: "player_open_chest_down",
  LIFT_UP: "player_open_chest_up",
  LIFT_SIDE: "player_open_chest_side",
  HURT_DOWN: "player_hit_down",
  HURT_UP: "player_hit_up",
  HURT_SIDE: "player_hit_side",
  DIE_DOWN: "player_die_down",
  DIE_UP: "player_die_up",
  DIE_SIDE: "player_die_side",
  SWORD_1_ATTACK_DOWN: "player_atk_1_down",
  SWORD_1_ATTACK_UP: "player_atk_1_up",
  SWORD_1_ATTACK_SIDE: "player_atk_1_side",
} as const;

export const SPIDER_ANIMATION_KEYS = {
  WALK: "spider_walk",
  HIT: "spider_hit",
  DEATH: ASSET_KEYS.ENEMY_DEATH,
} as const;

export const DROW_ANIMATION_KEYS = {
  WALK_DOWN: "drow_walk_down",
  WALK_UP: "drow_walk_up",
  WALK_LEFT: "drow_walk_left",
  WALK_RIGHT: "drow_walk_right",
  IDLE_DOWN: "drow_idle_down",
  IDLE_UP: "drow_idle_up",
  IDLE_SIDE: "drow_idle_right",
  HIT: "drow_hit",
  ATTACK_DOWN: "drow_atk_down",
  ATTACK_UP: "drow_atk_up",
  ATTACK_SIDE: "drow_atk_right",
} as const;

export const WISP_ANIMATION_KEYS = {
  IDLE: "wisp_idle",
} as const;

export const CHARACTER_ANIMATIONS = {
  IDLE_DOWN: "IDLE_DOWN",
  IDLE_UP: "IDLE_UP",
  IDLE_LEFT: "IDLE_LEFT",
  IDLE_RIGHT: "IDLE_RIGHT",
  WALK_DOWN: "WALK_DOWN",
  WALK_UP: "WALK_UP",
  WALK_LEFT: "WALK_LEFT",
  WALK_RIGHT: "WALK_RIGHT",
  IDLE_HOLD_DOWN: "IDLE_HOLD_DOWN",
  IDLE_HOLD_UP: "IDLE_HOLD_UP",
  IDLE_HOLD_LEFT: "IDLE_HOLD_LEFT",
  IDLE_HOLD_RIGHT: "IDLE_HOLD_RIGHT",
  WALK_HOLD_DOWN: "WALK_HOLD_DOWN",
  WALK_HOLD_UP: "WALK_HOLD_UP",
  WALK_HOLD_LEFT: "WALK_HOLD_LEFT",
  WALK_HOLD_RIGHT: "WALK_HOLD_RIGHT",
  LIFT_DOWN: "LIFT_DOWN",
  LIFT_UP: "LIFT_UP",
  LIFT_LEFT: "LIFT_LEFT",
  LIFT_RIGHT: "LIFT_RIGHT",
  HURT_DOWN: "HURT_DOWN",
  HURT_UP: "HURT_UP",
  HURT_LEFT: "HURT_LEFT",
  HURT_RIGHT: "HURT_RIGHT",
  DIE_DOWN: "DIE_DOWN",
  DIE_UP: "DIE_UP",
  DIE_LEFT: "DIE_LEFT",
  DIE_RIGHT: "DIE_RIGHT",
} as const;

export const CHEST_FRAME_KEYS = {
  BIG_CHEST_CLOSED: "big_chest_closed.png",
  SMALL_CHEST_CLOSED: "chest_closed.png",
  BIG_CHEST_OPEN: "big_chest_open.png",
  SMALL_CHEST_OPEN: "chest_open.png",
} as const;

export const DOOR_FRAME_KEYS = {
  TRAP_LEFT: "trap_left.png",
  TRAP_RIGHT: "trap_right.png",
  TRAP_UP: "trap_up.png",
  TRAP_DOWN: "trap_down.png",
  BOSS_LEFT: "boss_left.png",
  BOSS_RIGHT: "boss_right.png",
  BOSS_UP: "boss_up.png",
  BOSS_DOWN: "boss_down.png",
  LOCK_LEFT: "lock_left.png",
  LOCK_RIGHT: "lock_right.png",
  LOCK_UP: "lock_up.png",
  LOCK_DOWN: "lock_down.png",
} as const;

export const BUTTON_FRAME_KEYS = {
  FLOOR_SWITCH: "floor_switch.png",
  PLATE_SWITCH: "plate_switch.png",
} as const;

export const CHEST_REWARD_TO_TEXTURE_FRAME = {
  SMALL_KEY: 119,
  BOSS_KEY: 121,
  MAP: 117,
  COMPASS: 118,
  NOTHING: 126,
} as const;

export const HEART_ANIMATIONS = {
  LOSE_LAST_HALF: "heart_lose_last_half",
  LOSE_FIRST_HALF: "heart_lost_first_half",
} as const;

export const HEART_TEXTURE_FRAME = {
  NONE: "15",
  FULL: "10",
  EMPTY: "14",
  HALF: "12",
} as const;
