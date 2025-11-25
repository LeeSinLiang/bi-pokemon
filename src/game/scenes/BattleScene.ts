/**
 * BattleScene - Pokemon Showdown-style turn-based battle
 * Level 2: Sodium Serpent Boss Battle
 */

import Phaser from 'phaser';
import type {
  BattleSceneData,
  BattleCombatant,
  BattleState,
  BattlePetSkill,
  StatusEffect,
  StatModifier,
  NutritionalType,
  BattleBossData,
  BossPhaseData,
} from '../types';
import { BATTLE_PETS, getBattlePet } from '../data/battlePets';
import { getBossByLevel } from '../data/battleBosses';
import {
  BATTLE_CONFIG,
  calculateDamage,
  checkAccuracy,
  checkCriticalHit,
  getStatMultiplier,
} from '../data/battleConfig';
import {
  calculateTypeMultiplier,
  getEffectivenessMessage,
  getTypeAccuracyModifier,
} from '../data/typeChart';
import HealthBarUI from '../ui/HealthBarUI';
import SkillCardUI from '../ui/SkillCardUI';
import ActionButtonUI, { type ActionButtonType } from '../ui/ActionButtonUI';
import MessageLogUI from '../ui/MessageLogUI';
import BattleVFX from '../ui/BattleVFX';
import SwapMenuUI from '../ui/SwapMenuUI';

export default class BattleScene extends Phaser.Scene {
  // Scene data
  private levelData!: BattleSceneData;

  // Battle state
  private battleState: BattleState = 'INTRO';
  private playerCombatant!: BattleCombatant;
  private enemyCombatant!: BattleCombatant;

  // Party management
  private playerParty: BattleCombatant[] = [];
  private activePlayerIndex: number = 0;

  // Phase system (multi-phase bosses)
  private bossData!: BattleBossData;
  private currentPhase: number = 1;
  private environmentalHazard: { type: string; damagePercent: number; message: string } | null = null;
  private hazardPurifiedTurns: number = 0;

  // UI Components
  private background!: Phaser.GameObjects.Image;
  private playerHealthBar!: HealthBarUI;
  private enemyHealthBar!: HealthBarUI;
  private messageLog!: MessageLogUI;
  private vfx!: BattleVFX;

  private actionButtons: ActionButtonUI[] = [];
  private skillCards: SkillCardUI[] = [];
  private actionMenu!: Phaser.GameObjects.Container;
  private skillMenu!: Phaser.GameObjects.Container;
  private swapMenu?: SwapMenuUI;

  // Music
  private battleMusic?: Phaser.Sound.BaseSound;

  // Debug: Skip delays on click
  private skipDelay: boolean = false;

  constructor() {
    super({ key: 'BattleScene' });
  }

  /**
   * Initialize battle with data from dungeon map
   */
  init(data: BattleSceneData): void {
    this.levelData = data;
    console.log('Battle Scene initialized:', data);
  }

  /**
   * Preload battle assets
   */
  preload(): void {
    // Load battle backgrounds
    this.load.image(
      'battle-bg-level-2',
      '/assets/dungeon/battle/backgrounds/level-2.png'
    );
    this.load.image(
      'battle-bg-level-2-phase-2',
      '/assets/dungeon/battle/backgrounds/level-2-phase-2.png'
    );

    // Load pet sprites
    this.load.image(
      'pet-lemon-shark',
      '/assets/dungeon/battle/pets/lemon-shark.png'
    );
    this.load.image(
      'pet-musubee',
      '/assets/dungeon/battle/pets/musubee.png'
    );
    this.load.image(
      'pet-tartle',
      '/assets/dungeon/battle/pets/tart-le.png'
    );

    // Load boss sprites (all phases)
    this.load.image(
      'boss-serpent',
      '/assets/dungeon/battle/enemies/serpent.png'
    );
    this.load.image(
      'boss-serpent-phase-2',
      '/assets/dungeon/battle/enemies/serpent-phase-2.png'
    );
    this.load.image(
      'boss-serpent-damage',
      '/assets/dungeon/battle/enemies/serpent-damage.png'
    );

    // Load battle music for each phase
    this.load.audio(
      'battle-music-phase-1',
      '/assets/dungeon/battle/ost/Byte In Intro Phase 1.m4a'
    );
    this.load.audio(
      'battle-music-phase-2',
      '/assets/dungeon/battle/ost/Byte In Battle Phase 2.mp3'
    );
    this.load.audio(
      'battle-music-phase-3',
      '/assets/dungeon/battle/ost/Byte In Phase 3 Ending.mp3'
    );
  }

  /**
   * Create battle scene
   */
  create(): void {
    // Initialize VFX helper
    this.vfx = new BattleVFX(this);

    // Create background
    this.createBackground();

    // Start Phase 1 music
    this.playPhaseMusic(1);

    // Add click listener for debug skip (click outside of buttons)
    this.input.on('pointerdown', () => {
      // Only skip if not clicking on a UI button
      const clickedOnUI = this.actionMenu.visible || this.skillMenu.visible;
      if (!clickedOnUI) {
        this.skipDelay = true;
      }
    });

    // Initialize combatants
    this.initializeCombatants();

    // Create UI
    this.createUI();

    // Start battle intro
    this.startBattleIntro();
  }

  /**
   * Create background
   */
  private createBackground(): void {
    // Add battle arena background - full canvas (400x850)
    this.background = this.add.image(200, 425, 'battle-bg-level-2');
    this.background.setDisplaySize(400, 850);
  }

  /**
   * Initialize player and enemy combatants
   */
  private initializeCombatants(): void {
    // Load all 3 available pets into the party
    const petIds = ['LEMON_SHARK', 'MUSUBEE', 'TARTLE'];

    petIds.forEach((petId) => {
      const petData = getBattlePet(petId);
      if (petData) {
        const combatant: BattleCombatant = {
          id: petData.id,
          name: petData.name,
          types: petData.types,
          currentHP: petData.baseStats.maxHP,
          maxHP: petData.baseStats.maxHP,
          baseAttack: petData.baseStats.attack,
          baseDefense: petData.baseStats.defense,
          baseSpeed: petData.baseStats.speed,
          skills: petData.skills,
          statusEffects: [],
          statModifiers: new Map(),
          isPlayer: true,
        };
        this.playerParty.push(combatant);
      }
    });

    // Randomly select which pet starts first
    this.activePlayerIndex = Math.floor(Math.random() * this.playerParty.length);
    this.playerCombatant = this.playerParty[this.activePlayerIndex];

    // Get boss data for Level 2
    const bossData = getBossByLevel(this.levelData.level);

    if (!bossData) {
      console.error('Failed to load boss data');
      return;
    }

    // Store boss data for phase management
    this.bossData = bossData;
    this.currentPhase = 1;

    // Initialize boss from phase data (or fallback to single-phase)
    this.initializeBossFromPhase(this.currentPhase);

    console.log('Combatants initialized:', {
      player: this.playerCombatant.name,
      enemy: this.enemyCombatant.name,
    });
  }

