import Phaser from 'phaser';
import config from './game/config';
import './index.css';

// Initialize Phaser game
const game = new Phaser.Game(config);

// Make game instance available globally for debugging (optional)
if (import.meta.env.DEV) {
  (window as any).game = game;
}
