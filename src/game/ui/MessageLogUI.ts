/**
 * MessageLogUI Component
 * Displays battle messages and actions
 */

import Phaser from 'phaser';
import { BATTLE_CONFIG } from '../data/battleConfig';
import type { BattleMessage } from '../types';
import { createSharpText } from '../utils/textUtils';

export default class MessageLogUI extends Phaser.GameObjects.Container {
  private messages: BattleMessage[] = [];
  private messageTexts: Phaser.GameObjects.Text[] = [];
  private background!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this.createMessageLog();
  }

  private createMessageLog(): void {
    const config = BATTLE_CONFIG.MESSAGE_LOG;

    // Background panel
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x424242, 0.8);
    this.background.fillRoundedRect(-190, -40, 380, 80, 8);
    this.background.lineStyle(2, 0x212121, 1);
    this.background.strokeRoundedRect(-190, -40, 380, 80, 8);
    this.add(this.background);

    // Create text objects for messages
    for (let i = 0; i < config.MAX_MESSAGES; i++) {
      const text = createSharpText(
        this.scene,
        -180,
        -30 + i * config.LINE_HEIGHT,
        '',
        {
          fontFamily: 'Nunito, sans-serif',
          fontSize: config.FONT_SIZE,
          color: '#FFFFFF',
          wordWrap: { width: 360 },
        }
      );
      text.setOrigin(0, 0);
      this.messageTexts.push(text);
      this.add(text);
    }
  }

  /**
   * Add a new message to the log
   */
  public addMessage(
    text: string,
    type: BattleMessage['type'] = 'info'
  ): void {
    const message: BattleMessage = {
      text,
      type,
      timestamp: Date.now(),
    };

    // Add to messages array
    this.messages.push(message);

    // Keep only last MAX_MESSAGES
    if (this.messages.length > BATTLE_CONFIG.MESSAGE_LOG.MAX_MESSAGES) {
      this.messages.shift();
    }

    // Update display
    this.updateDisplay();
  }

  /**
   * Clear all messages
   */
  public clearMessages(): void {
    this.messages = [];
    this.updateDisplay();
  }

  /**
   * Update message display
   */
  private updateDisplay(): void {
    const displayMessages = this.messages.slice(-BATTLE_CONFIG.MESSAGE_LOG.MAX_MESSAGES);

    for (let i = 0; i < this.messageTexts.length; i++) {
      if (i < displayMessages.length) {
        const message = displayMessages[i];
        this.messageTexts[i].setText(message.text);

        // Color based on message type
        switch (message.type) {
          case 'damage':
            this.messageTexts[i].setColor('#E57373'); // Red
            break;
          case 'effect':
            this.messageTexts[i].setColor('#64B5F6'); // Blue
            break;
          case 'status':
            this.messageTexts[i].setColor('#FFD54F'); // Yellow
            break;
          case 'action':
            this.messageTexts[i].setColor('#FFFFFF'); // White
            break;
          default:
            this.messageTexts[i].setColor('#E0E0E0'); // Light gray
        }
      } else {
        this.messageTexts[i].setText('');
      }
    }
  }

  /**
   * Show a temporary message that auto-clears
   */
  public showTemporaryMessage(text: string, duration: number = 2000): void {
    this.addMessage(text);
    this.scene.time.delayedCall(duration, () => {
      this.clearMessages();
    });
  }
}