  /**
   * Initialize or update boss from phase data
   * @param phaseNumber - The phase number (1, 2, 3, etc.)
   */
  private initializeBossFromPhase(phaseNumber: number): void {
    const phases = this.bossData.phases;
    let phaseData: BossPhaseData | null = null;

    // Get phase data if available
    if (phases && phases.length > 0) {
      phaseData = phases.find(p => p.phaseNumber === phaseNumber) || null;
    }

    // If no phase data, use fallback single-phase data from boss
    if (!phaseData) {
      // Single-phase boss (backward compatibility)
      if (!this.enemyCombatant) {
        this.enemyCombatant = {
          id: this.bossData.id,
          name: this.bossData.name,
          types: this.bossData.types,
          currentHP: this.bossData.baseStats.maxHP,
          maxHP: this.bossData.baseStats.maxHP,
          baseAttack: this.bossData.baseStats.attack,
          baseDefense: this.bossData.baseStats.defense,
          baseSpeed: this.bossData.baseStats.speed,
          skills: this.bossData.moveset,
          statusEffects: [],
          statModifiers: new Map(),
          isPlayer: false,
          passiveAbility: this.bossData.passiveAbility,
        };
      } else {
        // Update existing combatant
        this.enemyCombatant.types = this.bossData.types;
        this.enemyCombatant.maxHP = this.bossData.baseStats.maxHP;
        this.enemyCombatant.currentHP = this.bossData.baseStats.maxHP;
        this.enemyCombatant.baseAttack = this.bossData.baseStats.attack;
        this.enemyCombatant.baseDefense = this.bossData.baseStats.defense;
        this.enemyCombatant.baseSpeed = this.bossData.baseStats.speed;
        this.enemyCombatant.skills = this.bossData.moveset;
        this.enemyCombatant.passiveAbility = this.bossData.passiveAbility;
      }
      this.environmentalHazard = null;
      return;
    }

    // Multi-phase boss initialization
    if (!this.enemyCombatant) {
      // First initialization
      this.enemyCombatant = {
        id: this.bossData.id,
        name: `${this.bossData.name} (${phaseData.name})`,
        types: phaseData.types,
        currentHP: phaseData.baseStats.maxHP,
        maxHP: phaseData.baseStats.maxHP,
        baseAttack: phaseData.baseStats.attack,
        baseDefense: phaseData.baseStats.defense,
        baseSpeed: phaseData.baseStats.speed,
        skills: phaseData.moveset,
        statusEffects: [],
        statModifiers: new Map(),
        isPlayer: false,
        passiveAbility: phaseData.passiveAbility,
      };
    } else {
      // Phase transition - update existing combatant
      this.enemyCombatant.name = `${this.bossData.name} (${phaseData.name})`;
      this.enemyCombatant.types = phaseData.types;
      this.enemyCombatant.maxHP = phaseData.baseStats.maxHP;
      this.enemyCombatant.currentHP = phaseData.baseStats.maxHP; // Full HP restore
      this.enemyCombatant.baseAttack = phaseData.baseStats.attack;
      this.enemyCombatant.baseDefense = phaseData.baseStats.defense;
      this.enemyCombatant.baseSpeed = phaseData.baseStats.speed;
      this.enemyCombatant.skills = phaseData.moveset;
      this.enemyCombatant.statusEffects = []; // Clear status effects
      this.enemyCombatant.statModifiers.clear(); // Reset stat stages
      this.enemyCombatant.passiveAbility = phaseData.passiveAbility;
    }

    // Set up environmental hazard if present
    if (phaseData.environmentalHazard) {
      this.environmentalHazard = phaseData.environmentalHazard;
      this.hazardPurifiedTurns = 0;
    } else {
      this.environmentalHazard = null;
      this.hazardPurifiedTurns = 0;
    }

    console.log(`Boss initialized for Phase ${phaseNumber}:`, {
      name: this.enemyCombatant.name,
      types: this.enemyCombatant.types,
      hp: this.enemyCombatant.maxHP,
      hazard: this.environmentalHazard?.type || 'None',
    });
  }

  /**
   * Create UI elements
   */
  private createUI(): void {
    // Create pet sprite (lower-left position)
    const playerSprite = this.add.image(
      BATTLE_CONFIG.POSITIONS.PLAYER.X,
      BATTLE_CONFIG.POSITIONS.PLAYER.Y,
      BATTLE_PETS[this.playerCombatant.id.toUpperCase().replace('PET_', '')].spriteKey
    );
    playerSprite.setScale(0.3);
    playerSprite.setDepth(10); // Pet sprites layer
    this.playerCombatant.sprite = playerSprite;

    // Create boss sprite (upper-right position)
    const enemySprite = this.add.image(
      BATTLE_CONFIG.POSITIONS.ENEMY.X,
      BATTLE_CONFIG.POSITIONS.ENEMY.Y,
      'boss-serpent'
    );
    enemySprite.setScale(0.4);
    enemySprite.setDepth(10); // Pet sprites layer
    this.enemyCombatant.sprite = enemySprite;

    // Create health bars
    this.playerHealthBar = new HealthBarUI(
      this,
      BATTLE_CONFIG.POSITIONS.PLAYER.X,
      BATTLE_CONFIG.POSITIONS.PLAYER.Y + 80,
      this.playerCombatant.name,
      this.playerCombatant.currentHP,
      this.playerCombatant.maxHP
    );
    this.playerHealthBar.setDepth(30); // Health bars layer

    this.enemyHealthBar = new HealthBarUI(
      this,
      BATTLE_CONFIG.POSITIONS.ENEMY.X,
      BATTLE_CONFIG.POSITIONS.ENEMY.Y - 80,
      this.enemyCombatant.name,
      this.enemyCombatant.currentHP,
      this.enemyCombatant.maxHP
    );
    this.enemyHealthBar.setDepth(30); // Health bars layer

    // Create message log
    this.messageLog = new MessageLogUI(
      this,
      200,
      BATTLE_CONFIG.MESSAGE_LOG.Y_POSITION
    );
    this.messageLog.setDepth(40); // Message log layer

    // Create action menu
    this.createActionMenu();

    // Create skill menu (hidden initially)
    this.createSkillMenu();
  }

  /**
   * Create action menu (Fight, Feed, Swap, Flee)
   */
  private createActionMenu(): void {
    this.actionMenu = this.add.container(0, 0);

    // Brown wood panel background (oak/grove theme)
    // Starts at y=711 (where background ends) to y=850 (bottom)
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x5D4037, 1); // Dark brown
    panelBg.fillRect(0, 711, 400, 139);

    // Add wood grain texture effect with lighter brown stripes
    panelBg.fillStyle(0x6D4C41, 0.3);
    for (let i = 0; i < 14; i++) {
      const y = 711 + (i * 10);
      panelBg.fillRect(0, y, 400, 3);
    }

    // Top border
    panelBg.lineStyle(3, 0x4E342E, 1);
    panelBg.lineBetween(0, 711, 400, 711);

    this.actionMenu.add(panelBg);

    // Position buttons in 2x2 grid
    const buttonGap = 15; // Gap between buttons
    const leftX = 200 - (BATTLE_CONFIG.ACTION_BUTTON.WIDTH / 2 + buttonGap / 2);
    const rightX = 200 + (BATTLE_CONFIG.ACTION_BUTTON.WIDTH / 2 + buttonGap / 2);
    const topY = 745;  // First row
    const bottomY = 800; // Second row

    // Row 1: Fight and Swap (most important actions)
    const fightBtn = new ActionButtonUI(
      this,
      leftX,
      topY,
      'FIGHT',
      'Fight',
      () => this.onFightClicked()
    );
    this.actionButtons.push(fightBtn);
    this.actionMenu.add(fightBtn);

    const swapBtn = new ActionButtonUI(
      this,
      rightX,
      topY,
      'SWAP',
      'Swap',
      () => this.onSwapClicked()
    );
    this.actionButtons.push(swapBtn);
    this.actionMenu.add(swapBtn);

    // Row 2: Feed and Flee
    const feedBtn = new ActionButtonUI(
      this,
      leftX,
      bottomY,
      'FEED',
      'Feed',
      () => this.messageLog.addMessage('No items available!')
    );
    feedBtn.setDisabled(true);
    this.actionButtons.push(feedBtn);
    this.actionMenu.add(feedBtn);

