/**
 * Battle Pet Data
 * Playable pets for Level 2 Battle Arena
 * Based on docs/dungeon/pets.md
 */

import type { BattlePetData } from '../types';

export const BATTLE_PETS: Record<string, BattlePetData> = {
  LEMON_SHARK: {
    id: 'pet_lemon_shark',
    name: 'Lemon Shark',
    visuals: 'Shark that is a lemon fruit.',
    personality: 'The Zesty Predator. Aggressive, cute but sour.',
    types: ['FIBER'],
    spriteKey: 'pet-lemon-shark',
    baseStats: {
      maxHP: 120,
      attack: 90,
      defense: 70,
      speed: 85,
    },
    skills: [
      {
        name: 'Citrus Bite',
        category: 'PHYSICAL',
        type: 'FIBER',
        power: 70,
        accuracy: 95,
        description: 'Strong chomp. Chance to apply \'Sour\' status (lowers accuracy).',
        effect: {
          statusEffect: 'SOUR',
          statusChance: 30,
        },
      },
      {
        name: 'Acid Reflux',
        category: 'SPECIAL',
        type: 'FIBER',
        power: 60,
        accuracy: 100,
        description: 'Spits lemon juice. Deals extra damage if target is PROCESSED type.',
        effect: {
          bonusAgainstType: 'PROCESSED', // Extra 50% damage vs PROCESSED
        },
      },
    ],
  },

  MUSUBEE: {
    id: 'pet_musubee',
    name: 'Musubee',
    visuals: 'Bee made of spam, rice, seaweed.',
    personality: 'The Salty Worker. High energy, buzzing, aggressive.',
    types: ['PROTEIN', 'CARB'],
    spriteKey: 'pet-musubee',
    baseStats: {
      maxHP: 110,
      attack: 95,
      defense: 65,
      speed: 95,
    },
    skills: [
      {
        name: 'Salty Sting',
        category: 'PHYSICAL',
        type: 'PROTEIN',
        power: 65,
        accuracy: 100,
        description: 'Quick jab. High critical hit chance.',
        // Note: High crit will be handled in battle logic (25% instead of 6.25%)
      },
      {
        name: 'Nori Bind',
        category: 'UTILITY',
        power: 40,
        accuracy: 95,
        description: 'Wraps opponent in seaweed. Prevents swapping next turn.',
        effect: {
          statusEffect: 'TRAPPED',
          statusChance: 100,
        },
      },
    ],
  },

  TARTLE: {
    id: 'pet_tartle',
    name: 'Tart-le',
    visuals: 'Turtle with fruit tart shell.',
    personality: 'The Sweet Shield. Slow, steady, protective.',
    types: ['FIBER', 'CARB'],
    spriteKey: 'pet-tartle',
    baseStats: {
      maxHP: 130,
      attack: 70,
      defense: 100,
      speed: 50,
    },
    skills: [
      {
        name: 'Crust Hunker',
        category: 'BUFF',
        description: 'Withdraws into shell. Sharply raises own Defense.',
        effect: {
          statModifier: 'DEFENSE',
          statChange: 2, // Sharply raise = +2 stages
          targetSelf: true,
        },
      },
      {
        name: 'Berry Bombard',
        category: 'RANGED',
        type: 'FIBER',
        power: 35,
        accuracy: 90,
        description: 'Launches fruit. Hits 2-3 times randomly.',
        effect: {
          multihit: [2, 3],
        },
      },
    ],
  },
};

/**
 * Get pet data by ID
 */
export function getBattlePet(id: string): BattlePetData | undefined {
  return BATTLE_PETS[id.toUpperCase().replace(/[- ]/g, '_')];
}

/**
 * Get all available battle pets
 */
export function getAllBattlePets(): BattlePetData[] {
  return Object.values(BATTLE_PETS);
}

/**
 * Get pet by name
 */
export function getBattlePetByName(name: string): BattlePetData | undefined {
  return getAllBattlePets().find(
    (pet) => pet.name.toLowerCase() === name.toLowerCase()
  );
}
