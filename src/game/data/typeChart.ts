/**
 * Type Effectiveness Chart
 * Based on nutritional type system from docs/dungeon/types.md
 */

import type { NutritionalType, TypeMatchup } from '../types';

export const TYPE_CHART: Record<NutritionalType, TypeMatchup> = {
  PROTEIN: {
    superEffectiveAgainst: ['CARB'],
    notVeryEffectiveAgainst: ['FIBER'],
    noEffectAgainst: ['FAT'],
  },
  CARB: {
    superEffectiveAgainst: ['FAT'],
    notVeryEffectiveAgainst: ['PROCESSED'],
    noEffectAgainst: ['PROTEIN'],
  },
  FAT: {
    superEffectiveAgainst: ['PROTEIN'],
    notVeryEffectiveAgainst: ['CARB', 'FIBER'],
    noEffectAgainst: [],
  },
  FIBER: {
    superEffectiveAgainst: ['PROCESSED', 'FAT'],
    notVeryEffectiveAgainst: ['PROTEIN'],
    noEffectAgainst: [],
  },
  PROCESSED: {
    superEffectiveAgainst: ['CARB', 'PROTEIN'],
    notVeryEffectiveAgainst: [],
    noEffectAgainst: ['FIBER'],
  },
};

/**
 * Calculate type effectiveness multiplier
 * @param attackType - The type of the attacking move
 * @param defenderTypes - The types of the defending pet (can be 1 or 2)
 * @returns Damage multiplier (0.0, 0.5, 1.0, 2.0, or 4.0 for dual types)
 */
export function calculateTypeMultiplier(
  attackType: NutritionalType,
  defenderTypes: NutritionalType[]
): number {
  let finalMultiplier = 1.0;

  const matchup = TYPE_CHART[attackType];

  for (const defType of defenderTypes) {
    let currentMultiplier = 1.0;

    // Check immunity first
    if (matchup.noEffectAgainst.includes(defType)) {
      return 0.0; // Immune - no damage at all
    }

    // Check super effective
    if (matchup.superEffectiveAgainst.includes(defType)) {
      currentMultiplier = 2.0;
    }
    // Check not very effective
    else if (matchup.notVeryEffectiveAgainst.includes(defType)) {
      currentMultiplier = 0.5;
    }

    // Multiply together for dual types
    finalMultiplier *= currentMultiplier;
  }

  return finalMultiplier;
}

/**
 * Get effectiveness message for display
 */
export function getEffectivenessMessage(multiplier: number): string | null {
  if (multiplier === 0) return "It had no effect...";
  if (multiplier >= 2.0) return "It's super effective!";
  if (multiplier <= 0.5) return "It's not very effective...";
  return null;
}

/**
 * Type color mapping for UI
 */
export const TYPE_COLORS: Record<NutritionalType, string> = {
  PROTEIN: '#E57373',    // Red
  CARB: '#FFD54F',       // Yellow
  FAT: '#FFB74D',        // Orange
  FIBER: '#81C784',      // Green
  PROCESSED: '#9575CD',  // Purple
};

/**
 * Type emoji icons
 */
export const TYPE_ICONS: Record<NutritionalType, string> = {
  PROTEIN: '🥩',
  CARB: '🍞',
  FAT: '🥑',
  FIBER: '🥗',
  PROCESSED: '🍭',
};
