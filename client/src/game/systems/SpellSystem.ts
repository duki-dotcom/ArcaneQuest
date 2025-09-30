import { GameEngine } from '../GameEngine';
import { Spell, SpellSchool, SpellComponent, SpellEffect } from '../../types/GameTypes';
import { PRESET_SPELLS } from '../spells/SpellData';
import { RenderSystem } from './RenderSystem';

interface ActiveSpell {
  spell: Spell;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  startTime: number;
  duration: number;
}

export class SpellSystem {
  private engine: GameEngine;
  private knownSpells: Spell[] = [];
  private activeSpells: ActiveSpell[] = [];
  private cooldowns: Map<string, number> = new Map();

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  async initialize(): Promise<void> {
    console.log('Initializing SpellSystem...');
    
    // Start with basic spells
    this.knownSpells = [
      PRESET_SPELLS.fireball,
      PRESET_SPELLS.heal,
      PRESET_SPELLS.lightning,
      PRESET_SPELLS.shield
    ];
    
    console.log('SpellSystem initialized with', this.knownSpells.length, 'spells');
  }

  update(deltaTime: number): void {
    // Update cooldowns
    for (const [spellId, timeLeft] of this.cooldowns.entries()) {
      const newTime = timeLeft - deltaTime;
      if (newTime <= 0) {
        this.cooldowns.delete(spellId);
      } else {
        this.cooldowns.set(spellId, newTime);
      }
    }

    // Update active spell effects
    this.activeSpells = this.activeSpells.filter(activeSpell => {
      const elapsed = this.engine.gameSystem.getGameTime() - activeSpell.startTime;
      return elapsed < activeSpell.duration;
    });
  }

  render(renderSystem: RenderSystem): void {
    // Render active spell effects
    for (const activeSpell of this.activeSpells) {
      const elapsed = this.engine.gameSystem.getGameTime() - activeSpell.startTime;
      const progress = elapsed / activeSpell.duration;
      
      // Animate spell based on school
      this.renderSpellEffect(renderSystem, activeSpell, progress);
    }
  }

  private renderSpellEffect(renderSystem: RenderSystem, activeSpell: ActiveSpell, progress: number): void {
    const { spell, x, y, targetX, targetY } = activeSpell;
    
    // Interpolate position for projectile spells
    const currentX = x + (targetX - x) * progress;
    const currentY = y + (targetY - y) * progress;
    
    // Render based on spell school
    switch (spell.school) {
      case 'fire':
        renderSystem.drawSpellEffect(currentX, currentY, 20 * (1 - progress * 0.5), '#ff4444', 1 - progress * 0.3);
        break;
      case 'ice':
        renderSystem.drawSpellEffect(currentX, currentY, 15 * (1 - progress * 0.3), '#44aaff', 1 - progress * 0.2);
        break;
      case 'lightning':
        renderSystem.drawSpellEffect(currentX, currentY, 25 * (1 - progress * 0.7), '#ffff44', 1 - progress * 0.5);
        break;
      case 'healing':
        renderSystem.drawSpellEffect(currentX, currentY, 30 * (1 - progress * 0.2), '#44ff44', 1 - progress * 0.3);
        break;
      default:
        renderSystem.drawSpellEffect(currentX, currentY, 20, '#ffffff', 1 - progress * 0.5);
        break;
    }
  }

  castSpell(spellId: string, targetX: number, targetY: number): boolean {
    const spell = this.knownSpells.find(s => s.id === spellId);
    if (!spell) {
      console.log('Spell not known:', spellId);
      return false;
    }

    // Check cooldown
    if (this.cooldowns.has(spellId)) {
      console.log('Spell on cooldown:', spellId);
      return false;
    }

    // Check mana
    const player = this.engine.player;
    if (player.stats.mana < spell.manaCost) {
      console.log('Not enough mana for spell:', spellId);
      return false;
    }

    // Cast spell
    player.stats.mana -= spell.manaCost;
    this.cooldowns.set(spellId, spell.cooldown);

    // Add to active spells
    this.activeSpells.push({
      spell,
      x: player.position.x,
      y: player.position.y,
      targetX,
      targetY,
      startTime: this.engine.gameSystem.getGameTime(),
      duration: 1.0 // 1 second duration for most effects
    });

    // Apply spell effects
    this.applySpellEffects(spell, targetX, targetY);

    console.log(`Cast spell: ${spell.name}`);
    return true;
  }

  private applySpellEffects(spell: Spell, targetX: number, targetY: number): void {
    const player = this.engine.player;

    for (const effect of spell.effects) {
      switch (effect.type) {
        case 'damage':
          // Find enemies in range and damage them
          this.engine.combatSystem.dealAreaDamage(targetX, targetY, 50, effect.value);
          break;
        case 'healing':
          if (effect.target === 'self') {
            player.stats.health = Math.min(player.stats.maxHealth, player.stats.health + effect.value);
          }
          break;
        case 'buff':
          // Apply temporary buffs (implementation depends on buff system)
          console.log(`Applied buff: ${effect.value} for ${effect.duration}s`);
          break;
        case 'debuff':
          // Apply debuffs to enemies in range
          console.log(`Applied debuff: ${effect.value} for ${effect.duration}s`);
          break;
      }
    }
  }

  learnSpell(spell: Spell): boolean {
    if (this.knownSpells.find(s => s.id === spell.id)) {
      return false; // Already known
    }
    
    this.knownSpells.push(spell);
    console.log(`Learned new spell: ${spell.name}`);
    this.engine.saveSystem.saveGame();
    return true;
  }

  getKnownSpells(): Spell[] {
    return [...this.knownSpells];
  }

  getSpellCooldown(spellId: string): number {
    return this.cooldowns.get(spellId) || 0;
  }

  // Custom spell creation
  createCustomSpell(components: SpellComponent[], name: string): Spell | null {
    // Check if player has unlocked custom spell creation
    if (this.engine.player.stats.level < 10) {
      console.log('Custom spell creation requires level 10');
      return null;
    }

    // Validate components
    const hasElement = components.some(c => c.type === 'element');
    const hasShape = components.some(c => c.type === 'shape');
    
    if (!hasElement || !hasShape) {
      console.log('Custom spell requires at least element and shape components');
      return null;
    }

    // Calculate spell properties based on components
    let manaCost = 10;
    let damage = 0;
    let healing = 0;
    const effects: SpellEffect[] = [];
    let school: SpellSchool = 'arcane';

    for (const component of components) {
      manaCost += component.modifier * 5;
      
      switch (component.value) {
        case 'fire':
          school = 'fire';
          damage += component.modifier * 20;
          break;
        case 'ice':
          school = 'ice';
          damage += component.modifier * 15;
          break;
        case 'lightning':
          school = 'lightning';
          damage += component.modifier * 25;
          break;
        case 'heal':
          school = 'healing';
          healing += component.modifier * 30;
          break;
      }
    }

    // Create the spell
    const customSpell: Spell = {
      id: `custom_${Date.now()}`,
      name,
      description: 'A custom spell created by the player',
      school,
      manaCost,
      cooldown: 3.0,
      damage: damage > 0 ? damage : undefined,
      healing: healing > 0 ? healing : undefined,
      effects: effects,
      components,
      isCustom: true
    };

    // Add appropriate effects
    if (damage > 0) {
      customSpell.effects.push({
        type: 'damage',
        value: damage,
        target: 'enemy'
      });
    }

    if (healing > 0) {
      customSpell.effects.push({
        type: 'healing',
        value: healing,
        target: 'self'
      });
    }

    return customSpell;
  }
}
