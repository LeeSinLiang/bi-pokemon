import Phaser from 'phaser';

/**
 * LoadingScene - Themed loading scene for dungeon transitions
 * Displays a loading indicator with progress bar while preloading dungeon assets
 * Minimum duration of 1.5 seconds for smooth user experience
 */
export default class LoadingScene extends Phaser.Scene {
  private targetScene?: string;
  private loadingText?: Phaser.GameObjects.Text;
  private progressBar?: Phaser.GameObjects.Graphics;
  private progressBox?: Phaser.GameObjects.Graphics;
  private percentText?: Phaser.GameObjects.Text;
  private glowCircle?: Phaser.GameObjects.Graphics;
  private corruptionEffect?: Phaser.GameObjects.Graphics;
  private startTime: number = 0;
  private minLoadTime: number = 1500; // 1.5 seconds minimum
  private assetsLoaded: boolean = false;
  private hasTransitioned: boolean = false;

  constructor() {
    super({ key: 'LoadingScene' });
  }

  /**
   * Initialize the scene with optional target scene parameter
   * @param data - Scene initialization data containing targetScene
   */
  init(data: { targetScene?: string }): void {
    this.targetScene = data.targetScene || 'DungeonMapScene';
    this.startTime = Date.now();
    this.assetsLoaded = false;
    this.hasTransitioned = false;
    console.log(`LoadingScene initialized, will transition to: ${this.targetScene}`);
  }

  /**
   * Preload all dungeon assets
   */
  preload(): void {
    const { width, height } = this.scale;

    // Create loading UI elements
    this.createLoadingUI(width, height);

    // Set up loading event listeners
    this.setupLoadingEvents();

    // Preload dungeon assets
    this.loadDungeonAssets();
  }

