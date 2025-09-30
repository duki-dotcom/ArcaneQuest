import { GameEngine } from '../GameEngine';
import { Enemy } from '../entities/Enemy';
import { RenderSystem } from './RenderSystem';
import { Vector2 } from '../../types/GameTypes';

export class CombatSystem {
  private engine: GameEngine;
  private enemies: Enemy[] = [];
  private inCombat = false;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  update(deltaTime: number): void {
    // Update all enemies
    for (const enemy of this.enemies) {
      enemy.update(deltaTime, this.engine.player);
      
      // Simple AI: move towards player if in range
      const distance = this.getDistance(enemy.position, this.engine.player.position);
      if (distance < 200) {
        this.moveEnemyTowardsPlayer(enemy, deltaTime);
        
        // Attack if close enough
        if (distance < 50 && enemy.canAttack()) {
          this.enemyAttack(enemy);
        }
      }
    }

    // Check for player attacks
    if (this.engine.inputSystem.isAttackPressed()) {
      this.playerMeleeAttack();
    }

    // Remove dead enemies
    this.enemies = this.enemies.filter(enemy => {
      if (enemy.stats.health <= 0) {
        this.onEnemyDefeated(enemy);
        return false;
      }
      return true;
    });
  }

  render(renderSystem: RenderSystem): void {
    // Render all enemies
    for (const enemy of this.enemies) {
      enemy.render(renderSystem);
    }
  }

  private moveEnemyTowardsPlayer(enemy: Enemy, deltaTime: number): void {
    const dx = this.engine.player.position.x - enemy.position.x;
    const dy = this.engine.player.position.y - enemy.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const speed = enemy.movementSpeed * deltaTime;
      enemy.position.x += (dx / distance) * speed;
      enemy.position.y += (dy / distance) * speed;
    }
  }

  private enemyAttack(enemy: Enemy): void {
    const player = this.engine.player;
    const damage = this.calculateDamage(enemy.stats.strength, player.getDefense());
    
    player.takeDamage(damage);
    enemy.lastAttackTime = this.engine.gameSystem.getGameTime();
    
    console.log(`${enemy.name} attacks for ${damage} damage!`);
  }

  private playerMeleeAttack(): void {
    const player = this.engine.player;
    const attackRange = 60;
    
    // Find enemies in melee range
    for (const enemy of this.enemies) {
      const distance = this.getDistance(player.position, enemy.position);
      if (distance <= attackRange) {
        const damage = this.calculateDamage(player.stats.strength, enemy.getDefense());
        enemy.takeDamage(damage);
        console.log(`Player attacks ${enemy.name} for ${damage} damage!`);
      }
    }
  }

  dealAreaDamage(x: number, y: number, radius: number, damage: number): void {
    for (const enemy of this.enemies) {
      const distance = this.getDistance({ x, y }, enemy.position);
      if (distance <= radius) {
        const actualDamage = this.calculateDamage(damage, enemy.getDefense());
        enemy.takeDamage(actualDamage);
        console.log(`Spell hits ${enemy.name} for ${actualDamage} damage!`);
      }
    }
  }

  private calculateDamage(attackPower: number, defense: number): number {
    const baseDamage = attackPower;
    const reducedDamage = Math.max(1, baseDamage - defense);
    return Math.floor(reducedDamage * (0.8 + Math.random() * 0.4)); // 20% variance
  }

  private getDistance(pos1: Vector2, pos2: Vector2): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private onEnemyDefeated(enemy: Enemy): void {
    // Give experience and gold
    this.engine.gameSystem.giveExperience(enemy.stats.experience);
    this.engine.gameSystem.addGold(enemy.stats.gold);
    
    // Chance to drop loot
    for (const lootId of enemy.stats.loot) {
      if (Math.random() < 0.3) { // 30% chance per item
        this.engine.inventorySystem.addItem(lootId, 1);
      }
    }
    
    console.log(`Defeated ${enemy.name}! Gained ${enemy.stats.experience} XP and ${enemy.stats.gold} gold`);
  }

  spawnEnemy(enemyType: string, x: number, y: number): void {
    const enemy = Enemy.create(enemyType, { x, y });
    this.enemies.push(enemy);
    console.log(`Spawned ${enemy.name} at (${x}, ${y})`);
  }

  getEnemies(): Enemy[] {
    return [...this.enemies];
  }

  clearEnemies(): void {
    this.enemies = [];
  }

  isInCombat(): boolean {
    return this.inCombat || this.enemies.length > 0;
  }
}
