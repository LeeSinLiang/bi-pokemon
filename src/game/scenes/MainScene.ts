import Phaser from 'phaser';

/**
 * MainScene - The primary game scene displaying the room background
 * This scene handles the main game view and launches the BottomNavScene as an overlay
 */
export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  /**
   * Preload assets required for the main scene
   */
  preload(): void {
    // Load the room background image
    this.load.image('room_bg', '/src/assets/room_bg.jpeg');
  }

  /**
   * Create the scene and set up the initial display
   */
  create(): void {
    // Get the game dimensions
    const { width, height } = this.scale;

    // Add the room background image
    // Using setOrigin(0.5, 0.5) to center it
    const background = this.add.image(width / 2, height / 2, 'room_bg');

    // Scale the background to fit the screen while maintaining aspect ratio
    const scaleX = width / background.width;
    const scaleY = height / background.height;
    const scale = Math.max(scaleX, scaleY);
    background.setScale(scale);

    // Create TopBar UI
    this.createTopBar();

    // Launch the BottomNavScene as a parallel overlay scene
    // This allows both scenes to run simultaneously
    this.scene.launch('BottomNavScene');

    console.log('MainScene created and BottomNavScene launched');
  }

  /**
   * Create the TopBar UI with avatar and currency displays
   */
  private createTopBar(): void {
    const padding = 16;
    const topY = 16;

    // --- LEFT SIDE: Avatar ---
    const avatarX = padding + 32; // Center of 64px circle
    const avatarY = topY + 32;

    // Avatar background circle
    const avatarBg = this.add.circle(avatarX, avatarY, 32, 0xE0C3A1);
    avatarBg.setStrokeStyle(2, 0x8D6E63);

    // Avatar cat emoji placeholder
    const avatarText = this.add.text(avatarX, avatarY, '🐱', {
      fontSize: '32px',
      fontFamily: 'Arial'
    });
    avatarText.setOrigin(0.5, 0.5);

    // --- RIGHT SIDE: Currency Displays ---
    const rightX = 400 - padding; // Game width is 400

    // Currency container Y positions
    const coinsY = topY + 12;
    const ticketsY = coinsY + 40; // 32px height + 8px gap

    // Create Coins Display
    this.createCurrencyDisplay(rightX, coinsY, '👑', 0xFFD54F, 0xFFB300, '31', 'coins');

    // Create Tickets Display
    this.createCurrencyDisplay(rightX, ticketsY, '🎫', 0x64B5F6, 0x42A5F5, '3', 'tickets');
  }

  /**
   * Create a currency display row (icon + value + plus button)
   * @param x - Right-aligned X position
   * @param y - Top Y position
   * @param iconEmoji - Emoji to use as icon
   * @param iconBgColor - Background color for icon circle
   * @param iconBorderColor - Border color for icon circle
   * @param value - Currency value to display
   * @param type - Currency type for logging
   */
  private createCurrencyDisplay(
    x: number,
    y: number,
    iconEmoji: string,
    iconBgColor: number,
    iconBorderColor: number,
    value: string,
    type: string
  ): void {
    const containerWidth = 100;
    const containerHeight = 32;
    const containerX = x - containerWidth;

    // Background rounded rectangle
    const bg = this.add.graphics();
    bg.fillStyle(0xFFF8E7, 1);
    bg.lineStyle(2, 0xE0E0E0, 1);
    bg.fillRoundedRect(containerX, y, containerWidth, containerHeight, 16);
    bg.strokeRoundedRect(containerX, y, containerWidth, containerHeight, 16);

    // Icon circle background
    const iconCircleX = containerX + 16;
    const iconCircleY = y + 16;
    const iconCircle = this.add.circle(iconCircleX, iconCircleY, 12, iconBgColor);
    iconCircle.setStrokeStyle(1, iconBorderColor);

    // Icon emoji
    const iconText = this.add.text(iconCircleX, iconCircleY, iconEmoji, {
      fontSize: '14px',
      fontFamily: 'Arial'
    });
    iconText.setOrigin(0.5, 0.5);

    // Value text
    const valueText = this.add.text(iconCircleX + 18, iconCircleY, value, {
      fontSize: '14px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#5D4037'
    });
    valueText.setOrigin(0, 0.5);

    // Plus button circle
    const plusButtonX = containerX + containerWidth - 14;
    const plusButtonY = y + 16;
    const plusButton = this.add.circle(plusButtonX, plusButtonY, 10, 0x81C784);
    plusButton.setStrokeStyle(0);

    // Plus sign
    const plusText = this.add.text(plusButtonX, plusButtonY, '+', {
      fontSize: '16px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#FFFFFF'
    });
    plusText.setOrigin(0.5, 0.5);

    // Make plus button interactive
    plusButton.setInteractive({ useHandCursor: true });
    plusText.setInteractive({ useHandCursor: true });

    // Button hover effect
    plusButton.on('pointerover', () => {
      plusButton.setFillStyle(0x66BB6A);
    });

    plusButton.on('pointerout', () => {
      plusButton.setFillStyle(0x81C784);
    });

    plusButton.on('pointerdown', () => {
      console.log(`Plus button clicked for ${type}`);
    });

    plusText.on('pointerdown', () => {
      console.log(`Plus button clicked for ${type}`);
    });
  }

  /**
   * Update loop - called every frame
   * @param time - The current time
   * @param delta - The delta time in ms since the last frame
   */
  update(_time: number, _delta: number): void {
    // Main scene update logic will go here
    // Currently empty as no dynamic behavior is needed yet
  }
}