  /**
   * Create the loading UI with progress bar and animated elements
   */
  private createLoadingUI(width: number, height: number): void {
    // Set cream background color matching main game
    this.cameras.main.setBackgroundColor(0xFDF6E3);

    const centerX = width / 2;
    const centerY = height / 2;

    // Create animated corruption effect (rotating circle with gradient)
    this.corruptionEffect = this.add.graphics();
    this.corruptionEffect.setPosition(centerX, centerY - 100);

    // Create pulsing glow circle
    this.glowCircle = this.add.graphics();
    this.glowCircle.setPosition(centerX, centerY - 100);

    // Loading text
    this.loadingText = this.add.text(centerX, centerY, 'Entering the Corrupted Grove...', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '20px',
      color: '#8D6E63',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 300 }
    });
    this.loadingText.setOrigin(0.5);

    // Progress bar background box
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0xE0E0E0, 0.8);
    this.progressBox.fillRoundedRect(centerX - 150, centerY + 60, 300, 30, 15);

    // Progress bar (will be filled as loading progresses)
    this.progressBar = this.add.graphics();

    // Percentage text
    this.percentText = this.add.text(centerX, centerY + 75, '0%', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '16px',
      color: '#5D4037',
      fontStyle: 'bold'
    });
    this.percentText.setOrigin(0.5);

    // Create tweens for animated effects
    this.createAnimations();
  }

  /**
   * Set up loading event listeners for progress tracking
   */
  private setupLoadingEvents(): void {
    // Update progress bar as files load
    this.load.on('progress', (value: number) => {
      this.updateProgress(value);
    });

    // Mark assets as loaded when complete
    this.load.on('complete', () => {
      this.assetsLoaded = true;
      console.log('All dungeon assets loaded - assetsLoaded:', this.assetsLoaded);
    });

    // Log any file load errors
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error(`Error loading file: ${file.key}`);
    });
  }

  /**
   * Load all dungeon-related assets
   */
  private loadDungeonAssets(): void {
    // Preload dungeon background
    this.load.image('corrupted-grove-bg', '/assets/dungeon/corrupted-grove-bg.png');

    // Preload dungeon UI elements (already exist)
    this.load.image('node-frame', '/assets/dungeon/node-frame.png');
    this.load.image('lock-icon', '/assets/dungeon/lock-icon.png');
    this.load.image('star-icon', '/assets/dungeon/star-icon.png');

    // Preload level icons (only levels 1-2 for now)
    this.load.image('level-1-icon', '/assets/dungeon/level-1-icon.png');
    this.load.image('level-2-icon', '/assets/dungeon/level-2-icon.png');

    // Note: Levels 3-10 will use placeholders (frame + lock) so no need to preload
  }

  /**
   * Update progress bar and percentage text
   */
  private updateProgress(value: number): void {
    if (!this.progressBar || !this.percentText) return;

    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear and redraw progress bar
    this.progressBar.clear();
    this.progressBar.fillStyle(0xA5D6A7, 1);
    this.progressBar.fillRoundedRect(
      centerX - 150,
      centerY + 60,
      300 * value,
      30,
      15
    );

    // Update percentage text
    const percent = Math.floor(value * 100);
    this.percentText.setText(`${percent}%`);
  }

  /**
   * Create smooth animations for loading effects
   */
  private createAnimations(): void {
    // Pulsing glow animation
    if (this.glowCircle) {
      this.tweens.add({
        targets: this.glowCircle,
        alpha: { from: 0.3, to: 0.8 },
        scale: { from: 1, to: 1.2 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Rotating corruption effect
    if (this.corruptionEffect) {
      this.tweens.add({
        targets: this.corruptionEffect,
        angle: 360,
        duration: 2000,
        repeat: -1,
        ease: 'Linear'
      });
    }

    // Subtle text pulse
    if (this.loadingText) {
      this.tweens.add({
        targets: this.loadingText,
        alpha: { from: 0.7, to: 1 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Create scene and start update loop
   */
  create(): void {
    console.log('LoadingScene created');
  }

  /**
   * Update loop - draws animated loading effects and checks for transition
   */
  update(): void {
    // Draw animated corruption effect (rotating pixel-art style circle)
    if (this.corruptionEffect) {
      this.corruptionEffect.clear();

      // Draw multiple rings for corruption effect
      for (let i = 0; i < 3; i++) {
        const radius = 30 + (i * 8);
        const alpha = 0.4 - (i * 0.1);

        // Alternating colors for corruption effect
        const color = i % 2 === 0 ? 0x9C27B0 : 0x7B1FA2;

        this.corruptionEffect.lineStyle(3, color, alpha);
        this.corruptionEffect.strokeCircle(0, 0, radius);
      }

      // Add corruption "spikes"
      const time = this.time.now / 100;
      for (let angle = 0; angle < 360; angle += 30) {
        const radian = Phaser.Math.DegToRad(angle + time);
        const startX = Math.cos(radian) * 40;
        const startY = Math.sin(radian) * 40;
        const endX = Math.cos(radian) * 50;
        const endY = Math.sin(radian) * 50;

        this.corruptionEffect.lineStyle(2, 0xE1BEE7, 0.6);
        this.corruptionEffect.lineBetween(startX, startY, endX, endY);
      }
    }

    // Draw pulsing glow circle
    if (this.glowCircle) {
      this.glowCircle.clear();
      this.glowCircle.fillStyle(0xCE93D8, 0.3);
      this.glowCircle.fillCircle(0, 0, 50);
      this.glowCircle.fillStyle(0xBA68C8, 0.2);
      this.glowCircle.fillCircle(0, 0, 40);
    }

    // Check if minimum time has elapsed AND assets are loaded
    const elapsedTime = Date.now() - this.startTime;

    // Debug logging
    if (this.assetsLoaded && elapsedTime >= this.minLoadTime && !this.hasTransitioned) {
      console.log('Conditions met - transitioning:', {
        elapsedTime,
        minLoadTime: this.minLoadTime,
        assetsLoaded: this.assetsLoaded,
        targetScene: this.targetScene
      });
      this.hasTransitioned = true;
      this.transitionToTargetScene();
    }
  }

  /**
   * Transition to the target scene
   */
  private transitionToTargetScene(): void {
    if (!this.targetScene) {
      console.error('No target scene specified');
      return;
    }

    console.log(`Transitioning to ${this.targetScene}`);

    // Fade out transition
    this.cameras.main.fadeOut(300, 253, 246, 227);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Start the target scene
      this.scene.start(this.targetScene!);
    });
  }
}
