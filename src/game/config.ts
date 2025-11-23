import Phaser from 'phaser';
import MainScene from './scenes/MainScene';
import BottomNavScene from './scenes/BottomNavScene';
import LoadingScene from './scenes/LoadingScene';
import DungeonMapScene from './scenes/DungeonMapScene';

/**
 * Phaser game configuration
 * Sets up the game instance with scenes, dimensions, and renderer settings
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // Use WebGL if available, fallback to Canvas
  width: 400, // Match mobile viewport width from CLAUDE.md (max 400px)
  height: 850, // Match mobile viewport height from CLAUDE.md (max 850px)
  parent: 'game-container', // DOM element ID where the game canvas will be inserted
  backgroundColor: '#FDF6E3', // Match primary-bg color from Tailwind config
  scene: [
    MainScene, // Default starting scene - displays room background
    BottomNavScene, // UI overlay scene - will be launched by MainScene
    LoadingScene, // Loading scene for dungeon transitions
    DungeonMapScene, // Dungeon map scene with level selection
  ],
  physics: {
    default: 'arcade', // Use Arcade physics for simple 2D physics
    arcade: {
      gravity: { y: 0, x: 0 }, // No gravity by default (can be enabled per-object)
      debug: false, // Set to true to see physics bodies during development
    },
  },
  scale: {
    mode: Phaser.Scale.FIT, // Scale to fit parent container while maintaining aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game canvas
  },
  render: {
    pixelArt: false, // Set to true if using pixel art for crisp rendering
    antialias: true, // Smooth edges for non-pixel art
  },
};

/**
 * Initialize and return a new Phaser game instance
 * Call this function to start the game
 */
export function createGame(): Phaser.Game {
  return new Phaser.Game(config);
}

export default config;
