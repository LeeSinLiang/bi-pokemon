/**
 * HealthBarUI Component
 * Displays HP bar with smooth depletion animation
 */

import Phaser from 'phaser';
import { BATTLE_CONFIG, getHPBarColor } from '../data/battleConfig';

export default class HealthBarUI extends Phaser.GameObjects.Container {
  private background!: Phaser.GameObjects.Graphics;
  private fill!: Phaser.GameObjects.Graphics;
  private border!: Phaser.GameObjects.Graphics;
  private nameText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;

  private currentHP: number;
  private maxHP: number;
  private targetHPWidth: number;
  private displayedHPWidth: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    currentHP: number,
    maxHP: number
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.currentHP = currentHP;
    this.maxHP = maxHP;
    this.targetHPWidth = BATTLE_CONFIG.HP_BAR.WIDTH;
    this.displayedHPWidth = BATTLE_CONFIG.HP_BAR.WIDTH;

    this.createHealthBar(name);
  }

  private createHealthBar(name: string): void {
    const config = BATTLE_CONFIG.HP_BAR;

    // Name text above HP bar
    this.nameText = this.scene.add.text(-config.WIDTH / 2, -25, name, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '12px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    });
    this.nameText.setOrigin(0, 0.5);
    this.add(this.nameText);

    // HP text (HP: 100/100)
    this.hpText = this.scene.add.text(
      config.WIDTH / 2,
      -25,
      `HP: ${this.currentHP}/${this.maxHP}`,
      {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '10px',
        color: '#FFFFFF',
        fontStyle: 'bold',
      }
    );
    this.hpText.setOrigin(1, 0.5);
    this.add(this.hpText);

    // Background
    this.background = this.scene.add.graphics();
    this.background.fillStyle(BATTLE_CONFIG.HP_COLORS.BACKGROUND, 1);
    this.background.fillRect(-config.WIDTH / 2, -config.HEIGHT / 2, config.WIDTH, config.HEIGHT);
    this.add(this.background);

    // HP fill bar
    this.fill = this.scene.add.graphics();
    this.updateFillBar(this.displayedHPWidth);
    this.add(this.fill);

    // Border
    this.border = this.scene.add.graphics();
    this.border.lineStyle(config.BORDER_WIDTH, BATTLE_CONFIG.HP_COLORS.BORDER, 1);
    this.border.strokeRect(
      -config.WIDTH / 2,
      -config.HEIGHT / 2,
      config.WIDTH,
      config.HEIGHT
    );
    this.add(this.border);
  }

  private updateFillBar(width: number): void {
    const config = BATTLE_CONFIG.HP_BAR;
    const hpPercent = this.currentHP / this.maxHP;
    const color = getHPBarColor(hpPercent);

    this.fill.clear();
    this.fill.fillStyle(color, 1);
    this.fill.fillRect(
      -config.WIDTH / 2,
      -config.HEIGHT / 2,
      width,
      config.HEIGHT
    );
  }

  /**
   * Set HP with smooth animation
   */
  public setHP(newHP: number, animate: boolean = true): void {
    this.currentHP = Math.max(0, Math.min(this.maxHP, newHP));
    const hpPercent = this.currentHP / this.maxHP;
    this.targetHPWidth = BATTLE_CONFIG.HP_BAR.WIDTH * hpPercent;

    // Update HP text immediately
    this.hpText.setText(`HP: ${Math.ceil(this.currentHP)}/${this.maxHP}`);

    if (animate) {
      // Smooth depletion animation
      this.scene.tweens.add({
        targets: this,
        displayedHPWidth: this.targetHPWidth,
        duration: BATTLE_CONFIG.HP_BAR.ANIMATION_DURATION,
        ease: 'Power2',
        onUpdate: () => {
          this.updateFillBar(this.displayedHPWidth);
        },
      });
    } else {
      // Instant update
      this.displayedHPWidth = this.targetHPWidth;
      this.updateFillBar(this.displayedHPWidth);
    }
  }

  /**
   * Get current HP
   */
  public getCurrentHP(): number {
    return this.currentHP;
  }

  /**
   * Get max HP
   */
  public getMaxHP(): number {
    return this.maxHP;
  }

  /**
   * Get HP percentage (0-1)
   */
  public getHPPercent(): number {
    return this.currentHP / this.maxHP;
  }
}
