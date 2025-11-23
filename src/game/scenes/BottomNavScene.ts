import Phaser from 'phaser';

/**
 * BottomNavScene - Phaser implementation of the React BottomNav component
 *
 * Recreates the bottom navigation bar with 5 buttons:
 * - History, Game, Camera (main), Character, Shop
 * - Camera button has special elevated styling with coral background
 * - Positioned at the bottom of 400x850 canvas
 */
export default class BottomNavScene extends Phaser.Scene {
  private navButtons: Phaser.GameObjects.Container[] = [];
  private readonly NAV_HEIGHT = 80; // h-20 = 80px (20 * 4)
  private readonly CANVAS_WIDTH = 400;
  private readonly CANVAS_HEIGHT = 850;
  private readonly NAV_BG_COLOR = 0xFFF8E7; // bg-nav-bg from tailwind
  private readonly DASHED_BORDER_COLOR = 0xD7CCC8;

  constructor() {
    super({ key: 'BottomNavScene' });
  }

  preload(): void {
    // Load navigation icons
    this.load.image('history-icon', '/assets/History icon.png');
    this.load.image('game-icon', '/assets/Game Icon.png');
    this.load.image('character-icon', '/assets/Character icon.png');
    this.load.image('shop-icon', '/assets/Shop icon.png');
    this.load.image('camera-bg', '/assets/Main Camera background.png');
    this.load.image('camera-icon', '/assets/camera_icon.png');
  }

  create(): void {
    // Calculate Y position for bottom nav
    const navY = this.CANVAS_HEIGHT - this.NAV_HEIGHT;

    // Create background rectangle for nav bar
    const navBg = this.add.rectangle(
      0,
      navY,
      this.CANVAS_WIDTH,
      this.NAV_HEIGHT,
      this.NAV_BG_COLOR
    );
    navBg.setOrigin(0, 0);

    // Create dashed border on top
    this.createDashedBorder(navY);

    // Define navigation items
    const navItems = [
      { id: 'history', label: 'History', icon: 'history-icon', isMain: false },
      { id: 'dungeon', label: 'Game', icon: 'game-icon', isMain: false },
      { id: 'camera', label: 'Camera', icon: 'camera-icon', isMain: true },
      { id: 'character', label: 'Character', icon: 'character-icon', isMain: false },
      { id: 'shop', label: 'Shop', icon: 'shop-icon', isMain: false }
    ];

    // Calculate button width (flex-1 equivalent - evenly distributed)
    const buttonWidth = this.CANVAS_WIDTH / navItems.length;

    // Create navigation buttons
    navItems.forEach((item, index) => {
      const buttonX = index * buttonWidth;
      const buttonContainer = this.createNavButton(
        item,
        buttonX,
        navY,
        buttonWidth,
        this.NAV_HEIGHT
      );
      this.navButtons.push(buttonContainer);
    });
  }

  /**
   * Creates a dashed border line at the top of the nav bar
   */
  private createDashedBorder(navY: number): void {
    const dashLength = 8;
    const gapLength = 6;
    const totalLength = this.CANVAS_WIDTH;
    let currentX = 0;

    const graphics = this.add.graphics();
    graphics.lineStyle(2, this.DASHED_BORDER_COLOR, 1);

    while (currentX < totalLength) {
      const endX = Math.min(currentX + dashLength, totalLength);
      graphics.lineBetween(currentX, navY, endX, navY);
      currentX += dashLength + gapLength;
    }
  }

  /**
   * Creates a navigation button with icon and click handler
   */
  private createNavButton(
    item: { id: string; label: string; icon: string; isMain: boolean },
    x: number,
    y: number,
    width: number,
    height: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    if (item.isMain) {
      // Camera button - special styling with elevated background
      this.createMainCameraButton(container, item, width, height);
    } else {
      // Regular icon button - fills entire button space
      this.createRegularButton(container, item, width, height);
    }

    // Make container interactive with click handler
    const hitArea = new Phaser.Geom.Rectangle(0, 0, width, height);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.on('pointerdown', () => this.handleNavClick(item.id));

    // Add hover effect
    container.on('pointerover', () => {
      this.input.setDefaultCursor('pointer');
    });
    container.on('pointerout', () => {
      this.input.setDefaultCursor('default');
    });

    return container;
  }

  /**
   * Creates the main camera button with coral background and overlaid icon
   */
  private createMainCameraButton(
    container: Phaser.GameObjects.Container,
    item: { id: string; label: string; icon: string },
    width: number,
    height: number
  ): void {
    // Add camera background image (coral-colored elevated design)
    const cameraBg = this.add.image(width / 2, height / 2, 'camera-bg');
    cameraBg.setOrigin(0.5, 0.5);

    // Scale to fit width while maintaining aspect ratio
    const bgScale = width / cameraBg.width;
    cameraBg.setScale(bgScale);

    container.add(cameraBg);

    // Add camera icon overlaid on background
    const cameraIcon = this.add.image(width / 2, height / 2 - 8, item.icon);
	cameraIcon.setTint(0xFFFFFF); // White tint
    cameraIcon.setOrigin(0.5, 0.5);

    // Scale icon to appropriate size (40px equivalent)
    const iconScale = 40 / cameraIcon.width;
    cameraIcon.setScale(iconScale);
    cameraIcon.setTint(0xFFFFFF); // White tint

    container.add(cameraIcon);

    // Add label text below icon
    const labelText = this.add.text(width / 2, height / 2 + 20, item.label, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '10px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    labelText.setOrigin(0.5, 0.5);

    container.add(labelText);
  }

  /**
   * Creates a regular navigation button with icon filling the space
   */
  private createRegularButton(
    container: Phaser.GameObjects.Container,
    item: { id: string; label: string; icon: string },
    width: number,
    height: number
  ): void {
    // Add icon image that fills the entire button space
    const icon = this.add.image(width / 2, height / 2, item.icon);
    icon.setOrigin(0.5, 0.5);

    // Scale to fit the button area (object-cover equivalent)
    const scaleX = width / icon.width;
    const scaleY = height / icon.height;
    const scale = Math.max(scaleX, scaleY);
    icon.setScale(scale);

    container.add(icon);

    // Note: Label is hidden for regular buttons (sr-only in React version)
    // as the icons have labels baked into them
  }

  /**
   * Handles navigation button clicks
   */
  private handleNavClick(id: string): void {
    console.log(`Navigation clicked: ${id}`);

    // Special handling for dungeon button - launch LoadingScene
    if (id === 'dungeon') {
      console.log('Launching dungeon via LoadingScene');
      // Launch LoadingScene with targetScene parameter
      // The LoadingScene will preload all dungeon assets and transition to DungeonMapScene
      this.scene.start('LoadingScene', { targetScene: 'DungeonMapScene' });
    }
  }

  /**
   * Cleanup when scene shuts down
   */
  shutdown(): void {
    this.navButtons = [];
  }
}
