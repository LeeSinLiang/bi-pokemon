/**
 * Game Type Definitions
 * Custom type definitions for Byte In game
 */

import type Phaser from 'phaser';

// ============================================================================
// Core Game Types
// ============================================================================

export interface GameConfig extends Phaser.Types.Core.GameConfig {
  // Extended game configuration if needed
}

// ============================================================================
// Pet System Types
// ============================================================================

export type PetMood = 'happy' | 'neutral' | 'sad' | 'excited' | 'sleepy' | 'hungry';

export type PetActivity = 'idle' | 'eating' | 'playing' | 'sleeping' | 'exploring';

export interface PetStats {
  hunger: number;        // 0-100
  happiness: number;     // 0-100
  energy: number;        // 0-100
  cleanliness: number;   // 0-100
  health: number;        // 0-100
}

export interface PetData {
  id: string;
  name: string;
  type: string;           // e.g., 'dragon', 'cat', 'bunny'
  level: number;
  experience: number;
  stats: PetStats;
  mood: PetMood;
  currentActivity: PetActivity;
  lastFed?: number;       // timestamp
  lastPlayed?: number;    // timestamp
  lastSlept?: number;     // timestamp
  unlocked: boolean;
}

// ============================================================================
// Room System Types
// ============================================================================

export type RoomType = 'bedroom' | 'kitchen' | 'bathroom' | 'living-room' | 'garden';

export interface RoomItem {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  spriteKey: string;
  interactable: boolean;
  unlocked: boolean;
  cost?: number;
}

export interface RoomData {
  type: RoomType;
  items: RoomItem[];
  backgroundKey: string;
  unlocked: boolean;
}

// ============================================================================
// Player/User System Types
// ============================================================================

export interface Currency {
  coins: number;
  tickets: number;
}

export interface PlayerData {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  experience: number;
  currency: Currency;
  pets: PetData[];
  currentPetId?: string;
  rooms: Record<RoomType, RoomData>;
  currentRoom: RoomType;
  inventory: InventoryItem[];
  achievements: Achievement[];
  settings: PlayerSettings;
}

// ============================================================================
// Inventory & Items Types
// ============================================================================

export type ItemCategory = 'food' | 'toy' | 'furniture' | 'decoration' | 'consumable' | 'special';

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  category: ItemCategory;
  quantity: number;
  iconKey: string;
  usable: boolean;
  tradable: boolean;
}

// ============================================================================
// Shop System Types
// ============================================================================

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  price: number;
  currency: 'coins' | 'tickets';
  iconKey: string;
  stock?: number;      // undefined = unlimited
  limited?: boolean;
  unlockLevel?: number;
}

// ============================================================================
// Quest/Achievement System Types
// ============================================================================

export type AchievementType = 'milestone' | 'collection' | 'activity' | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  progress: number;
  goal: number;
  completed: boolean;
  reward: {
    coins?: number;
    tickets?: number;
    items?: string[];
  };
}

// ============================================================================
// Mini-Game Types
// ============================================================================

export type MiniGameType = 'dungeon' | 'puzzle' | 'rhythm' | 'memory';

export interface MiniGameResult {
  success: boolean;
  score: number;
  coinsEarned: number;
  ticketsEarned: number;
  experienceEarned: number;
  itemsEarned?: string[];
}

// ============================================================================
// Game State Types
// ============================================================================

export interface GameState {
  player: PlayerData;
  currentScene: string;
  lastSaved?: number;
  gameTime: number;      // Total time played in seconds
  version: string;
}

// ============================================================================
// Scene Data Types
// ============================================================================

export interface SceneData {
  previousScene?: string;
  data?: Record<string, any>;
}

// ============================================================================
// Event System Types
// ============================================================================

export type GameEventType =
  | 'pet-feed'
  | 'pet-play'
  | 'pet-sleep'
  | 'room-change'
  | 'item-use'
  | 'item-purchase'
  | 'level-up'
  | 'achievement-unlock';

export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  data?: Record<string, any>;
}

// ============================================================================
// Player Settings Types
// ============================================================================

