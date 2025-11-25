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

    // Default values (for backward compatibility, overridden by phases)
    types: ['PROCESSED', 'FAT'],
    spriteKey: 'boss-serpent',
    damagedSpriteKey: 'boss-serpent-damage',
    baseStats: {
      maxHP: 150,
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
    moveset: [],

    // Multi-phase boss configuration
    phases: [
      // ===== PHASE 1: The Bloated Tyrant (150 HP) =====
      {
        phaseNumber: 1,
        name: 'The Bloated Tyrant',
        types: ['PROCESSED', 'FAT'],
        spriteKey: 'boss-serpent',
        backgroundKey: 'battle-bg-level-2',
        baseStats: {
          maxHP: 150,
          attack: 85,
          defense: 80,
          speed: 60,
        },
        passiveAbility: {
          name: 'Slippery Scales',
          description: 'Coated in oily slick. 20% chance to evade incoming PHYSICAL attacks.',
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
            accuracy: 90,
            description: '30% chance to apply \'Greased\' status (Sharply lowers target Speed).',
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
            neverMiss: true,
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
            accuracy: 85,
            description: 'Powerful attack. If this knocks out a target, heals 20% max HP.',
            effect: {
              healOnKO: 20,
            },
          },
        ],
      },

      // ===== PHASE 2: Greasy Inferno (250 HP) =====
      {
        phaseNumber: 2,
        name: 'Greasy Inferno',
        types: ['OIL', 'PROCESSED'],
        spriteKey: 'boss-serpent-phase-2',
        backgroundKey: 'battle-bg-level-2-phase-2',
        baseStats: {
          maxHP: 250,
          attack: 95,
          defense: 70,
          speed: 85,
        },
        passiveAbility: {
          name: 'Boiling Rage',
          description: 'When hit for >25% HP, counters with 50 damage. Immune to status effects.',
          effect: {
            counterThreshold: 0.25,
            counterDamage: 50,
            statusImmune: true,
          },
        },
        moveset: [
          {
            name: 'Burning Oil Slam',
            category: 'PHYSICAL',
            type: 'OIL',
            power: 95,
            accuracy: 90,
            description: 'Flaming oil-coated slam. 60% chance to Burn.',
            effect: {
              statusEffect: 'BURNED',
              statusChance: 60,
            },
          },
          {
            name: 'Toxic Heatwave',
            category: 'SPECIAL',
            type: 'OIL',
            power: 75,
            accuracy: 100,
            neverMiss: true,
            description: 'Toxic heat wave hits all party members! 100% chance to Burn or Dehydrate.',
            effect: {
              hitsAllParty: true,
              statusEffect: 'BURNED', // Applied randomly between BURNED and DEHYDRATED
              statusChance: 100,
            },
          },
          {
            name: 'Grease Fire Eruption',
            category: 'ULTIMATE',
            type: 'OIL',
            power: 150,
            accuracy: 80,
            description: 'Massive grease fire explosion! If KO: heal 40% HP + Attack +2 stages.',
            effect: {
              healOnKO: 40,
              statModifierOnKO: {
                stat: 'ATTACK',
                stages: 2,
              },
            },
          },
        ],
        environmentalHazard: {
          type: 'BOILING_SWAMP',
          damagePercent: 8,
          message: 'The boiling swamp sears {target}!',
        },
      },

      // ===== PHASE 3: Dying Flames (200 HP) =====
      {
        phaseNumber: 3,
        name: 'Dying Flames',
        types: ['PROCESSED', 'FAT'],
        spriteKey: 'boss-serpent-damage',
        backgroundKey: 'battle-bg-level-2',
        baseStats: {
          maxHP: 200,
          attack: 100,
          defense: 50,
          speed: 95,
        },
        passiveAbility: {
          name: 'Cornered Predator',
          description: 'All attacks have +1 priority. Gains +1 Attack stage at end of each turn.',
          effect: {
            priority: 1,
            attackGainPerTurn: 1,
          },
        },
        moveset: [
          {
            name: 'Frenzied Slam',
            category: 'PHYSICAL',
            type: 'FAT',
            power: 110,
            accuracy: 85,
            description: 'Desperate frenzied attack! 100% chance to Grease.',
            effect: {
              statusEffect: 'GREASED',
              statusChance: 100,
            },
          },
          {
            name: 'Sludge Burst',
            category: 'SPECIAL',
            type: 'PROCESSED',
            power: 90,
            accuracy: 95,
            description: 'Toxic sludge burst that ignores defense stages. 70% Dehydrated.',
            effect: {
              ignoreDefenseStages: true,
              statusEffect: 'DEHYDRATED',
              statusChance: 70,
            },
          },
          {
            name: 'Dying Breath',
            category: 'ULTIMATE',
            type: 'PROCESSED',
            power: 0, // Calculated dynamically: (maxHP - currentHP) * 1.2
            accuracy: 70,
            description: 'Desperate final attack! Power increases as HP decreases. If KO: heal 60% HP. Self-damages 25% after use.',
            effect: {
              dynamicPower: {
                formula: 'missingHP',
                multiplier: 1.2,
              },
              healOnKO: 60,
              recoilPercent: 25,
            },
          },
        ],
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
