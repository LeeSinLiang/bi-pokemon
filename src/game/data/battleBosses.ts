/**
 * Battle Boss Data
 * Boss enemies for dungeon battles
 * Based on docs/dungeon/boss.md
 */

import type { BattleBossData } from '../types';

export const BATTLE_BOSSES: Record<string, BattleBossData> = {
  SODIUM_SERPENT: {
    id: 'boss_sodium_serpent',
    name: 'Sodium Serpent',
    locationLevel: 2,
    locationName: 'The Greasy Swamp',
    visuals:
      'Massive green serpent with soggy cucumber/chip scales emerging from frying oil. Glowing red eyes, dripping sludge.',
    archetype: 'The Bloated Tyrant. Gluttonous, sluggish, toxic.',
    types: ['PROCESSED', 'FAT'],
    spriteKey: 'boss-serpent',
    damagedSpriteKey: 'boss-serpent-damage',
    baseStats: {
      maxHP: 200,
      attack: 85,
      defense: 80,
      speed: 60,
    },
    passiveAbility: {
      name: 'Slippery Scales',
      description:
        'Coated in oily slick. 20% chance to evade incoming PHYSICAL attacks.',
      effect: {
        evadeChance: 20,
        evadeCategories: ['PHYSICAL'],
      },
    },
    moveset: [
      {
        name: 'Grease Slam',
        category: 'PHYSICAL',
        type: 'FAT',
        power: 80,
        accuracy: 90, // Heavy physical attack has lower accuracy
        description:
          '30% chance to apply \'Greased\' status (Sharply lowers target Speed).',
        effect: {
          statusEffect: 'GREASED',
          statusChance: 30,
        },
      },
      {
        name: 'Salt Spray',
        category: 'RANGED',
        type: 'PROCESSED',
        power: 60,
        accuracy: 100,
        neverMiss: true, // Toxic spray that blankets the area - always hits
        description: 'Toxic spray that never misses! 100% chance to apply \'Dehydrated\' status.',
        effect: {
          statusEffect: 'DEHYDRATED',
          statusChance: 100,
        },
      },
      {
        name: 'Sodium Overload',
        category: 'ULTIMATE',
        type: 'PROCESSED',
        power: 120,
        accuracy: 85, // Powerful but harder to land
        description:
          'Powerful attack with lower accuracy. If this move knocks out a target, the user heals 20% of its max HP.',
        effect: {
          healOnKO: 20,
        },
      },
    ],
  },
};

/**
 * Get boss data by ID
 */
export function getBattleBoss(id: string): BattleBossData | undefined {
  return BATTLE_BOSSES[id.toUpperCase().replace(/[- ]/g, '_')];
}

/**
 * Get boss by level
 */
export function getBossByLevel(level: number): BattleBossData | undefined {
  return Object.values(BATTLE_BOSSES).find(
    (boss) => boss.locationLevel === level
  );
}

/**
 * Get all bosses
 */
export function getAllBosses(): BattleBossData[] {
  return Object.values(BATTLE_BOSSES);
}