export interface PlayerSettings {
  music: boolean;
  sfx: boolean;
  musicVolume: number;     // 0-1
  sfxVolume: number;       // 0-1
  notifications: boolean;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

// ============================================================================
// Asset Loading Types
// ============================================================================

export interface AssetManifest {
  images: Array<{
    key: string;
    path: string;
  }>;
  spritesheets: Array<{
    key: string;
    path: string;
    frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig;
  }>;
  audio: Array<{
    key: string;
    path: string | string[];
  }>;
  json: Array<{
    key: string;
    path: string;
  }>;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

// ============================================================================
// API Response Types (for future backend integration)
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface SaveDataResponse extends ApiResponse<GameState> {}

// ============================================================================
// Animation Types
// ============================================================================

export interface AnimationConfig {
  key: string;
  frames: string | Phaser.Types.Animations.AnimationFrame[];
  frameRate?: number;
  repeat?: number;
  yoyo?: boolean;
}

// ============================================================================
// Battle System Types
// ============================================================================

// Nutritional types
export type NutritionalType = 'PROTEIN' | 'CARB' | 'FAT' | 'FIBER' | 'PROCESSED';

// Skill categories
export type SkillCategory =
  | 'PHYSICAL'    // Standard physical attack
  | 'SPECIAL'     // Special attack (type-based)
  | 'RANGED'      // Ranged attack
  | 'BUFF'        // Buff own stats
  | 'DEBUFF'      // Debuff enemy stats
  | 'HEAL'        // Heal own HP
  | 'UTILITY'     // Special utility (trap, protect, etc.)
  | 'EVASIVE'     // Evasion boost
  | 'ULTIMATE';   // Ultimate attack

// Status effects
export type StatusEffect =
  | 'DEHYDRATED'  // 10% HP chip damage per turn (from Salt Spray)
  | 'GREASED'     // Speed sharply lowered
  | 'SOUR'        // Accuracy lowered
  | 'SLEEP'       // Cannot act
  | 'TRAPPED';    // Cannot swap

// Stat modifications
export type StatModifier = 'ATTACK' | 'DEFENSE' | 'SPEED' | 'ACCURACY' | 'EVASION';

// Battle states
export type BattleState =
  | 'INTRO'           // Battle start animation
  | 'PLAYER_TURN'     // Player selecting action
  | 'ENEMY_TURN'      // Enemy AI deciding
  | 'EXECUTING_MOVE'  // Move being executed
  | 'APPLYING_EFFECTS' // Applying status/stat changes
  | 'TURN_END'        // End of turn processing
  | 'VICTORY'         // Player won
  | 'DEFEAT'          // Player lost
  | 'FLED';           // Player fled

// Turn action types
export type TurnActionType = 'SKILL' | 'FEED' | 'SWAP' | 'FLEE';

export interface BattlePetSkill {
  name: string;
  category: SkillCategory;
  type?: NutritionalType;      // Attack type for damage calculation
  power?: number;              // Base damage (if applicable)
  accuracy?: number;           // Hit chance 0-100
  neverMiss?: boolean;         // If true, ignores all accuracy checks (like Pokemon's Swift)
  description: string;
  effect?: {
    statusEffect?: StatusEffect;
    statusChance?: number;     // 0-100
    statModifier?: StatModifier;
    statChange?: number;       // 1 = +1 stage, -1 = -1 stage, 2 = ++, etc.
    targetSelf?: boolean;      // If true, applies to user instead of target
    multihit?: [number, number]; // [min, max] hits
    recoil?: number;           // Recoil damage as % of damage dealt
    healOnKO?: number;         // % of max HP to heal if this KOs target
    bonusAgainstType?: NutritionalType; // Deals extra damage to this type
  };
}

export interface BattlePetData {
  id: string;
  name: string;
  visuals: string;
  personality: string;
  types: NutritionalType[];
  spriteKey: string;           // Phaser sprite key
  baseStats: {
    maxHP: number;
    attack: number;
    defense: number;
    speed: number;
  };
  skills: BattlePetSkill[];
  passiveAbility?: {
    name: string;
    effect: string;
  };
}

export interface BattleBossData {
  id: string;
  name: string;
  locationLevel: number;
  locationName: string;
  visuals: string;
  archetype: string;
  types: NutritionalType[];
  spriteKey: string;
  damagedSpriteKey?: string;   // Sprite when HP < 50%
  baseStats: {
    maxHP: number;
    attack: number;
    defense: number;
    speed: number;
  };
  passiveAbility?: {
    name: string;
    description: string;
    effect?: any;              // Custom logic data
  };
  moveset: BattlePetSkill[];
}

export interface BattleCombatant {
  id: string;
  name: string;
  types: NutritionalType[];
  currentHP: number;
  maxHP: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  skills: BattlePetSkill[];
  statusEffects: StatusEffect[];
  statModifiers: Map<StatModifier, number>; // Stat stage changes (-6 to +6)
  isPlayer: boolean;
  sprite?: Phaser.GameObjects.Image;
  passiveAbility?: any;
}

export interface TurnAction {
  type: TurnActionType;
  skill?: BattlePetSkill;
  itemId?: string;
  targetPetId?: string;
}

export interface BattleMessage {
  text: string;
  type: 'action' | 'damage' | 'effect' | 'status' | 'info';
  timestamp: number;
}

export interface TypeMatchup {
  superEffectiveAgainst: NutritionalType[];
  notVeryEffectiveAgainst: NutritionalType[];
  noEffectAgainst: NutritionalType[];
}

export interface BattleSceneData extends SceneData {
  level: number;
  levelName: string;
  selectedPetId?: string;
  playerPets?: BattlePetData[];
}
