/**
 * ActionButtonUI Component
 * Main action buttons for battle (Fight, Feed, Swap, Flee)
 */

import Phaser from 'phaser';
import { BATTLE_CONFIG } from '../data/battleConfig';
import { createSharpText } from '../utils/textUtils';

export type ActionButtonType = 'FIGHT' | 'FEED' | 'SWAP' | 'FLEE';

const BUTTON_COLORS: Record<ActionButtonType, { normal: number; hover: number }> = {
  FIGHT: { normal: 0xF9D71C, hover: 0xFDD835 }, // Yellow/Gold
  FEED: { normal: 0x9E9E9E, hover: 0xBDBDBD },  // Gray
  SWAP: { normal: 0x64B5F6, hover: 0x42A5F5 },  // Light Blue
  FLEE: { normal: 0xE57373, hover: 0xEF5350 },  // Red
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

    // Label text (centered, uppercase, bold)
    const labelText = createSharpText(this.scene, 0, 0, this.label.toUpperCase(), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center',
    }, false);
    labelText.setOrigin(0.5, 0.5);

    // Add subtle shadow for readability (thinner stroke)
    labelText.setStroke('#000000', 5);
    // labelText.setShadow(1, 1, '#000000', 2, false, true);

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
      8
    );

    // Border (subtle)
    this.bg.lineStyle(2, 0x000000, isHovered ? 0.5 : 0.3);
    this.bg.strokeRoundedRect(
      -config.WIDTH / 2,
      -config.HEIGHT / 2,
      config.WIDTH,
      config.HEIGHT,
      8
    );
  }

  private setupInteraction(): void {
    if (!this.onClick) return;

    const config = BATTLE_CONFIG.ACTION_BUTTON;

    // Use a simple approach: create a transparent hit area sprite
    const hitBox = this.scene.add.rectangle(
      0,
      0,
      config.WIDTH,
      config.HEIGHT,
      0x000000,
      0.01
    );
    hitBox.setInteractive({ useHandCursor: true });
    this.add(hitBox);
    this.sendToBack(hitBox);

    // Hover effects on hitBox
    hitBox.on('pointerover', () => {
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

    hitBox.on('pointerout', () => {
      this.scene.input.setDefaultCursor('default');
      this.drawBackground(false);
      this.scene.tweens.add({
        targets: this,
        scale: 1.0,
        duration: 100,
        ease: 'Power2',
      });
    });

    // Click handler on hitBox
    hitBox.on('pointerdown', () => {
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
