/**
 * Type Effectiveness Chart
 * Based on nutritional type system from docs/dungeon/types.md
 */

import type { NutritionalType, TypeMatchup } from '../types';

export const TYPE_CHART: Record<NutritionalType, TypeMatchup> = {
  PROTEIN: {
    superEffectiveAgainst: ['CARB'],
    notVeryEffectiveAgainst: ['FIBER', 'FAT'], // FAT changed from immune to resist
    noEffectAgainst: [],
  },
  CARB: {
    superEffectiveAgainst: ['FAT'],
    notVeryEffectiveAgainst: ['PROCESSED', 'PROTEIN'], // PROTEIN changed from immune to resist
    noEffectAgainst: [],
  },
  FAT: {
    superEffectiveAgainst: ['PROTEIN'],
    notVeryEffectiveAgainst: ['CARB', 'FIBER'],
    noEffectAgainst: [],
  },
  FIBER: {
    superEffectiveAgainst: ['PROCESSED', 'FAT', 'OIL'], // FIBER cleanses oils
    notVeryEffectiveAgainst: ['PROTEIN'],
    noEffectAgainst: [],
  },
  PROCESSED: {
    superEffectiveAgainst: ['CARB', 'PROTEIN'],
    notVeryEffectiveAgainst: ['FIBER'], // FIBER changed from immune to resist
    noEffectAgainst: [],
  },
  OIL: {
    superEffectiveAgainst: ['PROTEIN', 'CARB'], // Oils coat and disrupt proteins/carbs
    notVeryEffectiveAgainst: ['FIBER', 'FAT'], // Fiber absorbs oils, FAT is similar
    noEffectAgainst: [],
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
 * Type matchups that have reduced accuracy (soft immunity)
 * These moves have a chance to miss even at 100% base accuracy
 */
const TYPE_ACCURACY_PENALTIES: Record<NutritionalType, { poorMatchups: NutritionalType[]; accuracyModifier: number }> = {
  PROTEIN: {
    poorMatchups: ['FAT'],           // PROTEIN struggles against FAT
    accuracyModifier: 0.6,           // 60% accuracy (40% miss chance)
  },
  CARB: {
    poorMatchups: ['PROTEIN'],       // CARB struggles against PROTEIN
    accuracyModifier: 0.6,           // 60% accuracy
  },
  FAT: {
    poorMatchups: [],                // FAT has no poor matchups
    accuracyModifier: 1.0,
  },
  FIBER: {
    poorMatchups: [],                // FIBER has no poor matchups
    accuracyModifier: 1.0,
  },
  PROCESSED: {
    poorMatchups: ['FIBER'],         // PROCESSED struggles against FIBER
    accuracyModifier: 0.6,           // 60% accuracy
  },
  OIL: {
    poorMatchups: ['FIBER'],         // OIL struggles against FIBER (absorbed)
    accuracyModifier: 0.6,           // 60% accuracy
  },
};

/**
 * Calculate type-based accuracy modifier
 * Returns a multiplier (0.6 for poor matchup, 1.0 for normal)
 */
export function getTypeAccuracyModifier(
  attackType: NutritionalType | undefined,
  defenderTypes: NutritionalType[]
): number {
  if (!attackType) return 1.0; // Untyped moves always have normal accuracy

  const penaltyData = TYPE_ACCURACY_PENALTIES[attackType];

  // Check if any defender type is in the poor matchups list
  for (const defType of defenderTypes) {
    if (penaltyData.poorMatchups.includes(defType)) {
      return penaltyData.accuracyModifier;
    }
  }

  return 1.0; // Normal accuracy
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
  OIL: '#8B4513',        // Brown (refined oils/trans fats)
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
  OIL: '🛢️',
};
