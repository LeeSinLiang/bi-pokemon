/**
 * ActionButtonUI Component
 * Main action buttons for battle (Fight, Feed, Swap, Flee)
 */

import Phaser from 'phaser';
import { BATTLE_CONFIG } from '../data/battleConfig';

export type ActionButtonType = 'FIGHT' | 'FEED' | 'SWAP' | 'FLEE';

const BUTTON_COLORS: Record<ActionButtonType, { normal: number; hover: number }> = {
  FIGHT: { normal: 0xE57373, hover: 0xEF5350 }, // Red
  FEED: { normal: 0x81C784, hover: 0x66BB6A },  // Green
  SWAP: { normal: 0x64B5F6, hover: 0x42A5F5 },  // Blue
  FLEE: { normal: 0x9575CD, hover: 0x7E57C2 },  // Purple
};

const BUTTON_ICONS: Record<ActionButtonType, string> = {
  FIGHT: '⚔️',
  FEED: '🍎',
  SWAP: '↔️',
  FLEE: '💨',
};

export default class ActionButtonUI extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private buttonType: ActionButtonType;
  private label: string;
  private isDisabled: boolean = false;
  private onClick?: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    buttonType: ActionButtonType,
    label: string,
    onClick?: () => void
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.buttonType = buttonType;
    this.label = label;
    this.onClick = onClick;

    this.createButton();
    this.setupInteraction();
  }

  private createButton(): void {
    const config = BATTLE_CONFIG.ACTION_BUTTON;

    // Background
    this.bg = this.scene.add.graphics();
    this.drawBackground(false);
    this.add(this.bg);

    // Icon
    const icon = this.scene.add.text(
      -config.WIDTH / 2 + 12,
      0,
      BUTTON_ICONS[this.buttonType],
      {
        fontSize: '18px',
      }
    );
    icon.setOrigin(0, 0.5);
    this.add(icon);

    // Label text
    const labelText = this.scene.add.text(-8, 0, this.label, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: config.FONT_SIZE,
      color: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center',
    });
    labelText.setOrigin(0, 0.5);
    this.add(labelText);
  }

  private drawBackground(isHovered: boolean): void {
    const config = BATTLE_CONFIG.ACTION_BUTTON;
    const colors = BUTTON_COLORS[this.buttonType];

    this.bg.clear();

    if (this.isDisabled) {
      // Disabled state
      this.bg.fillStyle(0x424242, 0.5);
    } else if (isHovered) {
      // Hover state
      this.bg.fillStyle(colors.hover, 1);
    } else {
      // Normal state
      this.bg.fillStyle(colors.normal, 1);
    }

    this.bg.fillRoundedRect(
      -config.WIDTH / 2,
      -config.HEIGHT / 2,
      config.WIDTH,
      config.HEIGHT,
      12
    );

    // Border
    this.bg.lineStyle(2, 0xFFFFFF, isHovered ? 1 : 0.7);
    this.bg.strokeRoundedRect(
      -config.WIDTH / 2,
      -config.HEIGHT / 2,
      config.WIDTH,
      config.HEIGHT,
      12
    );
  }

  private setupInteraction(): void {
    if (!this.onClick) return;

    const config = BATTLE_CONFIG.ACTION_BUTTON;
    const hitArea = new Phaser.Geom.Rectangle(
      -config.WIDTH / 2,
      -config.HEIGHT / 2,
      config.WIDTH,
      config.HEIGHT
    );
    this.setSize(config.WIDTH, config.HEIGHT);
    this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    // Hover effects
    this.on('pointerover', () => {
      if (!this.isDisabled) {
        this.scene.input.setDefaultCursor('pointer');
        this.drawBackground(true);
        this.scene.tweens.add({
          targets: this,
          scale: 1.05,
          duration: 100,
          ease: 'Power2',
        });
      }
    });

    this.on('pointerout', () => {
      this.scene.input.setDefaultCursor('default');
      this.drawBackground(false);
      this.scene.tweens.add({
        targets: this,
        scale: 1.0,
        duration: 100,
        ease: 'Power2',
      });
    });

    // Click handler
    this.on('pointerdown', () => {
      if (!this.isDisabled && this.onClick) {
        this.onClick();
      }
    });
  }

  /**
   * Enable/disable the button
   */
  public setDisabled(disabled: boolean): void {
    this.isDisabled = disabled;
    this.drawBackground(false);
    this.setAlpha(disabled ? 0.5 : 1.0);

    if (disabled) {
      this.disableInteractive();
    } else {
      this.setInteractive();
    }
  }

  /**
   * Get button type
   */
  public getButtonType(): ActionButtonType {
    return this.buttonType;
  }
}
