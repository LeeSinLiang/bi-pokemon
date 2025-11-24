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
} from '../data/typeChart';
import HealthBarUI from '../ui/HealthBarUI';
import SkillCardUI from '../ui/SkillCardUI';
import ActionButtonUI, { type ActionButtonType } from '../ui/ActionButtonUI';
import MessageLogUI from '../ui/MessageLogUI';
import BattleVFX from '../ui/BattleVFX';

export default class BattleScene extends Phaser.Scene {
  // Scene data
  private levelData!: BattleSceneData;

  // Battle state
  private battleState: BattleState = 'INTRO';
  private playerCombatant!: BattleCombatant;
  private enemyCombatant!: BattleCombatant;

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
    // Load battle background for Level 2
    this.load.image(
      'battle-bg-level-2',
      '/assets/dungeon/battle/backgrounds/level-2.png'
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

    // Load boss sprites
    this.load.image(
      'boss-serpent',
      '/assets/dungeon/battle/enemies/serpent.png'
    );
    this.load.image(
      'boss-serpent-damage',
      '/assets/dungeon/battle/enemies/serpent-damage.png'
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
    // Add battle arena background (9:16 aspect ratio - 400x711)
    this.background = this.add.image(200, 425, 'battle-bg-level-2');
    this.background.setDisplaySize(400, 711);
    // Center it vertically in the 850px viewport
    this.background.setY(355);
  }

  /**
   * Initialize player and enemy combatants
   */
  private initializeCombatants(): void {
    // Get player pet (default to Lemon Shark for demo, can be customized)
    const selectedPetId = this.levelData.selectedPetId || 'LEMON_SHARK';
    const petData = getBattlePet(selectedPetId);

    if (!petData) {
      console.error('Failed to load pet data');
      return;
    }

    // Create player combatant
    this.playerCombatant = {
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

    // Get boss data for Level 2
    const bossData = getBossByLevel(this.levelData.level);

    if (!bossData) {
      console.error('Failed to load boss data');
      return;
    }

    // Create enemy combatant
    this.enemyCombatant = {
      id: bossData.id,
      name: bossData.name,
      types: bossData.types,
      currentHP: bossData.baseStats.maxHP,
      maxHP: bossData.baseStats.maxHP,
      baseAttack: bossData.baseStats.attack,
      baseDefense: bossData.baseStats.defense,
      baseSpeed: bossData.baseStats.speed,
      skills: bossData.moveset,
      statusEffects: [],
      statModifiers: new Map(),
      isPlayer: false,
      passiveAbility: bossData.passiveAbility,
    };

    console.log('Combatants initialized:', {
      player: this.playerCombatant.name,
      enemy: this.enemyCombatant.name,
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
    this.playerCombatant.sprite = playerSprite;

    // Create boss sprite (upper-right position)
    const enemySprite = this.add.image(
      BATTLE_CONFIG.POSITIONS.ENEMY.X,
      BATTLE_CONFIG.POSITIONS.ENEMY.Y,
      'boss-serpent'
    );
    enemySprite.setScale(0.4);
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

    this.enemyHealthBar = new HealthBarUI(
      this,
      BATTLE_CONFIG.POSITIONS.ENEMY.X,
      BATTLE_CONFIG.POSITIONS.ENEMY.Y - 80,
      this.enemyCombatant.name,
      this.enemyCombatant.currentHP,
      this.enemyCombatant.maxHP
    );

    // Create message log
    this.messageLog = new MessageLogUI(
      this,
      200,
      BATTLE_CONFIG.MESSAGE_LOG.Y_POSITION
    );

    // Create action menu
    this.createActionMenu();

    // Create skill menu (hidden initially)
    this.createSkillMenu();
  }

  /**
   * Create action menu (Fight, Feed, Swap, Flee)
   */
  private createActionMenu(): void {
    this.actionMenu = this.add.container(200, 750);

    const buttonSpacing = BATTLE_CONFIG.ACTION_BUTTON.WIDTH + 10;
    const startX = -buttonSpacing * 1.5;

    // Fight button
    const fightBtn = new ActionButtonUI(
      this,
      startX,
      0,
      'FIGHT',
      'Fight',
      () => this.onFightClicked()
    );
    this.actionButtons.push(fightBtn);
    this.actionMenu.add(fightBtn);

    // Feed button (disabled for demo)
    const feedBtn = new ActionButtonUI(
      this,
      startX + buttonSpacing,
      0,
      'FEED',
      'Feed',
      () => this.messageLog.addMessage('No items available!')
    );
    feedBtn.setDisabled(true);
    this.actionButtons.push(feedBtn);
    this.actionMenu.add(feedBtn);

    // Swap button (disabled for demo - single pet)
    const swapBtn = new ActionButtonUI(
      this,
      startX + buttonSpacing * 2,
      0,
      'SWAP',
      'Swap',
      () => this.messageLog.addMessage('No other pets available!')
    );
    swapBtn.setDisabled(true);
    this.actionButtons.push(swapBtn);
    this.actionMenu.add(swapBtn);

    // Flee button
    const fleeBtn = new ActionButtonUI(
      this,
      startX + buttonSpacing * 3,
      0,
      'FLEE',
      'Flee',
      () => this.onFleeClicked()
    );
    this.actionButtons.push(fleeBtn);
    this.actionMenu.add(fleeBtn);

    this.actionMenu.setVisible(false);
  }

  /**
   * Create skill selection menu
   */
  private createSkillMenu(): void {
    this.skillMenu = this.add.container(200, 750);

    const cardSpacing = BATTLE_CONFIG.SKILL_CARD.WIDTH + 10;
    const numSkills = this.playerCombatant.skills.length;
    const startX = -(cardSpacing * (numSkills - 1)) / 2;

    // Create skill cards
    this.playerCombatant.skills.forEach((skill, index) => {
      const card = new SkillCardUI(
        this,
        startX + cardSpacing * index,
        0,
        skill,
        () => this.onSkillSelected(skill)
      );
      this.skillCards.push(card);
      this.skillMenu.add(card);
    });

    // Back button
    const backBtn = new ActionButtonUI(
      this,
      0,
      50,
      'FLEE',
      'Back',
      () => this.showActionMenu()
    );
    this.skillMenu.add(backBtn);

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

    // Choose random enemy skill
    const enemySkill =
      this.enemyCombatant.skills[
        Math.floor(Math.random() * this.enemyCombatant.skills.length)
      ];

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

    // Check accuracy
    const accuracyStage = attacker.statModifiers.get('ACCURACY') || 0;
    const evasionStage = defender.statModifiers.get('EVASION') || 0;

    if (!checkAccuracy(skill.accuracy || 100, accuracyStage, evasionStage)) {
      this.messageLog.addMessage(`${attacker.name}'s attack missed!`, 'info');
      this.vfx.showMiss(defender.sprite?.x || 0, defender.sprite?.y || 0);
      await this.delay(1000);
      return;
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

    // Check if boss should switch to damaged sprite
    if (!defender.isPlayer && defender.currentHP / defender.maxHP < 0.5) {
      defender.sprite?.setTexture('boss-serpent-damage');
    }
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
      };

      const statusNames: Record<StatusEffect, string> = {
        DEHYDRATED: 'Dehydrated',
        GREASED: 'Greased',
        SOUR: 'Sour',
        SLEEP: 'Asleep',
        TRAPPED: 'Trapped',
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
      const damage =
        this.playerCombatant.maxHP *
        (BATTLE_CONFIG.DEHYDRATED_DAMAGE_PERCENT / 100);
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

    // Process enemy status effects
    if (this.enemyCombatant.statusEffects.includes('DEHYDRATED')) {
      const damage =
        this.enemyCombatant.maxHP *
        (BATTLE_CONFIG.DEHYDRATED_DAMAGE_PERCENT / 100);
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
   * Check if battle has ended
   */
  private checkBattleEnd(): boolean {
    if (this.enemyCombatant.currentHP === 0) {
      this.battleState = 'VICTORY';
      this.onVictory();
      return true;
    }

    if (this.playerCombatant.currentHP === 0) {
      this.battleState = 'DEFEAT';
      this.onDefeat();
      return true;
    }

    return false;
  }

  /**
   * Handle victory
   */
  private onVictory(): void {
    this.actionMenu.setVisible(false);
    this.skillMenu.setVisible(false);

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

    this.messageLog.addMessage(
      `${this.playerCombatant.name} fainted!`,
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
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.time.delayedCall(ms, () => resolve());
    });
  }

  /**
   * Cleanup
   */
  shutdown(): void {
    this.actionButtons = [];
    this.skillCards = [];
  }
}
