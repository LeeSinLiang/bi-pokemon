/**
 * Dungeon Level Position Configuration
 *
 * Coordinate System:
 * - Origin (0,0) is at the top-left corner
 * - Canvas dimensions: 512px width × 2048px height
 * - X range: 0-512 (horizontal position)
 * - Y range: 0-2048 (vertical position, increases downward)
 *
 * The positions map to visible wooden platform locations along the
 * winding path that descends from the treehouse at the top to the
 * corrupted depths at the bottom.
 */

export interface LevelPosition {
  level: number;
  x: number;
  y: number;
  name: string;
}

/**
 * Position data for all 8 dungeon levels
 * Positions are based on visual analysis of the dungeon_background.png
 * and correspond to the wooden plank platforms along the descending path.
 */
export const LEVEL_POSITIONS: LevelPosition[] = [
  {
    level: 1,
    x: 150,
    y: 680,
    name: "Gummy Root Systems"
  },
  {
    level: 2,
    x: 380,
    y: 810,
    name: "Greasy Swamp"
  },
  {
    level: 3,
    x: 150,
    y: 950,
    name: "Salt Crystal Caves"
  },
  {
    level: 4,
    x: 380,
    y: 1060,
    name: "Soda Stream"
  },
  {
    level: 5,
    x: 150,
    y: 1250,
    name: "Moldy Pantry"
  },
  {
    level: 6,
    x: 380,
    y: 1400,
    name: "Deep Fryer Volcano"
  },
  {
    level: 7,
    x: 150,
    y: 1580,
    name: "Frozen Wasteland"
  },
  {
    level: 8,
    x: 380,
    y: 1700,
    name: "Stale Plains"
  },
  {
	level: 9,
	x: 255,
	y: 1920,
	name: "Corrupted Depths"
  }
];

/**
 * Helper function to get position for a specific level
 */
export function getLevelPosition(level: number): LevelPosition | undefined {
  return LEVEL_POSITIONS.find(pos => pos.level === level);
}

/**
 * Helper function to get all level names in order
 */
export function getLevelNames(): string[] {
  return LEVEL_POSITIONS.map(pos => pos.name);
}

/**
 * Calculate the vertical distance between two levels
 */
export function getDistanceBetweenLevels(level1: number, level2: number): number {
  const pos1 = getLevelPosition(level1);
  const pos2 = getLevelPosition(level2);

  if (!pos1 || !pos2) {
    return 0;
  }

  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;

  return Math.sqrt(dx * dx + dy * dy);
}
