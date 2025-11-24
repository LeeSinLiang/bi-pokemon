/**
 * BattleVFX Helper Class
 * Creates visual effects for battle actions
 */

import Phaser from 'phaser';
import type { SkillCategory } from '../types';

export default class BattleVFX {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Show damage number popup
   */
  public showDamageNumber(
    x: number,
    y: number,
    damage: number,
    isCritical: boolean = false,
    isSuperEffective: boolean = false
  ): void {
    const damageText = this.scene.add.text(x, y, `-${Math.ceil(damage)}`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isCritical ? '32px' : '24px',
      color: isCritical ? '#FFD700' : '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    damageText.setOrigin(0.5);

    // Add "CRITICAL!" text if critical hit
    if (isCritical) {
      const critText = this.scene.add.text(x, y - 30, 'CRITICAL!', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '14px',
        color: '#FFD700',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      });
      critText.setOrigin(0.5);

      this.scene.tweens.add({
        targets: critText,
        y: critText.y - 40,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => critText.destroy(),
      });
    }

    // Add "Super Effective!" text
    if (isSuperEffective) {
      const effectText = this.scene.add.text(x, y + 30, 'Super Effective!', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '12px',
        color: '#81C784',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      });
      effectText.setOrigin(0.5);

      this.scene.tweens.add({
        targets: effectText,
        y: effectText.y + 20,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => effectText.destroy(),
      });
    }

    // Animate damage number
    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy(),
    });
  }

  /**
   * Show heal number popup
   */
  public showHealNumber(x: number, y: number, heal: number): void {
    const healText = this.scene.add.text(x, y, `+${Math.ceil(heal)}`, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '24px',
      color: '#81C784',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    healText.setOrigin(0.5);

    this.scene.tweens.add({
      targets: healText,
      y: healText.y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => healText.destroy(),
    });
  }

  /**
   * Attack impact effect
   */
  public createImpactEffect(
    x: number,
    y: number,
    category: SkillCategory
  ): void {
    const graphics = this.scene.add.graphics();

    switch (category) {
      case 'PHYSICAL':
        this.createPhysicalImpact(graphics, x, y);
        break;
      case 'RANGED':
      case 'SPECIAL':
        this.createSpecialImpact(graphics, x, y);
        break;
      default:
        this.createGenericImpact(graphics, x, y);
    }

    // Fade out and destroy
    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => graphics.destroy(),
    });
  }

  private createPhysicalImpact(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // Star burst effect for physical attacks
    graphics.lineStyle(4, 0xFFFFFF, 1);

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const length = 30;
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      graphics.lineBetween(x, y, endX, endY);
    }

    // Animate outward expansion
    this.scene.tweens.add({
      targets: graphics,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      ease: 'Power2',
    });
  }

  private createSpecialImpact(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // Circular rings for special attacks
    graphics.lineStyle(3, 0x64B5F6, 1);
    graphics.strokeCircle(x, y, 20);
    graphics.strokeCircle(x, y, 35);

    // Animate outward expansion
    this.scene.tweens.add({
      targets: graphics,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      ease: 'Power2',
    });
  }

  private createGenericImpact(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // Simple circle flash
    graphics.fillStyle(0xFFFFFF, 0.8);
    graphics.fillCircle(x, y, 30);

    this.scene.tweens.add({
      targets: graphics,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      ease: 'Power2',
    });
  }

  /**
   * Status effect application visual
   */
  public showStatusEffect(
    x: number,
    y: number,
    statusIcon: string,
    statusName: string
  ): void {
    const icon = this.scene.add.text(x, y, statusIcon, {
      fontSize: '32px',
    });
    icon.setOrigin(0.5);

    const nameText = this.scene.add.text(x, y + 30, statusName, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '12px',
      color: '#FFD54F',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    nameText.setOrigin(0.5);

    // Pulse animation
    this.scene.tweens.add({
      targets: [icon, nameText],
      scale: 1.2,
      yoyo: true,
      duration: 200,
      repeat: 2,
      onComplete: () => {
        this.scene.tweens.add({
          targets: [icon, nameText],
          alpha: 0,
          duration: 500,
          onComplete: () => {
            icon.destroy();
            nameText.destroy();
          },
        });
      },
    });
  }

  /**
   * Stat change indicator (↑ or ↓)
   */
  public showStatChange(
    x: number,
    y: number,
    statName: string,
    change: number
  ): void {
    const arrow = change > 0 ? '⬆️' : '⬇️';
    const color = change > 0 ? '#81C784' : '#E57373';
    const stages = Math.abs(change) > 1 ? `${Math.abs(change)}x` : '';

    const text = this.scene.add.text(
      x,
      y,
      `${statName} ${arrow}${stages}`,
      {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '14px',
        color: color,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      }
    );
    text.setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  /**
   * Sparkle particles for buffs
   */
  public createBuffParticles(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const sparkle = this.scene.add.text(
          x + (Math.random() - 0.5) * 40,
          y + (Math.random() - 0.5) * 40,
          '✨',
          { fontSize: '16px' }
        );

        this.scene.tweens.add({
          targets: sparkle,
          y: sparkle.y - 30,
          alpha: 0,
          duration: 800,
          ease: 'Power2',
          onComplete: () => sparkle.destroy(),
        });
      });
    }
  }

  /**
   * Miss indicator
   */
  public showMiss(x: number, y: number): void {
    const missText = this.scene.add.text(x, y, 'MISS!', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '24px',
      color: '#9E9E9E',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    missText.setOrigin(0.5);

    this.scene.tweens.add({
      targets: missText,
      y: missText.y - 40,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => missText.destroy(),
    });
  }

  /**
   * Evade indicator (for boss passive)
   */
  public showEvade(x: number, y: number): void {
    const evadeText = this.scene.add.text(x, y, 'EVADED!', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '20px',
      color: '#64B5F6',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    evadeText.setOrigin(0.5);

    this.scene.tweens.add({
      targets: evadeText,
      x: evadeText.x + 30,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => evadeText.destroy(),
    });
  }
}