    const fleeBtn = new ActionButtonUI(
      this,
      rightX,
      bottomY,
      'FLEE',
      'Flee',
      () => this.onFleeClicked()
    );
    this.actionButtons.push(fleeBtn);
    this.actionMenu.add(fleeBtn);

    this.actionMenu.setDepth(50); // Action menu on top of everything
    this.actionMenu.setVisible(false);
  }

  /**
   * Create skill selection menu
   */
  private createSkillMenu(): void {
    this.skillMenu = this.add.container(0, 0);

    // Brown wood panel background (oak/grove theme)
    // Starts at y=711 (where background ends) to y=850 (bottom)
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x5D4037, 1); // Dark brown
    panelBg.fillRect(0, 711, 400, 139);

    // Add wood grain texture effect with lighter brown stripes
    panelBg.fillStyle(0x6D4C41, 0.3);
    for (let i = 0; i < 14; i++) {
      const y = 711 + (i * 10);
      panelBg.fillRect(0, y, 400, 3);
    }

    // Top border
    panelBg.lineStyle(3, 0x4E342E, 1);
    panelBg.lineBetween(0, 711, 400, 711);

    this.skillMenu.add(panelBg);

    const cardSpacing = BATTLE_CONFIG.SKILL_CARD.WIDTH + BATTLE_CONFIG.SKILL_CARD.SPACING;
    const numSkills = this.playerCombatant.skills.length;
    const startX = 200 - (cardSpacing * (numSkills - 1)) / 2;

    // Create skill cards - positioned on brown panel
    this.playerCombatant.skills.forEach((skill, index) => {
      const card = new SkillCardUI(
        this,
        startX + cardSpacing * index,
        BATTLE_CONFIG.SKILL_CARD.Y_POSITION,
        skill,
        () => this.onSkillSelected(skill)
      );
      this.skillCards.push(card);
      this.skillMenu.add(card);
    });

    // Back button - at bottom
    const backBtn = new ActionButtonUI(
      this,
      200,
      815, // 711 + 104 (leaving 35px at bottom)
      'FLEE',
      'Back',
      () => this.showActionMenu()
    );
    this.skillMenu.add(backBtn);

    this.skillMenu.setDepth(50); // Skill menu on top of everything
    this.skillMenu.setVisible(false);
  }

  /**
   * Start battle intro sequence
   */
  private startBattleIntro(): void {
    this.battleState = 'INTRO';

    // Animate sprites entering
    this.playerCombatant.sprite?.setAlpha(0);
    this.playerCombatant.sprite?.setX(BATTLE_CONFIG.POSITIONS.PLAYER.X - 100);
    this.tweens.add({
      targets: this.playerCombatant.sprite,
      x: BATTLE_CONFIG.POSITIONS.PLAYER.X,
      alpha: 1,
      duration: 800,
      ease: 'Power2',
    });

    this.enemyCombatant.sprite?.setAlpha(0);
    this.enemyCombatant.sprite?.setX(BATTLE_CONFIG.POSITIONS.ENEMY.X + 100);
    this.tweens.add({
      targets: this.enemyCombatant.sprite,
      x: BATTLE_CONFIG.POSITIONS.ENEMY.X,
      alpha: 1,
      duration: 800,
      ease: 'Power2',
    });

    // Show intro message
    this.time.delayedCall(1000, () => {
      this.messageLog.addMessage(
        `Wild ${this.enemyCombatant.name} appeared!`,
        'info'
      );

      this.time.delayedCall(1500, () => {
        this.messageLog.addMessage(
          `Go! ${this.playerCombatant.name}!`,
          'action'
        );

        this.time.delayedCall(1500, () => {
          this.startPlayerTurn();
        });
      });
    });
  }

  /**
   * Start player's turn
   */
  private startPlayerTurn(): void {
    this.battleState = 'PLAYER_TURN';
    this.messageLog.addMessage('What will you do?', 'info');
    this.showActionMenu();
  }

  /**
   * Show action menu
   */
  private showActionMenu(): void {
    this.skillMenu.setVisible(false);
    this.actionMenu.setVisible(true);
  }

  /**
   * Show skill menu
   */
  private showSkillMenu(): void {
    this.actionMenu.setVisible(false);
    this.skillMenu.setVisible(true);
  }

  /**
   * Handle Fight button clicked
   */
  private onFightClicked(): void {
    // Check if trapped (from Nori Bind)
    if (this.playerCombatant.statusEffects.includes('TRAPPED')) {
      this.messageLog.addMessage(
        `${this.playerCombatant.name} is trapped!`,
        'status'
      );
      return;
    }

    this.showSkillMenu();
  }

  /**
   * Handle Swap button clicked
   */
  private onSwapClicked(): void {
    // Check if trapped
    if (this.playerCombatant.statusEffects.includes('TRAPPED')) {
      this.messageLog.addMessage(
        `${this.playerCombatant.name} is trapped and cannot swap!`,
        'status'
      );
      return;
    }

    this.showSwapMenu();
  }

  /**
   * Show swap menu
   */
  private showSwapMenu(): void {
    this.actionMenu.setVisible(false);
    this.skillMenu.setVisible(false);

    // Create swap menu with party data
    const petSlots = this.playerParty.map((combatant, index) => ({
      combatant,
      isActive: index === this.activePlayerIndex,
      isFainted: combatant.currentHP === 0,
    }));

    this.swapMenu = new SwapMenuUI(
      this,
      200,
      780,
      petSlots,
      (selectedCombatant) => this.onPetSwapSelected(selectedCombatant),
      () => this.hideSwapMenu()
    );
  }

  /**
   * Hide swap menu
   */
  private hideSwapMenu(): void {
    if (this.swapMenu) {
      this.swapMenu.destroy();
      this.swapMenu = undefined;
    }
    this.showActionMenu();
  }

  /**
   * Handle pet swap selection
   */
  private async onPetSwapSelected(newCombatant: BattleCombatant): Promise<void> {
    // Find index of selected pet
    const newIndex = this.playerParty.findIndex((pet) => pet.id === newCombatant.id);
    if (newIndex === -1 || newIndex === this.activePlayerIndex) {
      return;
    }

    // Hide swap menu
    if (this.swapMenu) {
      this.swapMenu.destroy();
      this.swapMenu = undefined;
    }

    // Perform the swap with animation
    await this.performSwap(newIndex);

    // Enemy attacks after swap (swap takes a turn)
    if (this.enemyCombatant.currentHP > 0) {
      await this.delay(1000);
      const enemySkill = this.selectBossSkill();
      await this.executeSkill(this.enemyCombatant, this.playerCombatant, enemySkill);

      // Check for battle end
      if (this.checkBattleEnd()) {
        return;
      }

      // Process end of turn
      await this.processEndOfTurn();

      if (this.checkBattleEnd()) {
        return;
      }
    }

    // Start next turn
    this.startPlayerTurn();
  }

  /**
   * Perform swap animation (Pokemon-style)
   */
  private async performSwap(newIndex: number): Promise<void> {
    const oldCombatant = this.playerCombatant;
    const newCombatant = this.playerParty[newIndex];

    this.messageLog.addMessage(
      `Come back, ${oldCombatant.name}!`,
      'action'
    );

    // Animate old pet sliding out to the left
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: oldCombatant.sprite,
        x: -100,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => resolve(),
      });
    });

    await this.delay(500);

    // Update active pet
    this.activePlayerIndex = newIndex;
    this.playerCombatant = newCombatant;

    // Update sprite
    const newSpriteKey = BATTLE_PETS[
      newCombatant.id.toUpperCase().replace('PET_', '')
    ].spriteKey;

    // Create new sprite off-screen left
    const newSprite = this.add.image(
      -100,
      BATTLE_CONFIG.POSITIONS.PLAYER.Y,
      newSpriteKey
    );
    newSprite.setScale(0.3);
    newSprite.setAlpha(0);
    newSprite.setDepth(10); // Pet sprites layer

    // Remove old sprite
    if (oldCombatant.sprite) {
      oldCombatant.sprite.destroy();
    }

    // Assign new sprite
    newCombatant.sprite = newSprite;

    // Update health bar
    this.playerHealthBar.destroy();
    this.playerHealthBar = new HealthBarUI(
      this,
      BATTLE_CONFIG.POSITIONS.PLAYER.X,
      BATTLE_CONFIG.POSITIONS.PLAYER.Y + 80,
      newCombatant.name,
      newCombatant.currentHP,
      newCombatant.maxHP
    );
    this.playerHealthBar.setDepth(30); // Health bars layer

    // Update skill cards
    this.skillCards.forEach((card) => card.destroy());
    this.skillCards = [];
    this.skillMenu.removeAll(true);

    // Recreate skill menu with new pet's skills
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x5D4037, 1);
    panelBg.fillRect(0, 711, 400, 139);
    panelBg.fillStyle(0x6D4C41, 0.3);
    for (let i = 0; i < 14; i++) {
      const y = 711 + (i * 10);
      panelBg.fillRect(0, y, 400, 3);
    }
    panelBg.lineStyle(3, 0x4E342E, 1);
    panelBg.lineBetween(0, 711, 400, 711);
    this.skillMenu.add(panelBg);

    const cardSpacing = BATTLE_CONFIG.SKILL_CARD.WIDTH + BATTLE_CONFIG.SKILL_CARD.SPACING;
    const numSkills = newCombatant.skills.length;
    const startX = 200 - (cardSpacing * (numSkills - 1)) / 2;

    newCombatant.skills.forEach((skill, index) => {
      const card = new SkillCardUI(
        this,
        startX + cardSpacing * index,
        BATTLE_CONFIG.SKILL_CARD.Y_POSITION,
        skill,
        () => this.onSkillSelected(skill)
      );
      this.skillCards.push(card);
      this.skillMenu.add(card);
    });

    const backBtn = new ActionButtonUI(
      this,
      200,
      815,
      'FLEE',
      'Back',
      () => this.showActionMenu()
    );
    this.skillMenu.add(backBtn);
    this.skillMenu.setDepth(50); // Skill menu on top of everything

    this.messageLog.addMessage(
      `Go! ${newCombatant.name}!`,
      'action'
    );

    // Animate new pet sliding in from the left
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: newSprite,
        x: BATTLE_CONFIG.POSITIONS.PLAYER.X,
        alpha: 1,
        duration: 500,
        ease: 'Power2',
        onComplete: () => resolve(),
      });
    });

    await this.delay(500);
  }

  /**
   * Smart AI: Select best boss skill based on battle state
   */
  private selectBossSkill(): BattlePetSkill {
    const skills = this.enemyCombatant.skills;
    const player = this.playerCombatant;
    const boss = this.enemyCombatant;

    // Calculate player HP percentage
    const playerHPPercent = player.currentHP / player.maxHP;
    const bossHPPercent = boss.currentHP / boss.maxHP;

    // Find specific move types
    const ultimateMove = skills.find((s) => s.category === 'ULTIMATE');
    const statusMoves = skills.filter(
      (s) => s.effect?.statusEffect && s.effect?.statusChance
    );
    const damageMove = skills.find(
      (s) => s.power && s.category !== 'ULTIMATE'
    );

    // Strategy 1: If player is low HP and we have ultimate, estimate if it can KO
    if (ultimateMove && playerHPPercent <= 0.4) {
      // Calculate rough damage estimate
      const attackStage = boss.statModifiers.get('ATTACK') || 0;
      const defenseStage = player.statModifiers.get('DEFENSE') || 0;
      const attack = boss.baseAttack * getStatMultiplier(attackStage);
      const defense = player.baseDefense * getStatMultiplier(defenseStage);

      // Rough damage calculation (simplified)
      const typeMultiplier = ultimateMove.type
        ? calculateTypeMultiplier(ultimateMove.type, player.types)
        : 1.0;
      const estimatedDamage = calculateDamage(
        attack,
        defense,
        ultimateMove.power || 100,
        typeMultiplier,
        false
      );

      // Use ultimate if it can potentially KO (with some safety margin)
      if (estimatedDamage >= player.currentHP * 0.8) {
        console.log('Boss AI: Using ultimate for potential KO');
        return ultimateMove;
      }
    }

    // Strategy 2: Apply status effects if player doesn't have them yet
    for (const statusMove of statusMoves) {
      const statusEffect = statusMove.effect?.statusEffect;
      if (statusEffect && !player.statusEffects.includes(statusEffect)) {
        // Prioritize high-chance status moves
        const chance = statusMove.effect?.statusChance || 0;
        if (chance >= 70 || Math.random() < 0.7) {
          console.log(`Boss AI: Applying ${statusEffect} status`);
          return statusMove;
        }
      }
    }

    // Strategy 3: Boss is low on HP, be more aggressive
    if (bossHPPercent <= 0.3 && ultimateMove) {
      console.log('Boss AI: Using ultimate while low HP (desperate)');
      return ultimateMove;
    }

    // Strategy 4: Mix between damage moves and ultimate (weighted by HP)
    const availableMoves: BattlePetSkill[] = [];

    // Add damage moves (always available)
    if (damageMove) {
      availableMoves.push(damageMove);
    }

    // Add ultimate with increasing probability as player HP decreases
    if (ultimateMove && Math.random() < (1 - playerHPPercent) * 0.5) {
      availableMoves.push(ultimateMove);
      availableMoves.push(ultimateMove); // Add twice for higher weight
    }

    // If we have moves, pick randomly from available
    if (availableMoves.length > 0) {
      const selected = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      console.log(`Boss AI: Using ${selected.name} (mixed strategy)`);
      return selected;
    }

    // Fallback: Random selection
    console.log('Boss AI: Using random fallback');
    return skills[Math.floor(Math.random() * skills.length)];
  }

  /**
   * Handle skill selection
   */
  private onSkillSelected(skill: BattlePetSkill): void {
    this.skillMenu.setVisible(false);
    this.actionMenu.setVisible(false);

    // Execute turn with selected skill
    this.executeTurn(skill);
  }

  /**
   * Handle Flee button clicked
   */
  private onFleeClicked(): void {
    this.battleState = 'FLED';

    // Fade out music
    if (this.battleMusic && this.battleMusic.isPlaying) {
      this.tweens.add({
        targets: this.battleMusic,
        volume: 0,
        duration: 2000,
        onComplete: () => {
          this.battleMusic?.stop();
        },
      });
    }

    this.messageLog.addMessage('You fled from battle!', 'info');

    this.time.delayedCall(2000, () => {
      this.scene.start('DungeonMapScene');
    });
  }

  /**
   * Execute battle turn
   */
  private async executeTurn(playerSkill: BattlePetSkill): Promise<void> {
    this.battleState = 'EXECUTING_MOVE';

    // Determine turn order based on speed
    const playerSpeed =
      this.playerCombatant.baseSpeed *
      getStatMultiplier(this.playerCombatant.statModifiers.get('SPEED') || 0);
    const enemySpeed =
      this.enemyCombatant.baseSpeed *
      getStatMultiplier(this.enemyCombatant.statModifiers.get('SPEED') || 0);

    // Choose enemy skill using smart AI
    const enemySkill = this.selectBossSkill();

    // Execute in speed order
    if (playerSpeed >= enemySpeed) {
      await this.executeSkill(this.playerCombatant, this.enemyCombatant, playerSkill);
      if (this.enemyCombatant.currentHP > 0) {
        await this.delay(1000);
        await this.executeSkill(this.enemyCombatant, this.playerCombatant, enemySkill);
      }
    } else {
      await this.executeSkill(this.enemyCombatant, this.playerCombatant, enemySkill);
      if (this.playerCombatant.currentHP > 0) {
        await this.delay(1000);
        await this.executeSkill(this.playerCombatant, this.enemyCombatant, playerSkill);
      }
    }

    // Check for battle end
    if (this.checkBattleEnd()) {
      return;
    }

    // Process end-of-turn effects
    await this.processEndOfTurn();

    // Check for battle end again after status damage
    if (this.checkBattleEnd()) {
      return;
    }

    // Start next turn
    this.startPlayerTurn();
  }

  /**
   * Execute a skill
   */
  private async executeSkill(
    attacker: BattleCombatant,
    defender: BattleCombatant,
    skill: BattlePetSkill
  ): Promise<void> {
    this.messageLog.addMessage(
      `${attacker.name} used ${skill.name}!`,
      'action'
    );

    await this.delay(BATTLE_CONFIG.MESSAGE_DISPLAY_MS);

    // Check if move is a non-damaging move
    if (!skill.power) {
      await this.executeNonDamagingSkill(attacker, defender, skill);
      return;
    }

    // Check accuracy (skip if move has neverMiss property)
    if (!skill.neverMiss) {
      const accuracyStage = attacker.statModifiers.get('ACCURACY') || 0;
      const evasionStage = defender.statModifiers.get('EVASION') || 0;

      // Calculate type-based accuracy modifier (soft immunity)
      const typeAccuracyMod = getTypeAccuracyModifier(skill.type, defender.types);
      const finalAccuracy = (skill.accuracy || 100) * typeAccuracyMod;

      if (!checkAccuracy(finalAccuracy, accuracyStage, evasionStage)) {
        // Show special message for type-based misses
        if (typeAccuracyMod < 1.0) {
          this.messageLog.addMessage(
            `${attacker.name}'s attack had trouble connecting!`,
            'info'
          );
        } else {
          this.messageLog.addMessage(`${attacker.name}'s attack missed!`, 'info');
        }
        this.vfx.showMiss(defender.sprite?.x || 0, defender.sprite?.y || 0);
        await this.delay(1000);
        return;
      }
    }

    // Check boss passive (Slippery Scales)
    if (
      !attacker.isPlayer &&
      defender.passiveAbility?.effect?.evadeChance &&
      skill.category === 'PHYSICAL' &&
      Math.random() * 100 < defender.passiveAbility.effect.evadeChance
    ) {
      this.messageLog.addMessage(
        'The attack slid off the slippery scales!',
        'effect'
      );
      this.vfx.showEvade(defender.sprite?.x || 0, defender.sprite?.y || 0);
      await this.delay(1000);
      return;
    }

    // Calculate damage
    await this.executeDamagingSkill(attacker, defender, skill);
  }

  /**
   * Execute damaging skill
   */
  private async executeDamagingSkill(
    attacker: BattleCombatant,
    defender: BattleCombatant,
    skill: BattlePetSkill
  ): Promise<void> {
    // Check for multi-hit
    const hits = skill.effect?.multihit
      ? Math.floor(
          Math.random() * (skill.effect.multihit[1] - skill.effect.multihit[0] + 1)
        ) + skill.effect.multihit[0]
      : 1;

    for (let i = 0; i < hits; i++) {
      // Calculate type effectiveness
      const typeMultiplier = skill.type
        ? calculateTypeMultiplier(skill.type, defender.types)
        : 1.0;

      // Check for bonus damage against specific type
      let bonusMultiplier = 1.0;
      if (
        skill.effect?.bonusAgainstType &&
        defender.types.includes(skill.effect.bonusAgainstType)
      ) {
        bonusMultiplier = 1.5;
      }

      // Check for critical hit
      let critChance = BATTLE_CONFIG.CRITICAL_HIT_CHANCE;
      if (skill.name === 'Salty Sting') {
        critChance = 25; // High crit for Salty Sting
      }
      const isCritical = checkCriticalHit(critChance);

      // Get stat modifiers
      const attackStage = attacker.statModifiers.get('ATTACK') || 0;
      const defenseStage = defender.statModifiers.get('DEFENSE') || 0;

      const attack = attacker.baseAttack * getStatMultiplier(attackStage);
      const defense = defender.baseDefense * getStatMultiplier(defenseStage);

      // Calculate damage
      const damage = calculateDamage(
        attack,
        defense,
        skill.power || 50,
        typeMultiplier * bonusMultiplier,
        isCritical
      );

      // Apply damage
      defender.currentHP = Math.max(0, defender.currentHP - damage);

      // Update health bar
      const healthBar = defender.isPlayer
        ? this.playerHealthBar
        : this.enemyHealthBar;
      healthBar.setHP(defender.currentHP);

      // Show damage number
      this.vfx.showDamageNumber(
        defender.sprite?.x || 0,
        defender.sprite?.y || 0,
        damage,
        isCritical,
        typeMultiplier >= 2.0
      );

      // Show impact effect
      this.vfx.createImpactEffect(
        defender.sprite?.x || 0,
        defender.sprite?.y || 0,
        skill.category
      );

      // Flash sprite
      this.flashSprite(defender.sprite);

      await this.delay(hits > 1 ? 500 : 1000);
    }

    if (hits > 1) {
      this.messageLog.addMessage(`Hit ${hits} times!`, 'info');
      await this.delay(1000);
    }

    // Show effectiveness message
    if (skill.type) {
      const typeMultiplier = calculateTypeMultiplier(skill.type, defender.types);
      const effectMsg = getEffectivenessMessage(typeMultiplier);
      if (effectMsg) {
        this.messageLog.addMessage(effectMsg, 'effect');
        await this.delay(1000);
      }
    }

    // Apply status effects
    if (skill.effect?.statusEffect && skill.effect?.statusChance) {
      if (Math.random() * 100 < skill.effect.statusChance) {
        await this.applyStatusEffect(defender, skill.effect.statusEffect);
      }
    }

    // Check for heal on KO (Sodium Overload)
    if (skill.effect?.healOnKO && defender.currentHP === 0) {
      const healAmount = attacker.maxHP * (skill.effect.healOnKO / 100);
      attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + healAmount);

      const attackerHealthBar = attacker.isPlayer
        ? this.playerHealthBar
        : this.enemyHealthBar;
      attackerHealthBar.setHP(attacker.currentHP);

      this.vfx.showHealNumber(
        attacker.sprite?.x || 0,
        attacker.sprite?.y || 0,
        healAmount
      );
      this.messageLog.addMessage(
        `${attacker.name} absorbed energy!`,
        'effect'
      );
      await this.delay(1500);
    }

    // NOTE: Damaged sprite is handled by phase system now
    // Phase 3 already uses 'boss-serpent-damage' sprite from the start
  }

  /**
   * Execute non-damaging skill (buffs, heals, etc.)
   */
  private async executeNonDamagingSkill(
    attacker: BattleCombatant,
    defender: BattleCombatant,
    skill: BattlePetSkill
  ): Promise<void> {
    const effect = skill.effect;

    if (!effect) {
      return;
    }

    // Handle stat modifications
    if (effect.statModifier && effect.statChange) {
      const target = effect.targetSelf ? attacker : defender;
      const currentStage = target.statModifiers.get(effect.statModifier) || 0;
      const newStage = Math.max(-6, Math.min(6, currentStage + effect.statChange));
      target.statModifiers.set(effect.statModifier, newStage);

      this.vfx.showStatChange(
        target.sprite?.x || 0,
        target.sprite?.y || 0,
        effect.statModifier,
        effect.statChange
      );

      const changeText =
        Math.abs(effect.statChange) > 1 ? 'sharply ' : '';
      const direction = effect.statChange > 0 ? 'rose' : 'fell';

      this.messageLog.addMessage(
        `${target.name}'s ${effect.statModifier} ${changeText}${direction}!`,
        'effect'
      );

      if (effect.statChange > 0) {
        this.vfx.createBuffParticles(
          target.sprite?.x || 0,
          target.sprite?.y || 0
        );
      }

      await this.delay(1500);
    }

    // Handle status effects
    if (effect.statusEffect && effect.statusChance) {
      if (Math.random() * 100 < effect.statusChance) {
        await this.applyStatusEffect(defender, effect.statusEffect);
      }
    }

    // Handle healing
    if (skill.category === 'HEAL') {
      const healAmount = attacker.maxHP * 0.25; // 25% HP
      attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + healAmount);

      const healthBar = attacker.isPlayer
        ? this.playerHealthBar
        : this.enemyHealthBar;
      healthBar.setHP(attacker.currentHP);

      this.vfx.showHealNumber(
        attacker.sprite?.x || 0,
        attacker.sprite?.y || 0,
        healAmount
      );
      this.messageLog.addMessage(
        `${attacker.name} restored HP!`,
        'effect'
      );
      await this.delay(1500);
    }

    // Handle Citrus Cleanse (purify hazards + heal + cure status)
    if (effect.purifyHazards) {
      // Purify environmental hazards
      if (this.environmentalHazard) {
        this.hazardPurifiedTurns = effect.purifyDuration || 3;
        this.messageLog.addMessage(
          'The refreshing citrus purifies the toxic environment!',
          'effect'
        );
        await this.delay(1500);
      }

      // Heal attacker
      if (effect.healPercent) {
        const healAmount = Math.floor(attacker.maxHP * (effect.healPercent / 100));
        attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + healAmount);

        const healthBar = attacker.isPlayer
          ? this.playerHealthBar
          : this.enemyHealthBar;
        healthBar.setHP(attacker.currentHP);

        this.vfx.showHealNumber(
          attacker.sprite?.x || 0,
          attacker.sprite?.y || 0,
          healAmount
        );
        this.messageLog.addMessage(
          `${attacker.name} restored ${healAmount} HP!`,
          'effect'
        );
        await this.delay(1500);
      }

      // Cure status effects
      if (effect.cureStatus && Array.isArray(effect.cureStatus)) {
        let curedAny = false;
        for (const status of effect.cureStatus) {
          const index = attacker.statusEffects.indexOf(status);
          if (index !== -1) {
            attacker.statusEffects.splice(index, 1);
            curedAny = true;
          }
        }

        if (curedAny) {
          this.messageLog.addMessage(
            `${attacker.name} was cured of its status ailments!`,
            'effect'
          );
          await this.delay(1500);
        }
      }
    }
  }

  /**
   * Apply status effect
   */
  private async applyStatusEffect(
    target: BattleCombatant,
    status: StatusEffect
  ): Promise<void> {
    if (!target.statusEffects.includes(status)) {
      target.statusEffects.push(status);

      const statusIcons: Record<StatusEffect, string> = {
        DEHYDRATED: '💧',
        GREASED: '🛢️',
        SOUR: '🍋',
        SLEEP: '💤',
        TRAPPED: '🌀',
        BURNED: '🔥',
      };

      const statusNames: Record<StatusEffect, string> = {
        DEHYDRATED: 'Dehydrated',
        GREASED: 'Greased',
        SOUR: 'Sour',
        SLEEP: 'Asleep',
        TRAPPED: 'Trapped',
        BURNED: 'Burned',
      };

      this.vfx.showStatusEffect(
        target.sprite?.x || 0,
        target.sprite?.y || 0,
        statusIcons[status],
        statusNames[status]
      );

      this.messageLog.addMessage(
        `${target.name} is ${statusNames[status].toLowerCase()}!`,
        'status'
      );

      // Apply immediate effects
      if (status === 'GREASED') {
        const currentStage = target.statModifiers.get('SPEED') || 0;
        target.statModifiers.set(
          'SPEED',
          Math.max(-6, currentStage + BATTLE_CONFIG.GREASED_SPEED_STAGE)
        );
      } else if (status === 'SOUR') {
        const currentStage = target.statModifiers.get('ACCURACY') || 0;
        target.statModifiers.set(
          'ACCURACY',
          Math.max(-6, currentStage + BATTLE_CONFIG.SOUR_ACCURACY_STAGE)
        );
      }

      await this.delay(1500);
    }
  }

  /**
   * Process end-of-turn effects (status damage, etc.)
   */
  private async processEndOfTurn(): Promise<void> {
    this.battleState = 'TURN_END';

    // Process player status effects
    if (this.playerCombatant.statusEffects.includes('DEHYDRATED')) {
      // Calculate defense modifier (higher defense = less DoT damage)
      const defenseStage = this.playerCombatant.statModifiers.get('DEFENSE') || 0;
      const defenseMultiplier = this.getStatMultiplier(defenseStage);
      const effectiveDefense = this.playerCombatant.baseDefense * defenseMultiplier;
      const defenseReduction = 100 / (50 + effectiveDefense);

      const baseDamage = this.playerCombatant.maxHP * (BATTLE_CONFIG.DEHYDRATED_DAMAGE_PERCENT / 100);
      const damage = Math.floor(baseDamage * defenseReduction);

      this.playerCombatant.currentHP = Math.max(
        0,
        this.playerCombatant.currentHP - damage
      );
      this.playerHealthBar.setHP(this.playerCombatant.currentHP);

      this.vfx.showDamageNumber(
        this.playerCombatant.sprite?.x || 0,
        this.playerCombatant.sprite?.y || 0,
        damage,
        false,
        false
      );

      this.messageLog.addMessage(
        `${this.playerCombatant.name} is suffering from dehydration!`,
        'status'
      );
      await this.delay(1500);
    }

    // Process BURNED status for player
    if (this.playerCombatant.statusEffects.includes('BURNED')) {
      // Calculate defense modifier (higher defense = less DoT damage)
      const defenseStage = this.playerCombatant.statModifiers.get('DEFENSE') || 0;
      const defenseMultiplier = this.getStatMultiplier(defenseStage);
      const effectiveDefense = this.playerCombatant.baseDefense * defenseMultiplier;
      const defenseReduction = 100 / (50 + effectiveDefense);

      const baseDamage = this.playerCombatant.maxHP * 0.12;
      const damage = Math.floor(baseDamage * defenseReduction);

      this.playerCombatant.currentHP = Math.max(
        0,
        this.playerCombatant.currentHP - damage
      );
      this.playerHealthBar.setHP(this.playerCombatant.currentHP);

      // Apply Attack -1 if not already applied (only once per burn)
      if (!this.playerCombatant.statModifiers.has('ATTACK') ||
          this.playerCombatant.statModifiers.get('ATTACK')! >= 0) {
        const currentStages = this.playerCombatant.statModifiers.get('ATTACK') || 0;
        this.playerCombatant.statModifiers.set('ATTACK', Math.max(-6, currentStages - 1));
      }

      this.vfx.showDamageNumber(
        this.playerCombatant.sprite?.x || 0,
        this.playerCombatant.sprite?.y || 0,
        damage,
        false,
        false
      );

      this.messageLog.addMessage(
        `${this.playerCombatant.name} is suffering from burns!`,
        'status'
      );
      await this.delay(1500);
    }

    // Process enemy status effects
    if (this.enemyCombatant.statusEffects.includes('DEHYDRATED')) {
      // Calculate defense modifier (higher defense = less DoT damage)
      const defenseStage = this.enemyCombatant.statModifiers.get('DEFENSE') || 0;
      const defenseMultiplier = this.getStatMultiplier(defenseStage);
      const effectiveDefense = this.enemyCombatant.baseDefense * defenseMultiplier;
      const defenseReduction = 100 / (50 + effectiveDefense);

      const baseDamage = this.enemyCombatant.maxHP * (BATTLE_CONFIG.DEHYDRATED_DAMAGE_PERCENT / 100);
      const damage = Math.floor(baseDamage * defenseReduction);

      this.enemyCombatant.currentHP = Math.max(
        0,
        this.enemyCombatant.currentHP - damage
      );
      this.enemyHealthBar.setHP(this.enemyCombatant.currentHP);

      this.vfx.showDamageNumber(
        this.enemyCombatant.sprite?.x || 0,
        this.enemyCombatant.sprite?.y || 0,
        damage,
        false,
        false
      );

      this.messageLog.addMessage(
        `${this.enemyCombatant.name} is suffering from dehydration!`,
        'status'
      );
      await this.delay(1500);
    }

    // Process BURNED status for enemy
    if (this.enemyCombatant.statusEffects.includes('BURNED')) {
      // Calculate defense modifier (higher defense = less DoT damage)
      const defenseStage = this.enemyCombatant.statModifiers.get('DEFENSE') || 0;
      const defenseMultiplier = this.getStatMultiplier(defenseStage);
      const effectiveDefense = this.enemyCombatant.baseDefense * defenseMultiplier;
      const defenseReduction = 100 / (50 + effectiveDefense);

      const baseDamage = this.enemyCombatant.maxHP * 0.12;
      const damage = Math.floor(baseDamage * defenseReduction);

      this.enemyCombatant.currentHP = Math.max(
        0,
        this.enemyCombatant.currentHP - damage
      );
      this.enemyHealthBar.setHP(this.enemyCombatant.currentHP);

      // Apply Attack -1 if not already applied
      if (!this.enemyCombatant.statModifiers.has('ATTACK') ||
          this.enemyCombatant.statModifiers.get('ATTACK')! >= 0) {
        const currentStages = this.enemyCombatant.statModifiers.get('ATTACK') || 0;
        this.enemyCombatant.statModifiers.set('ATTACK', Math.max(-6, currentStages - 1));
      }

      this.vfx.showDamageNumber(
        this.enemyCombatant.sprite?.x || 0,
        this.enemyCombatant.sprite?.y || 0,
        damage,
        false,
        false
      );

      this.messageLog.addMessage(
        `${this.enemyCombatant.name} is suffering from burns!`,
        'status'
      );
      await this.delay(1500);
    }

    // Process environmental hazard damage (player only)
    if (this.environmentalHazard && this.hazardPurifiedTurns <= 0) {
      const damage = Math.floor(
        this.playerCombatant.maxHP * (this.environmentalHazard.damagePercent / 100)
      );
      this.playerCombatant.currentHP = Math.max(
        0,
        this.playerCombatant.currentHP - damage
      );
      this.playerHealthBar.setHP(this.playerCombatant.currentHP);

      this.vfx.showDamageNumber(
        this.playerCombatant.sprite?.x || 0,
        this.playerCombatant.sprite?.y || 0,
        damage,
        false,
        false
      );

      const message = this.environmentalHazard.message.replace(
        '{target}',
        this.playerCombatant.name
      );
      this.messageLog.addMessage(message, 'status');
      await this.delay(1500);
    }

    // Decrement hazard purification timer
    if (this.hazardPurifiedTurns > 0) {
      this.hazardPurifiedTurns--;
      if (this.hazardPurifiedTurns === 0 && this.environmentalHazard) {
        this.messageLog.addMessage('The environment becomes toxic again!', 'info');
        await this.delay(1000);
      }
    }

    // Phase 3 passive: Cornered Predator (Attack +1 per turn)
    if (this.currentPhase === 3 && this.bossData.phases) {
      const phase3Data = this.bossData.phases.find(p => p.phaseNumber === 3);
      if (phase3Data?.passiveAbility?.effect?.attackGainPerTurn) {
        const currentAttackStage = this.enemyCombatant.statModifiers.get('ATTACK') || 0;
        const newStage = Math.min(6, currentAttackStage + 1);
        this.enemyCombatant.statModifiers.set('ATTACK', newStage);

        this.messageLog.addMessage(
          `${this.enemyCombatant.name}'s desperation grows! Attack rose!`,
          'effect'
        );
        await this.delay(1000);
      }
    }

    // Clear TRAPPED status after turn
    const playerTrappedIndex =
      this.playerCombatant.statusEffects.indexOf('TRAPPED');
    if (playerTrappedIndex !== -1) {
      this.playerCombatant.statusEffects.splice(playerTrappedIndex, 1);
      this.messageLog.addMessage(
        `${this.playerCombatant.name} is free!`,
        'info'
      );
      await this.delay(1000);
    }
  }

  /**
   * Check if battle has ended (or phase transition needed)
   */
  private checkBattleEnd(): boolean {
    // Check if boss is defeated
    if (this.enemyCombatant.currentHP === 0) {
      // Check if boss has more phases
      if (this.bossData.phases && this.currentPhase < this.bossData.phases.length) {
        // Phase transition
        this.triggerPhaseTransition();
        return true; // Pause battle flow for transition
      } else {
        // Final phase defeated - victory!
        this.battleState = 'VICTORY';
        this.onVictory();
        return true;
      }
    }

    // Check if current player pet is defeated
    if (this.playerCombatant.currentHP === 0) {
      // Check if there are other alive pets in the party
      const alivePets = this.playerParty.filter(pet => pet.currentHP > 0);

      if (alivePets.length > 0) {
        // Auto-swap to next alive pet
        this.triggerAutoSwap();
        return true; // Pause battle flow for swap
      } else {
        // All pets defeated - party wipe!
        this.battleState = 'DEFEAT';
        this.onDefeat();
        return true;
      }
    }

    return false;
  }

  /**
   * Auto-swap to next alive pet when current one faints
   */
  private async triggerAutoSwap(): Promise<void> {
    this.messageLog.addMessage(
      `${this.playerCombatant.name} fainted!`,
      'status'
    );
    await this.delay(1500);

    // Find next alive pet
    let nextIndex = -1;
    for (let i = 0; i < this.playerParty.length; i++) {
      if (this.playerParty[i].currentHP > 0) {
        nextIndex = i;
        break;
      }
    }

    if (nextIndex === -1) {
      // No alive pets (shouldn't happen, but safety check)
      this.battleState = 'DEFEAT';
      this.onDefeat();
      return;
    }

    // Perform swap
    await this.performSwap(nextIndex);

    this.messageLog.addMessage(
      `Go, ${this.playerCombatant.name}!`,
      'action'
    );
    await this.delay(1500);

    // Resume battle - enemy's turn since pet fainted
    if (this.enemyCombatant.currentHP > 0) {
      const enemySkill = this.selectBossSkill();
      await this.executeSkill(this.enemyCombatant, this.playerCombatant, enemySkill);

      // Check for battle end after enemy attack
      if (this.checkBattleEnd()) {
        return;
      }

      // Process end of turn
      await this.processEndOfTurn();

      if (this.checkBattleEnd()) {
        return;
      }
    }

    // Start next turn
    this.startPlayerTurn();
  }

  /**
   * Trigger phase transition animation and setup
   */
  private async triggerPhaseTransition(): Promise<void> {
    const nextPhase = this.currentPhase + 1;
    const phaseData = this.bossData.phases?.find(p => p.phaseNumber === nextPhase);

    if (!phaseData) {
      console.error('Phase data not found for phase', nextPhase);
      return;
    }

    // Play transition animation
    await this.playPhaseTransition(nextPhase, phaseData);

    // Update phase number
    this.currentPhase = nextPhase;

    // Initialize boss with new phase data
    this.initializeBossFromPhase(nextPhase);

    // Update UI with new boss data
    this.updateBossUI(phaseData);

    // Resume battle - player's turn
    this.startPlayerTurn();
  }

  /**
   * Play phase transition animation
   */
  private async playPhaseTransition(phaseNumber: number, phaseData: BossPhaseData): Promise<void> {
    // Disable input during transition
    this.actionMenu.setVisible(false);
    this.skillMenu.setVisible(false);

    // Transition message
    let transitionMessage = '';
    if (phaseNumber === 2) {
      transitionMessage = 'The Sodium Serpent ignites in a greasy inferno!';
    } else if (phaseNumber === 3) {
      transitionMessage = 'The flames die out, but the serpent grows desperate!';
    } else {
      transitionMessage = `Phase ${phaseNumber} begins!`;
    }

    // Show message
    this.messageLog.addMessage(transitionMessage, 'effect');
    await this.delay(2000);

    // Flash effect on boss sprite
    if (this.enemyCombatant.sprite) {
      for (let i = 0; i < 3; i++) {
        await new Promise<void>((resolve) => {
          this.tweens.add({
            targets: this.enemyCombatant.sprite,
            alpha: 0,
            duration: 200,
            yoyo: true,
            onComplete: () => resolve(),
          });
        });
      }
      // IMPORTANT: Reset alpha to 1 after flashing
      this.enemyCombatant.sprite.setAlpha(1);
    }

    // Change boss sprite
    if (this.enemyCombatant.sprite && phaseData.spriteKey) {
      this.enemyCombatant.sprite.setTexture(phaseData.spriteKey);
    }

    // Change music for new phase
    this.playPhaseMusic(phaseNumber);

    // Change background if specified
    if (phaseData.backgroundKey) {
      this.tweens.add({
        targets: this.background,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          if (this.background && phaseData.backgroundKey) {
            this.background.setTexture(phaseData.backgroundKey);
            // Re-apply full canvas scaling for new texture
            this.background.setDisplaySize(400, 850);
            this.tweens.add({
              targets: this.background,
              alpha: 1,
              duration: 500,
            });
          }
        },
      });
      await this.delay(1000);
    }

    // Camera shake
    this.cameras.main.shake(500, 0.01);
    await this.delay(500);

    // Show phase name
    this.messageLog.addMessage(`Phase ${phaseNumber}: ${phaseData.name}!`, 'effect');
    await this.delay(1500);
  }

  /**
   * Update boss UI after phase transition
   */
  private updateBossUI(phaseData: BossPhaseData): void {
    // Update health bar with new max HP
    // Note: HealthBarUI may need to be recreated or have methods added for dynamic max HP
    // For now, just update the current HP
    this.enemyHealthBar.setHP(phaseData.baseStats.maxHP);

    // TODO: Update boss name label if HealthBarUI supports it
    // this.enemyHealthBar.updateLabel(this.enemyCombatant.name);
  }

  /**
   * Handle victory
   */
  private onVictory(): void {
    this.actionMenu.setVisible(false);
    this.skillMenu.setVisible(false);

    // Fade out music
    if (this.battleMusic && this.battleMusic.isPlaying) {
      this.tweens.add({
        targets: this.battleMusic,
        volume: 0,
        duration: 2000,
        onComplete: () => {
          this.battleMusic?.stop();
        },
      });
    }

    this.messageLog.addMessage(
      `${this.enemyCombatant.name} was defeated!`,
      'info'
    );

    // Fade out enemy sprite
    this.tweens.add({
      targets: this.enemyCombatant.sprite,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
    });

    this.time.delayedCall(2000, () => {
      this.messageLog.addMessage('You won the battle!', 'info');

      this.time.delayedCall(2000, () => {
        // Return to dungeon map
        this.scene.start('DungeonMapScene');
      });
    });
  }

  /**
   * Handle defeat
   */
  private onDefeat(): void {
    this.actionMenu.setVisible(false);
    this.skillMenu.setVisible(false);

    // Fade out music
    if (this.battleMusic && this.battleMusic.isPlaying) {
      this.tweens.add({
        targets: this.battleMusic,
        volume: 0,
        duration: 2000,
        onComplete: () => {
          this.battleMusic?.stop();
        },
      });
    }

    this.messageLog.addMessage(
      'All your pets fainted!',
      'info'
    );

    // Fade out player sprite
    this.tweens.add({
      targets: this.playerCombatant.sprite,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
    });

    this.time.delayedCall(2000, () => {
      this.messageLog.addMessage('You lost the battle...', 'info');

      this.time.delayedCall(2000, () => {
        // Return to dungeon map
        this.scene.start('DungeonMapScene');
      });
    });
  }

  /**
   * Flash sprite when hit
   */
  private flashSprite(sprite?: Phaser.GameObjects.Image): void {
    if (!sprite) return;

    this.tweens.add({
      targets: sprite,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2,
    });
  }

  /**
   * Get stat stage multiplier
   */
  private getStatMultiplier(stage: number): number {
    const clampedStage = Math.max(-6, Math.min(6, stage));
    const key = clampedStage.toString() as keyof typeof BATTLE_CONFIG.STAT_STAGE_MULTIPLIERS;
    return BATTLE_CONFIG.STAT_STAGE_MULTIPLIERS[key];
  }

  /**
   * Utility delay function with click-to-skip support
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      // If skip flag is set, resolve immediately
      if (this.skipDelay) {
        this.skipDelay = false; // Reset flag
        resolve();
        return;
      }

      // Set up click listener to skip this specific delay
      const skipListener = () => {
        this.skipDelay = false;
        this.input.off('pointerdown', skipListener);
        resolve();
      };

      this.input.once('pointerdown', skipListener);

      // Also resolve after the delay time
      this.time.delayedCall(ms, () => {
        this.input.off('pointerdown', skipListener);
        resolve();
      });
    });
  }

  /**
   * Play phase-specific battle music
   */
  private playPhaseMusic(phaseNumber: number): void {
    // Stop current music if playing
    if (this.battleMusic) {
      this.battleMusic.stop();
    }

    // Select music key based on phase
    let musicKey = '';
    switch (phaseNumber) {
      case 1:
        musicKey = 'battle-music-phase-1';
        break;
      case 2:
        musicKey = 'battle-music-phase-2';
        break;
      case 3:
        musicKey = 'battle-music-phase-3';
        break;
      default:
        musicKey = 'battle-music-phase-1';
    }

    // Play new music with loop
    try {
      this.battleMusic = this.sound.add(musicKey, {
        volume: 0.6,
        loop: true,
      });
      this.battleMusic.play();
      console.log(`Playing Phase ${phaseNumber} music: ${musicKey}`);
    } catch (error) {
      console.error('Failed to play battle music:', error);
    }
  }

  /**
   * Cleanup
   */
  shutdown(): void {
    // Stop and cleanup music
    if (this.battleMusic) {
      this.battleMusic.stop();
      this.battleMusic.destroy();
    }

    this.actionButtons = [];
    this.skillCards = [];
  }
}
