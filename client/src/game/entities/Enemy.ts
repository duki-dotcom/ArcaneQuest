import { Entity } from './Entity';
import { Vector2, Enemy as EnemyData } from '../../types/GameTypes';
import { RenderSystem } from '../systems/RenderSystem';
import { Player } from './Player';

export class Enemy extends Entity {
  public name: string;
  public stats: EnemyData;
  public movementSpeed: number;
  public lastAttackTime: number = 0;
  public attackCooldown: number = 2.0;

  constructor(position: Vector2, stats: EnemyData) {
    super(position);
    this.name = stats.name;
    this.stats = stats;
    this.movementSpeed = 50 + stats.dexterity * 2;
  }

  static create(type: string, position: Vector2): Enemy {
    const enemyData = ENEMY_TYPES[type] || ENEMY_TYPES.goblin;
    return new Enemy(position, { ...enemyData });
  }

  update(deltaTime: number, player: Player): void {
    // Enemy AI will be handled by CombatSystem
  }

  render(renderSystem: RenderSystem): void {
    // Draw enemy as a colored rectangle
    const color = this.getColorByType();
    renderSystem.drawRect(
      this.position.x - this.size.x / 2,
      this.position.y - this.size.y / 2,
      this.size.x,
      this.size.y,
      color
    );

    // Draw health bar if damaged
    if (this.stats.health < this.stats.maxHealth) {
      const barWidth = 30;
      const barHeight = 4;
      const barX = this.position.x - barWidth / 2;
      const barY = this.position.y - this.size.y / 2 - 10;

      renderSystem.drawHealthBar(barX, barY, barWidth, barHeight, this.stats.health, this.stats.maxHealth);
    }

    // Draw name
    renderSystem.drawText(
      this.name,
      this.position.x,
      this.position.y - this.size.y / 2 - 25,
      '#ffffff',
      12,
      'center'
    );
  }

  private getColorByType(): string {
    const colors: Record<string, string> = {
      goblin: '#8b4513',
      orc: '#654321',
      skeleton: '#f5f5dc',
      dragon: '#dc143c',
      wizard: '#4b0082',
      slime: '#32cd32'
    };
    
    // Try to match by name
    for (const [type, color] of Object.entries(colors)) {
      if (this.name.toLowerCase().includes(type)) {
        return color;
      }
    }
    
    return '#8b0000'; // Default red
  }

  takeDamage(amount: number): void {
    this.stats.health = Math.max(0, this.stats.health - amount);
    console.log(`${this.name} takes ${amount} damage, health: ${this.stats.health}`);
  }

  canAttack(): boolean {
    return Date.now() / 1000 - this.lastAttackTime >= this.attackCooldown;
  }

  getDefense(): number {
    return Math.floor(this.stats.dexterity / 3) + 2;
  }

  isDead(): boolean {
    return this.stats.health <= 0;
  }
}

// Enemy type definitions
const ENEMY_TYPES: Record<string, EnemyData> = {
  goblin: {
    id: 'goblin',
    name: 'Goblin',
    level: 1,
    health: 40,
    maxHealth: 40,
    mana: 10,
    maxMana: 10,
    strength: 8,
    intelligence: 4,
    dexterity: 12,
    experience: 15,
    gold: 10,
    loot: ['crystal_shard'],
    spells: [],
    aiType: 'aggressive'
  },

  orc: {
    id: 'orc',
    name: 'Orc Warrior',
    level: 3,
    health: 80,
    maxHealth: 80,
    mana: 5,
    maxMana: 5,
    strength: 15,
    intelligence: 3,
    dexterity: 8,
    experience: 35,
    gold: 25,
    loot: ['health_potion', 'crystal_shard'],
    spells: [],
    aiType: 'aggressive'
  },

  skeleton: {
    id: 'skeleton',
    name: 'Skeleton',
    level: 2,
    health: 50,
    maxHealth: 50,
    mana: 20,
    maxMana: 20,
    strength: 10,
    intelligence: 8,
    dexterity: 10,
    experience: 25,
    gold: 15,
    loot: ['mana_potion', 'crystal_shard'],
    spells: ['fireball'],
    aiType: 'balanced'
  },

  skeleton_mage: {
    id: 'skeleton_mage',
    name: 'Skeleton Mage',
    level: 5,
    health: 60,
    maxHealth: 60,
    mana: 80,
    maxMana: 80,
    strength: 6,
    intelligence: 18,
    dexterity: 12,
    experience: 60,
    gold: 40,
    loot: ['mana_potion', 'apprentice_wand', 'mana_crystal'],
    spells: ['fireball', 'lightning', 'ice_shield'],
    aiType: 'defensive'
  },

  giant_spider: {
    id: 'giant_spider',
    name: 'Giant Spider',
    level: 4,
    health: 70,
    maxHealth: 70,
    mana: 15,
    maxMana: 15,
    strength: 12,
    intelligence: 6,
    dexterity: 20,
    experience: 50,
    gold: 30,
    loot: ['health_potion', 'crystal_shard'],
    spells: [],
    aiType: 'aggressive'
  },

  fire_elemental: {
    id: 'fire_elemental',
    name: 'Fire Elemental',
    level: 8,
    health: 120,
    maxHealth: 120,
    mana: 100,
    maxMana: 100,
    strength: 14,
    intelligence: 22,
    dexterity: 16,
    experience: 100,
    gold: 75,
    loot: ['tome_of_fire', 'mana_crystal', 'crystal_shard'],
    spells: ['fireball', 'flame_strike'],
    aiType: 'balanced'
  },

  shadow_wraith: {
    id: 'shadow_wraith',
    name: 'Shadow Wraith',
    level: 10,
    health: 90,
    maxHealth: 90,
    mana: 150,
    maxMana: 150,
    strength: 8,
    intelligence: 25,
    dexterity: 22,
    experience: 150,
    gold: 100,
    loot: ['grimoire_of_shadows', 'greater_health_potion', 'mana_crystal'],
    spells: ['curse', 'drain_life', 'shadow_bolt'],
    aiType: 'defensive'
  },

  dragon: {
    id: 'dragon',
    name: 'Ancient Dragon',
    level: 25,
    health: 500,
    maxHealth: 500,
    mana: 300,
    maxMana: 300,
    strength: 30,
    intelligence: 28,
    dexterity: 20,
    experience: 1000,
    gold: 500,
    loot: ['dragon_scale', 'archmage_rod', 'crystal_of_power'],
    spells: ['dragon_breath', 'meteor', 'time_stop'],
    aiType: 'balanced'
  }
};
