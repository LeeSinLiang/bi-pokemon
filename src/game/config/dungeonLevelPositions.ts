/**
 * Dungeon Level Positions Configuration
 *
 * Defines the positions of level nodes on the dungeon map background.
 * Background dimensions: 512x2048px (scaled to fit 400px width in game)
 *
 * The treehouse (level 1) is at the top, and levels progress downward into the dungeon.
 * Coordinates are in the original 512x2048 space and will be scaled to match the game viewport.
 */

export interface LevelPosition {
  level: number;
  x: number;
  y: number;
  name: string;
  isLocked: boolean;
}

/**
 * Level positions array - from treehouse (top) to deepest dungeon (bottom)
 * X values are centered around 256 (middle of 512px width)
 * Y values progress from top (treehouse) to bottom (deep dungeon)
 */
export const LEVEL_POSITIONS: LevelPosition[] = [
  // Level 1: Treehouse (starting point at top)
  {
    level: 1,
    x: 256,
    y: 200,
    name: 'Treehouse',
    isLocked: false
  },

  // Level 2: Forest Floor
  {
    level: 2,
    x: 256,
    y: 400,
    name: 'Forest Floor',
    isLocked: false
  },

  // Level 3: Underground Entrance
  {
    level: 3,
    x: 256,
    y: 600,
    name: 'Underground Entrance',
    isLocked: true
  },

  // Level 4: Dark Caverns
  {
    level: 4,
    x: 256,
    y: 800,
    name: 'Dark Caverns',
    isLocked: true
  },

  // Level 5: Crystal Mines
  {
    level: 5,
    x: 256,
    y: 1000,
    name: 'Crystal Mines',
    isLocked: true
  },

  // Level 6: Ancient Ruins
  {
    level: 6,
    x: 256,
    y: 1200,
    name: 'Ancient Ruins',
    isLocked: true
  },

  // Level 7: Lava Depths
  {
    level: 7,
    x: 256,
    y: 1400,
    name: 'Lava Depths',
    isLocked: true
  },

  // Level 8: Shadow Realm
  {
    level: 8,
    x: 256,
    y: 1600,
    name: 'Shadow Realm',
    isLocked: true
  },

  // Level 9: Corrupted Core
  {
    level: 9,
    x: 256,
    y: 1750,
    name: 'Corrupted Core',
    isLocked: true
  },

  // Level 10: Boss Chamber (deepest point)
  {
    level: 10,
    x: 256,
    y: 1900,
    name: 'Boss Chamber',
    isLocked: true
  }
];

/**
 * Get level position by level number
 */
export function getLevelPosition(level: number): LevelPosition | undefined {
  return LEVEL_POSITIONS.find(pos => pos.level === level);
}

/**
 * Get all unlocked levels
 */
export function getUnlockedLevels(): LevelPosition[] {
  return LEVEL_POSITIONS.filter(pos => !pos.isLocked);
}
