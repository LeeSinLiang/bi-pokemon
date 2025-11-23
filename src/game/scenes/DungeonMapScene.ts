import Phaser from 'phaser';
import { LEVEL_POSITIONS, LevelPosition } from '../config/dungeonLevelPositions';

/**
 * DungeonMapScene - Scrollable dungeon map with level nodes
 *
 * Features:
 * - 512x2048 background image scaled to fit 400px width
 * - 10 level nodes positioned throughout the map
 * - Touch drag scrolling from top (treehouse) to bottom (deep dungeon)
 * - Level 1-2 unlocked with custom icons
 * - Level 3-10 locked with lock icons
 * - Back button to return to MainScene
 */
export default class DungeonMapScene extends Phaser.Scene {
  private isDragging = false;
  private dragStartY = 0;
  private dragStartScrollY = 0;
  private scrollVelocity = 0;
  private background!: Phaser.GameObjects.Image;
  private levelNodes: Phaser.GameObjects.Container[] = [];

  // Constants
  private readonly GAME_WIDTH = 400;
  private readonly GAME_HEIGHT = 850;
  private readonly BG_WIDTH = 512;
  private readonly BG_HEIGHT = 2048;

  constructor() {
    super({ key: 'DungeonMapScene' });
  }

  /**
   * Preload dungeon assets
   */
  preload(): void {
    // Load dungeon background
    this.load.image('dungeon-bg', '/assets/dungeon/corrupted-grove-bg.png');

    // Load level node assets
    this.load.image('node-frame', '/assets/dungeon/node-frame.png');
    this.load.image('level-1-icon', '/assets/dungeon/level-1-icon.png');
    this.load.image('level-2-icon', '/assets/dungeon/level-2-icon.png');
    this.load.image('lock-icon', '/assets/dungeon/lock-icon.png');
    this.load.image('star-icon', '/assets/dungeon/star-icon.png');
  }

  /**
   * Create the dungeon map scene
   */
  create(): void {
    // Calculate background scale to fit 400px width
    const bgScale = this.GAME_WIDTH / this.BG_WIDTH; // 400 / 512 ≈ 0.78125
    const scaledBgHeight = this.BG_HEIGHT * bgScale; // 2048 * 0.78125 = 1600

    // Add background image centered at the top
    this.background = this.add.image(
      this.GAME_WIDTH / 2,
      scaledBgHeight / 2,
      'dungeon-bg'
    );
    this.background.setScale(bgScale);
    this.background.setOrigin(0.5, 0.5);

    // Set camera bounds to match scaled background
    this.cameras.main.setBounds(0, 0, this.GAME_WIDTH, scaledBgHeight);

    // Start camera at BOTTOM showing level 1 (treehouse at top)
    // Position camera to show the top portion (treehouse area)
    this.cameras.main.scrollY = 0; // Start at top showing treehouse

    // Create level nodes
    this.createLevelNodes(bgScale);

    // Create back button (fixed to camera)
    this.createBackButton();

    // Set up touch drag scrolling
    this.setupScrolling();

    console.log('DungeonMapScene created');
    console.log(`Background scaled height: ${scaledBgHeight}`);
    console.log(`Camera bounds: 0, 0, ${this.GAME_WIDTH}, ${scaledBgHeight}`);
  }

  /**
   * Create interactive level nodes at their positions
   */
  private createLevelNodes(bgScale: number): void {
    LEVEL_POSITIONS.forEach((levelPos: LevelPosition) => {
      // Scale the position coordinates to match the background scale
      const scaledX = levelPos.x * bgScale;
      const scaledY = levelPos.y * bgScale;

      // Create container for the level node
      const container = this.add.container(scaledX, scaledY);

      // Add node frame background (302x285 original - scale to ~70px)
      const frame = this.add.image(0, 0, 'node-frame');
      frame.setScale(0.23); // 302 * 0.23 ≈ 70px
      container.add(frame);

      // Add appropriate icon based on level and lock status
      let icon: Phaser.GameObjects.Image;
      if (levelPos.level === 1) {
        icon = this.add.image(0, 0, 'level-1-icon');
        icon.setScale(0.11); // 500 * 0.11 ≈ 55px
      } else if (levelPos.level === 2) {
        icon = this.add.image(0, 0, 'level-2-icon');
        icon.setScale(0.11); // 500 * 0.11 ≈ 55px
      } else {
        // Levels 3-10: locked
        icon = this.add.image(0, 0, 'lock-icon');
        icon.setScale(0.12); // Adjust for lock icon size
      }
      container.add(icon);

      // Add level number text (smaller and positioned below frame)
      const levelText = this.add.text(0, 42, `${levelPos.level}`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '12px',
        color: '#FFFFFF',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      });
      levelText.setOrigin(0.5, 0.5);
      container.add(levelText);

      // Make container interactive (smaller hit area)
      const hitArea = new Phaser.Geom.Circle(0, 0, 35);
      container.setSize(70, 70);
      container.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

      // Add click handler
      container.on('pointerdown', () => {
        console.log('=== Level Node Clicked ===');
        console.log(`Level: ${levelPos.level}`);
        console.log(`Name: ${levelPos.name}`);
        console.log(`Position: (${levelPos.x}, ${levelPos.y})`);
        console.log(`Locked: ${levelPos.isLocked}`);
        console.log('========================');
      });

      // Add hover effect
      container.on('pointerover', () => {
        this.input.setDefaultCursor('pointer');
        container.setScale(1.1);
        this.tweens.add({
          targets: container,
          scale: 1.15,
          duration: 150,
          ease: 'Power2'
        });
      });

      container.on('pointerout', () => {
        this.input.setDefaultCursor('default');
        this.tweens.add({
          targets: container,
          scale: 1.0,
          duration: 150,
          ease: 'Power2'
        });
      });

      this.levelNodes.push(container);
    });

