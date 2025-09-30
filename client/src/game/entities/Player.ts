import { Entity } from './Entity';
import { Vector2, PlayerStats } from '../../types/GameTypes';
import { InputSystem } from '../systems/InputSystem';
import { RenderSystem } from '../systems/RenderSystem';

export class Player extends Entity {
  public stats: PlayerStats;
  private movementSpeed = 150; // pixels per second
  private lastUpdateTime = 0;

  constructor(position: Vector2) {
    super(position);
    
    this.stats = {
      level: 1,
      experience: 0,
      experienceToNext: 100,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      strength: 10,
      intelligence: 10,
      dexterity: 10,
      availablePoints: 0,
      gold: 100
    };
  }

  update(deltaTime: number, inputSystem: InputSystem): void {
    this.handleMovement(deltaTime, inputSystem);
    this.regenerateMana(deltaTime);
  }

  private handleMovement(deltaTime: number, inputSystem: InputSystem): void {
    let moveX = 0;
    let moveY = 0;

    if (inputSystem.isMovingLeft()) {
      moveX -= 1;
    }
    if (inputSystem.isMovingRight()) {
      moveX += 1;
    }
    if (inputSystem.isMovingUp()) {
      moveY -= 1;
    }
    if (inputSystem.isMovingDown()) {
      moveY += 1;
    }

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707; // 1/sqrt(2)
      moveY *= 0.707;
    }

    // Apply movement
    const speed = this.movementSpeed * deltaTime;
    this.position.x += moveX * speed;
    this.position.y += moveY * speed;

    // Log movement for debugging
    if (moveX !== 0 || moveY !== 0) {
      console.log(`Player moving: (${moveX.toFixed(2)}, ${moveY.toFixed(2)}) to (${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)})`);
    }
  }

  private regenerateMana(deltaTime: number): void {
    const manaRegen = 5 * deltaTime; // 5 mana per second
    this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + manaRegen);
  }

  render(renderSystem: RenderSystem): void {
    // Draw player as a colored rectangle for now
    renderSystem.drawRect(
      this.position.x - this.size.x / 2,
      this.position.y - this.size.y / 2,
      this.size.x,
      this.size.y,
      '#4a90e2'
    );

    // Draw health bar above player
    const barWidth = 40;
    const barHeight = 6;
    const barX = this.position.x - barWidth / 2;
    const barY = this.position.y - this.size.y / 2 - 15;

    renderSystem.drawHealthBar(barX, barY, barWidth, barHeight, this.stats.health, this.stats.maxHealth);

    // Draw mana bar above health bar
    renderSystem.drawManaBar(barX, barY - 10, barWidth, barHeight, this.stats.mana, this.stats.maxMana);
  }

  takeDamage(amount: number): void {
    this.stats.health = Math.max(0, this.stats.health - amount);
    console.log(`Player takes ${amount} damage, health: ${this.stats.health}`);
  }

  heal(amount: number): void {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }

  spendMana(amount: number): boolean {
    if (this.stats.mana >= amount) {
      this.stats.mana -= amount;
      return true;
    }
    return false;
  }

  restoreMana(amount: number): void {
    this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + amount);
  }

  getDefense(): number {
    // Base defense plus equipment bonuses
    return Math.floor(this.stats.dexterity / 2) + 5;
  }

  isDead(): boolean {
    return this.stats.health <= 0;
  }
}
