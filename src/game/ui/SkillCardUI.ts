/**
 * SkillCardUI Component
 * Interactive skill button for battle
 */

import Phaser from 'phaser';
import { BATTLE_CONFIG } from '../data/battleConfig';
import { TYPE_COLORS } from '../data/typeChart';
import type { BattlePetSkill, NutritionalType } from '../types';
import { createSharpText } from '../utils/textUtils';

export default class SkillCardUI extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private skill: BattlePetSkill;
  private isDisabled: boolean = false;
  private onClick?: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    skill: BattlePetSkill,
    onClick?: () => void
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.skill = skill;
    this.onClick = onClick;

    this.createCard();
    this.setupInteraction();
  }

  private createCard(): void {
    const config = BATTLE_CONFIG.SKILL_CARD;

    // Background with type color
    this.bg = this.scene.add.graphics();
    this.drawBackground(false);
    this.add(this.bg);

    // Skill name
    const skillName = createSharpText(this.scene, 0, 0, this.skill.name, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: config.FONT_SIZE,
      color: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: config.WIDTH - 15 },
      lineSpacing: -4, // Reduce spacing between lines when text wraps
    });
    skillName.setOrigin(0.5, 0.5);
    skillName.setStroke('#000000', 5);
	this.add(skillName);

    // Get actual height of skill name text (accounts for word wrapping)
    const skillNameHeight = skillName.height;

    // Calculate vertical spacing to center both texts in the card
    const totalContentHeight = skillNameHeight + 6; // 6px gap between texts
    const topOffset = -totalContentHeight / 2;

    // Reposition skill name to top of content area
    skillName.y = topOffset + skillNameHeight / 2;

    // Category text - positioned dynamically below skill name
    const categoryY = skillName.y + skillNameHeight / 2 + 6; // 6px gap
    const categoryText = createSharpText(
      this.scene,
      0,
      categoryY,
      this.skill.category,
      {
        fontFamily: 'Nunito, sans-serif',
        fontSize: config.CATEGORY_FONT_SIZE,
        color: '#FFFFFF',
        align: 'center',
      }
    );
    categoryText.setOrigin(0.5, 0.5);
    categoryText.setStroke('#000000', 3);
    this.add(categoryText);
  }

  private drawBackground(isHovered: boolean): void {
    const config = BATTLE_CONFIG.SKILL_CARD;
    const typeColor = this.skill.type
      ? TYPE_COLORS[this.skill.type]
      : '#8D6E63'; // Default brown

    // Convert hex to number if string
    const color =
      typeof typeColor === 'string'
        ? parseInt(typeColor.replace('#', ''), 16)
        : typeColor;

    this.bg.clear();

    if (this.isDisabled) {
      // Disabled state - gray
      this.bg.fillStyle(0x424242, 0.5);
    } else if (isHovered) {
      // Hover state - lighter
      this.bg.fillStyle(color, 1);
    } else {
      // Normal state
      this.bg.fillStyle(color, 0.9);
    }

    this.bg.fillRoundedRect(
      -config.WIDTH / 2,
      -config.HEIGHT / 2,
      config.WIDTH,
      config.HEIGHT,
      8
    );

    // Border
    this.bg.lineStyle(2, 0xFFFFFF, isHovered ? 1 : 0.6);
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

    const config = BATTLE_CONFIG.SKILL_CARD;

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
   * Enable/disable the skill card
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
   * Get the skill data
   */
  public getSkill(): BattlePetSkill {
    return this.skill;
  }
}
