import Phaser from 'phaser';
import { LEVEL_POSITIONS, LevelPosition } from '../data/dungeonLevelPositions';

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
  private musicThemeButton?: Phaser.GameObjects.Container;
  private musicThemeIndicator?: Phaser.GameObjects.Graphics;
  private musicThemeLabels?: { rock: Phaser.GameObjects.Text; cute: Phaser.GameObjects.Text };

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
    // Set default music theme if not already set
    if (!this.registry.has('battleMusicTheme')) {
      this.registry.set('battleMusicTheme', 'rock');
    }

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

    // Start camera at top to show full background
    this.cameras.main.scrollY = 0;

    // Create level nodes first (so we can calculate positions)
    this.createLevelNodes(bgScale);

    // Smooth scroll to level 1 position with animation
    const level1Pos = LEVEL_POSITIONS.find(pos => pos.level === 1);
    if (level1Pos) {
      const scaledLevel1Y = level1Pos.y * bgScale;
      const gapFromTop = 200; // 300px gap from top edge (more space above level 1)
      const targetScrollY = Math.max(0, scaledLevel1Y - gapFromTop);

      // Wait 500ms to show background, then smoothly scroll to level 1
      this.time.delayedCall(500, () => {
        this.tweens.add({
          targets: this.cameras.main,
          scrollY: targetScrollY,
          duration: 1500, // 1.5 seconds smooth scroll
          ease: 'Power2',
          onComplete: () => {
            console.log(`Scrolled to Level 1 at Y: ${targetScrollY}`);
          }
        });
      });
    }

    // Create back button (fixed to camera)
    // this.createBackButton();

    // Create music theme toggle button (fixed to camera)
    this.createMusicThemeButton();

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
	  if (levelPos.level < 9) {
		const frame = this.add.image(0, 0, 'node-frame');
		frame.setScale(0.35);
		container.add(frame);
	  }

      // Add appropriate icon based on level and lock status
      // Level 2 button now appears at level 1 position, old level 2 position is locked
      let icon: Phaser.GameObjects.Image;
      if (levelPos.level === 1) {
        // Show level 2 icon at level 1 position
        icon = this.add.image(0, 0, 'level-2-icon');
        icon.setScale(0.085);
      } else {
        // All other levels are locked (including old level 2 position)
        icon = this.add.image(0, 0, 'lock-icon');
        icon.setScale(0.08);
      }
      container.add(icon);

      // Add level name text (positioned below node frame)
      // Show "Greasy Swamp" at level 1 position
      const displayName = levelPos.level === 1 ? 'Greasy Swamp' : levelPos.name;
      const levelText = this.add.text(0, 45, displayName, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '10px',
        color: '#FFFFFF',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 80 }
      });
      levelText.setOrigin(0.5, 0);
      container.add(levelText);

      // Make container interactive with larger hit area to cover frame and icon
      // Frame is ~106px, using 80px radius (160px diameter) for generous coverage
      // Hit area is centered at (80, 80) because setSize makes (0,0) the top-left
      container.setSize(160, 160);
      const hitArea = new Phaser.Geom.Circle(80, 80, 80);
      container.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

      // Add click handler
      container.on('pointerdown', () => {
        // Only level 1 position is unlocked (which launches level 2 battle)
        const isLocked = levelPos.level !== 1;
        console.log('=== Level Node Clicked ===');
        console.log(`Level: ${levelPos.level}`);
        console.log(`Name: ${levelPos.name}`);
        console.log(`Position: (${levelPos.x}, ${levelPos.y})`);
        console.log(`Locked: ${isLocked}`);
        console.log('========================');

        // Launch battle for Level 2 when clicking level 1 position
        if (levelPos.level === 1) {
          console.log('Launching Battle Scene for Level 2');
          this.scene.start('BattleScene', {
            level: 2,
            levelName: 'Greasy Swamp',
            previousScene: 'DungeonMapScene',
          });
        } else if (isLocked) {
          console.log('Level is locked!');
        }
      });

      // Add hover effect - smooth scale animation
      container.on('pointerover', () => {
        this.input.setDefaultCursor('pointer');
        // Cancel any existing tweens on this container
        this.tweens.killTweensOf(container);
        this.tweens.add({
          targets: container,
          scale: 1.15,
          duration: 150,
          ease: 'Power2'
        });
      });

      container.on('pointerout', () => {
        this.input.setDefaultCursor('default');
        // Cancel any existing tweens on this container
        this.tweens.killTweensOf(container);
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
   * Create music theme toggle button (slider style)
   * Left side = Rock (default), Right side = Cute
   */
  private createMusicThemeButton(): void {
    // Create slider track background (pill shape) - bigger size
    const trackWidth = 140;
    const trackHeight = 46;
    const trackRadius = 23;

    // Position at top-right corner
    const buttonX = 400 - trackWidth - 10; // 10px padding from right edge
    const buttonY = 16;

    // Create container for the entire button
    this.musicThemeButton = this.add.container(buttonX, buttonY);
    this.musicThemeButton.setScrollFactor(0); // Fix to camera
    this.musicThemeButton.setDepth(1000); // Ensure it's on top

    const track = this.add.graphics();
    track.fillStyle(0x5D4037, 0.9);
    track.fillRoundedRect(0, 0, trackWidth, trackHeight, trackRadius);
    track.lineStyle(2, 0x8D6E63, 1);
    track.strokeRoundedRect(0, 0, trackWidth, trackHeight, trackRadius);
    this.musicThemeButton.add(track);

    // Create sliding indicator (half width of track)
    this.musicThemeIndicator = this.add.graphics();
    this.musicThemeButton.add(this.musicThemeIndicator);

    // Create labels - centered in each half
    const rockLabel = this.add.text(trackWidth / 4, trackHeight / 2, 'Rock', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center'
    });
    rockLabel.setOrigin(0.5, 0.5);

    const cuteLabel = this.add.text((trackWidth * 3) / 4, trackHeight / 2, 'Cute', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      color: '#CCCCCC',
      fontStyle: 'normal',
      align: 'center'
    });
    cuteLabel.setOrigin(0.5, 0.5);

    this.musicThemeLabels = { rock: rockLabel, cute: cuteLabel };
    this.musicThemeButton.add([rockLabel, cuteLabel]);

    // Draw initial indicator position (rock = left)
    const currentTheme = this.registry.get('battleMusicTheme') || 'rock';
    this.updateMusicThemeIndicator(currentTheme === 'rock' ? 'rock' : 'cute', false);

    // Create transparent hit box - same pattern as ActionButtonUI
    const hitBox = this.add.rectangle(
      trackWidth / 2,
      trackHeight / 2,
      trackWidth,
      trackHeight,
      0x000000,
      0.01
    );
    hitBox.setInteractive({ useHandCursor: true });
    this.musicThemeButton.add(hitBox);
    this.musicThemeButton.sendToBack(hitBox);

    // IMPORTANT: hitBox must also ignore camera scroll to work when scrolled
    // Even though it's in a container with scrollFactor(0), the hit detection needs this
    hitBox.setScrollFactor(0);

    // Add click handler
    hitBox.on('pointerdown', () => {
      this.toggleMusicTheme();
    });

    // Add hover effects
    hitBox.on('pointerover', () => {
      this.input.setDefaultCursor('pointer');
      if (this.musicThemeButton) {
        this.tweens.killTweensOf(this.musicThemeButton);
        this.tweens.add({
          targets: this.musicThemeButton,
          scale: 1.05,
          duration: 150,
          ease: 'Power2'
        });
      }
    });

    hitBox.on('pointerout', () => {
      this.input.setDefaultCursor('default');
      if (this.musicThemeButton) {
        this.tweens.killTweensOf(this.musicThemeButton);
        this.tweens.add({
          targets: this.musicThemeButton,
          scale: 1.0,
          duration: 150,
          ease: 'Power2'
        });
      }
    });
  }

  /**
   * Toggle between rock and cute music themes
   */
  private toggleMusicTheme(): void {
    const currentTheme = this.registry.get('battleMusicTheme') || 'rock';
    const newTheme = currentTheme === 'rock' ? 'cute' : 'rock';

    // Update registry
    this.registry.set('battleMusicTheme', newTheme);

    // Update visual indicator with animation
    this.updateMusicThemeIndicator(newTheme, true);

    console.log(`Battle music theme changed to: ${newTheme}`);
  }

  /**
   * Update the visual indicator and labels for the current theme
   */
  private updateMusicThemeIndicator(theme: 'rock' | 'cute', animate: boolean): void {
    if (!this.musicThemeIndicator || !this.musicThemeLabels) return;

    // Calculate indicator position (bigger dimensions)
    const trackWidth = 140;
    const indicatorWidth = 70; // Half of track width
    const indicatorHeight = 42; // Slightly smaller than track (46 - 4)
    const indicatorRadius = 21;
    const indicatorY = 2; // 2px padding from top
    const indicatorX = theme === 'rock' ? 2 : (trackWidth - indicatorWidth - 2); // Left or right with 2px padding

    // Update indicator position
    if (animate) {
      // Animate the indicator slide
      const duration = 200;
      // Calculate start position (opposite of target)
      const startX = theme === 'rock' ? (trackWidth - indicatorWidth - 2) : 2;

      this.tweens.addCounter({
        from: 0,
        to: 1,
        duration: duration,
        ease: 'Power2',
        onUpdate: (tween) => {
          const progress = tween.getValue() ?? 0;
          const currentX = Phaser.Math.Linear(startX, indicatorX, progress);

          this.musicThemeIndicator!.clear();
          this.musicThemeIndicator!.fillStyle(0xFFB74D, 1); // Active orange
          this.musicThemeIndicator!.fillRoundedRect(currentX, indicatorY, indicatorWidth, indicatorHeight, indicatorRadius);
        }
      });
    } else {
      // Immediate update without animation
      this.musicThemeIndicator.clear();
      this.musicThemeIndicator.fillStyle(0xFFB74D, 1); // Active orange
      this.musicThemeIndicator.fillRoundedRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight, indicatorRadius);
    }

    // Update label styles
    if (theme === 'rock') {
      this.musicThemeLabels.rock.setStyle({ color: '#FFFFFF', fontStyle: 'bold' });
      this.musicThemeLabels.cute.setStyle({ color: '#CCCCCC', fontStyle: 'normal' });
    } else {
      this.musicThemeLabels.rock.setStyle({ color: '#CCCCCC', fontStyle: 'normal' });
      this.musicThemeLabels.cute.setStyle({ color: '#FFFFFF', fontStyle: 'bold' });
    }
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