    console.log(`Created ${this.levelNodes.length} level nodes`);
  }

  /**
   * Create back button fixed to camera view
   */
  private createBackButton(): void {
    // Create container for back button
    const container = this.add.container(16, 16);
    container.setScrollFactor(0); // Fix to camera (not world position)
    container.setDepth(1000); // Ensure it's on top

    // Background for button
    const bg = this.add.graphics();
    bg.fillStyle(0x5D4037, 0.9);
    bg.fillRoundedRect(0, 0, 80, 36, 18);
    bg.lineStyle(2, 0x8D6E63, 1);
    bg.strokeRoundedRect(0, 0, 80, 36, 18);
    container.add(bg);

    // Back arrow text
    const arrowText = this.add.text(12, 18, '←', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    arrowText.setOrigin(0, 0.5);
    container.add(arrowText);

    // Back text
    const backText = this.add.text(32, 18, 'Back', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    backText.setOrigin(0, 0.5);
    container.add(backText);

    // Make interactive
    const hitArea = new Phaser.Geom.Rectangle(0, 0, 80, 36);
    container.setSize(80, 36);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    // Add click handler to return to MainScene
    container.on('pointerdown', () => {
      console.log('Back button clicked - returning to MainScene');
      this.scene.start('MainScene');
    });

    // Add hover effect
    container.on('pointerover', () => {
      this.input.setDefaultCursor('pointer');
      bg.clear();
      bg.fillStyle(0x6D4C41, 0.9);
      bg.fillRoundedRect(0, 0, 80, 36, 18);
      bg.lineStyle(2, 0x8D6E63, 1);
      bg.strokeRoundedRect(0, 0, 80, 36, 18);
    });

    container.on('pointerout', () => {
      this.input.setDefaultCursor('default');
      bg.clear();
      bg.fillStyle(0x5D4037, 0.9);
      bg.fillRoundedRect(0, 0, 80, 36, 18);
      bg.lineStyle(2, 0x8D6E63, 1);
      bg.strokeRoundedRect(0, 0, 80, 36, 18);
    });
  }

  /**
   * Set up touch drag scrolling for the dungeon map
   */
  private setupScrolling(): void {
    // Make the entire scene interactive for dragging
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartY = pointer.y;
      this.dragStartScrollY = this.cameras.main.scrollY;
      this.scrollVelocity = 0;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const deltaY = this.dragStartY - pointer.y;
        const newScrollY = this.dragStartScrollY + deltaY;

        // Clamp scroll position
        const maxScrollY = this.cameras.main.getBounds().height - this.GAME_HEIGHT;
        this.cameras.main.scrollY = Phaser.Math.Clamp(newScrollY, 0, maxScrollY);

        // Calculate velocity for momentum
        this.scrollVelocity = deltaY;
      }
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });
  }

  /**
   * Update loop for smooth scrolling with momentum
   */
  update(_time: number, _delta: number): void {
    // Apply velocity damping for momentum scrolling
    if (!this.isDragging && Math.abs(this.scrollVelocity) > 0.5) {
      this.scrollVelocity *= 0.92; // Damping factor

      const newScrollY = this.cameras.main.scrollY + this.scrollVelocity;
      const maxScrollY = this.cameras.main.getBounds().height - this.GAME_HEIGHT;

      this.cameras.main.scrollY = Phaser.Math.Clamp(newScrollY, 0, maxScrollY);
    } else if (!this.isDragging) {
      this.scrollVelocity = 0;
    }
  }

  /**
   * Cleanup when scene shuts down
   */
  shutdown(): void {
    this.levelNodes = [];
    this.isDragging = false;
    this.scrollVelocity = 0;
  }
}
