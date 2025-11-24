/**
 * SwapMenuUI Component
 * Pokemon-style party menu for swapping pets
 */

import Phaser from 'phaser';
import type { BattleCombatant } from '../types';
import { TYPE_ICONS } from '../data/typeChart';
import { createSharpText } from '../utils/textUtils';

interface PetSlotData {
  combatant: BattleCombatant;
  isActive: boolean;
  isFainted: boolean;
}

export default class SwapMenuUI extends Phaser.GameObjects.Container {
  private petSlots: Phaser.GameObjects.Container[] = [];
  private onPetSelected?: (combatant: BattleCombatant) => void;
  private onBack?: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    pets: PetSlotData[],
    onPetSelected?: (combatant: BattleCombatant) => void,
    onBack?: () => void
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.onPetSelected = onPetSelected;
    this.onBack = onBack;

    this.createSwapMenu(pets);
  }

  private createSwapMenu(pets: PetSlotData[]): void {
    // Brown wood panel background
    const panelBg = this.scene.add.graphics();
    panelBg.fillStyle(0x5D4037, 1);
    panelBg.fillRect(-200, -70, 400, 139);

    // Wood grain texture
    panelBg.fillStyle(0x6D4C41, 0.3);
    for (let i = 0; i < 14; i++) {
      const y = -70 + (i * 10);
      panelBg.fillRect(-200, y, 400, 3);
    }

    // Top border
    panelBg.lineStyle(3, 0x4E342E, 1);
    panelBg.lineBetween(-200, -70, 200, -70);

    this.add(panelBg);

    // Create pet slots (3 pets displayed horizontally)
    const slotWidth = 120;
    const slotSpacing = 10;
    const startX = -(slotWidth * pets.length + slotSpacing * (pets.length - 1)) / 2;

    pets.forEach((petData, index) => {
      const slotX = startX + (slotWidth + slotSpacing) * index + slotWidth / 2;
      const slot = this.createPetSlot(petData, slotX, -10);
      this.petSlots.push(slot);
      this.add(slot);
    });

    // Back button
    const backButton = this.createBackButton();
    this.add(backButton);
  }

  private createPetSlot(
    petData: PetSlotData,
    x: number,
    y: number
  ): Phaser.GameObjects.Container {
    const slot = this.scene.add.container(x, y);
    const slotWidth = 120;
    const slotHeight = 70;

    // Background
    const bg = this.scene.add.graphics();

    if (petData.isFainted) {
      // Fainted - dark gray
      bg.fillStyle(0x424242, 0.8);
    } else if (petData.isActive) {
      // Active pet - green border
      bg.fillStyle(0x424242, 0.9);
      bg.lineStyle(3, 0x81C784, 1);
    } else {
      // Available pet - normal
      bg.fillStyle(0x616161, 0.9);
    }

    bg.fillRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 8);

    if (petData.isActive) {
      bg.strokeRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 8);
    } else if (!petData.isFainted) {
      bg.lineStyle(2, 0xE0E0E0, 0.5);
      bg.strokeRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 8);
    }

    slot.add(bg);

    // Pet name
    const nameText = createSharpText(this.scene, 0, -22, petData.combatant.name, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '15px',
      color: petData.isFainted ? '#9E9E9E' : '#FFFFFF',
      fontStyle: 'bold',
      align: 'center',
    });
    nameText.setOrigin(0.5);
    nameText.setStroke('#000000', 4);
    slot.add(nameText);

    // Type icons
    const typeIconsText = petData.combatant.types
      .map((type) => TYPE_ICONS[type])
      .join(' ');
    const typeIcons = createSharpText(this.scene, 0, -8, typeIconsText, {
      fontSize: '12px',
    });
    typeIcons.setOrigin(0.5);
    slot.add(typeIcons);

    // HP bar
    const hpBarWidth = 100;
    const hpBarHeight = 8;

    // HP background
    const hpBg = this.scene.add.graphics();
    hpBg.fillStyle(0x212121, 1);
    hpBg.fillRect(-hpBarWidth / 2, 6, hpBarWidth, hpBarHeight);
    slot.add(hpBg);

    // HP fill
    const hpPercent = petData.combatant.currentHP / petData.combatant.maxHP;
    let hpColor = 0x81C784; // Green
    if (hpPercent <= 0.25) {
      hpColor = 0xE57373; // Red
    } else if (hpPercent <= 0.5) {
      hpColor = 0xFFD54F; // Yellow
    }

    const hpFill = this.scene.add.graphics();
    hpFill.fillStyle(hpColor, 1);
    hpFill.fillRect(-hpBarWidth / 2, 6, hpBarWidth * hpPercent, hpBarHeight);
    slot.add(hpFill);

    // HP text
    const hpText = createSharpText(
      this.scene,
      0,
      22,
      `HP: ${Math.ceil(petData.combatant.currentHP)}/${petData.combatant.maxHP}`,
      {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '11px',
        color: petData.isFainted ? '#9E9E9E' : '#FFFFFF',
        align: 'center',
      }
    );
    hpText.setOrigin(0.5);
    hpText.setStroke('#000000', 3);
    slot.add(hpText);

    // Status indicator for active pet
    if (petData.isActive) {
      const activeLabel = createSharpText(this.scene, 0, -35, '(Active)', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '10px',
        color: '#81C784',
        fontStyle: 'bold',
      });
      activeLabel.setOrigin(0.5);
      activeLabel.setStroke('#000000', 3);
      slot.add(activeLabel);
    }

    // Fainted overlay
    if (petData.isFainted) {
      const faintedText = createSharpText(this.scene, 0, 0, 'FAINTED', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '14px',
        color: '#E57373',
        fontStyle: 'bold',
      });
      faintedText.setOrigin(0.5);
      faintedText.setStroke('#000000', 3);
      slot.add(faintedText);
    }

    // Make clickable if not active and not fainted
    if (!petData.isActive && !petData.isFainted && this.onPetSelected) {
      // Use a transparent hit area sprite
      const slotHitBox = this.scene.add.rectangle(
        0,
        0,
        slotWidth,
        slotHeight,
        0x000000,
        0.01
      );
      slotHitBox.setInteractive({ useHandCursor: true });
      slot.add(slotHitBox);
      slot.sendToBack(slotHitBox);

      // Hover effect on hitBox
      slotHitBox.on('pointerover', () => {
        this.scene.input.setDefaultCursor('pointer');
        bg.clear();
        bg.fillStyle(0x757575, 1);
        bg.fillRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 8);
        bg.lineStyle(2, 0xFFFFFF, 1);
        bg.strokeRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 8);

        this.scene.tweens.add({
          targets: slot,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 100,
          ease: 'Power2',
        });
      });

      slotHitBox.on('pointerout', () => {
        this.scene.input.setDefaultCursor('default');
        bg.clear();
        bg.fillStyle(0x616161, 0.9);
        bg.fillRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 8);
        bg.lineStyle(2, 0xE0E0E0, 0.5);
        bg.strokeRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 8);

        this.scene.tweens.add({
          targets: slot,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 100,
          ease: 'Power2',
        });
      });

      slotHitBox.on('pointerdown', () => {
        if (this.onPetSelected) {
          this.onPetSelected(petData.combatant);
        }
      });
    }

    return slot;
  }

  private createBackButton(): Phaser.GameObjects.Container {
    const button = this.scene.add.container(0, 55);
    const width = 100;
    const height = 28;

    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xE57373, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
    bg.lineStyle(2, 0x000000, 0.3);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
    button.add(bg);

    // Text
    const text = createSharpText(this.scene, 0, 0, 'BACK', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    text.setStroke('#000000', 2);
    button.add(text);

    // Make interactive with transparent hitBox
    const btnHitBox = this.scene.add.rectangle(
      0,
      0,
      width,
      height,
      0x000000,
      0.01
    );
    btnHitBox.setInteractive({ useHandCursor: true });
    button.add(btnHitBox);
    button.sendToBack(btnHitBox);

    btnHitBox.on('pointerover', () => {
      this.scene.input.setDefaultCursor('pointer');
      bg.clear();
      bg.fillStyle(0xEF5350, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
      bg.lineStyle(2, 0x000000, 0.5);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
    });

    btnHitBox.on('pointerout', () => {
      this.scene.input.setDefaultCursor('default');
      bg.clear();
      bg.fillStyle(0xE57373, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
      bg.lineStyle(2, 0x000000, 0.3);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
    });

    btnHitBox.on('pointerdown', () => {
      if (this.onBack) {
        this.onBack();
      }
    });

    return button;
  }
}
