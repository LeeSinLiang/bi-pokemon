/**
 * Battle System Configuration
 * Constants and formulas for battle mechanics
 */

/**
 * Battle constants
 */
export const BATTLE_CONFIG = {
  // Damage calculation
  BASE_DAMAGE: 50,
  CRITICAL_HIT_MULTIPLIER: 1.5,
  CRITICAL_HIT_CHANCE: 6.25, // Base crit chance %

  // Stat stage modifiers (Pokemon-style)
  STAT_STAGE_MULTIPLIERS: {
    '-6': 0.25,
    '-5': 0.28,
    '-4': 0.33,
    '-3': 0.4,
    '-2': 0.5,
    '-1': 0.66,
    '0': 1.0,
    '1': 1.5,
    '2': 2.0,
    '3': 2.5,
    '4': 3.0,
    '5': 3.5,
    '6': 4.0,
  } as const,

  // Status effects
  DEHYDRATED_DAMAGE_PERCENT: 10, // % of max HP per turn
  GREASED_SPEED_STAGE: -2,       // Speed stages lowered
  SOUR_ACCURACY_STAGE: -1,       // Accuracy stages lowered

  // Boss passive
  SLIPPERY_SCALES_EVADE_CHANCE: 20, // % chance to evade physical

  // Turn timing
  TURN_DELAY_MS: 500,
  ANIMATION_DELAY_MS: 1000,
  MESSAGE_DISPLAY_MS: 1500,

  // UI positions (400x850 viewport)
  VIEWPORT: {
    WIDTH: 400,
    HEIGHT: 850,
  },

  POSITIONS: {
    // Enemy (boss) position
    ENEMY: {
      X: 300,  // Upper-right area
      Y: 200,
    },
    // Player pet position
    PLAYER: {
      X: 100,  // Lower-left area
      Y: 500,
    },
  },

  // HP bar config
  HP_BAR: {
    WIDTH: 150,
    HEIGHT: 16,
    BORDER_WIDTH: 2,
    ANIMATION_DURATION: 500, // ms for smooth depletion
  },

  // Color thresholds for HP bar
  HP_COLOR_THRESHOLDS: {
    HIGH: 0.5,    // > 50% = green
    MEDIUM: 0.25, // 25-50% = yellow
    // < 25% = red
  },

  HP_COLORS: {
    HIGH: 0x81C784,    // Green
    MEDIUM: 0xFFD54F,  // Yellow
    LOW: 0xE57373,     // Red
    BACKGROUND: 0x424242,
    BORDER: 0x212121,
  },

  // Skill card UI
  SKILL_CARD: {
    WIDTH: 90,
    HEIGHT: 50,
    SPACING: 5,
    FONT_SIZE: '10px',
  },

  // Action button UI
  ACTION_BUTTON: {
    WIDTH: 90,
    HEIGHT: 36,
    FONT_SIZE: '16px',
  },

  // Message log
  MESSAGE_LOG: {
    MAX_MESSAGES: 3,
    Y_POSITION: 350,
    FONT_SIZE: '12px',
    LINE_HEIGHT: 20,
  },
};

/**
 * Damage calculation formula
 * Based on Pokemon damage formula (simplified)
 */
export function calculateDamage(
  attackerAttack: number,
  defenderDefense: number,
  movePower: number,
  typeMultiplier: number,
  isCritical: boolean = false
): number {
  // Base damage calculation
  const levelMultiplier = 1.0; // Could add pet levels later
  const baseDamage =
    ((2 * levelMultiplier + 10) / 250) *
    (attackerAttack / defenderDefense) *
    movePower +
    2;

  // Apply type effectiveness
  let damage = baseDamage * typeMultiplier;

  // Apply critical hit
  if (isCritical) {
    damage *= BATTLE_CONFIG.CRITICAL_HIT_MULTIPLIER;
  }

  // Random variance (85-100%)
  const variance = 0.85 + Math.random() * 0.15;
  damage *= variance;

  // Return rounded damage (minimum 1)
  return Math.max(1, Math.floor(damage));
}

/**
 * Check if move hits based on accuracy
 */
export function checkAccuracy(
  moveAccuracy: number = 100,
  attackerAccuracyStage: number = 0,
  defenderEvasionStage: number = 0
): boolean {
  // Calculate net stage modifier
  const netStage = attackerAccuracyStage - defenderEvasionStage;
  const stageMultiplier =
    BATTLE_CONFIG.STAT_STAGE_MULTIPLIERS[
      String(Math.max(-6, Math.min(6, netStage))) as keyof typeof BATTLE_CONFIG.STAT_STAGE_MULTIPLIERS
    ];

  // Final accuracy
  const finalAccuracy = moveAccuracy * stageMultiplier;

  // Roll
  return Math.random() * 100 < finalAccuracy;
}

/**
 * Check if move is critical hit
 */
export function checkCriticalHit(baseCritChance: number = BATTLE_CONFIG.CRITICAL_HIT_CHANCE): boolean {
  return Math.random() * 100 < baseCritChance;
}

/**
 * Get stat multiplier from stage
 */
export function getStatMultiplier(stage: number): number {
  const clampedStage = Math.max(-6, Math.min(6, stage));
  return BATTLE_CONFIG.STAT_STAGE_MULTIPLIERS[
    String(clampedStage) as keyof typeof BATTLE_CONFIG.STAT_STAGE_MULTIPLIERS
  ];
}

/**
 * Get HP bar color based on HP percentage
 */
export function getHPBarColor(hpPercent: number): number {
  if (hpPercent > BATTLE_CONFIG.HP_COLOR_THRESHOLDS.HIGH) {
    return BATTLE_CONFIG.HP_COLORS.HIGH;
  } else if (hpPercent > BATTLE_CONFIG.HP_COLOR_THRESHOLDS.MEDIUM) {
    return BATTLE_CONFIG.HP_COLORS.MEDIUM;
  } else {
    return BATTLE_CONFIG.HP_COLORS.LOW;
  }
}
