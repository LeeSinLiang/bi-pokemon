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
