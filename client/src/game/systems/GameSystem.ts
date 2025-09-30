import { GameEngine } from '../GameEngine';

export class GameSystem {
  private engine: GameEngine;
  private gameTime: number = 0;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  update(deltaTime: number): void {
    this.gameTime += deltaTime;
    
    // Handle input for game state changes
    if (this.engine.inputSystem.isInventoryPressed()) {
      // Toggle inventory (handled by UI)
    }
    
    if (this.engine.inputSystem.isSpellBookPressed()) {
      // Toggle spell book (handled by UI)
    }
  }

  getGameTime(): number {
    return this.gameTime;
  }

  // Experience and leveling
  giveExperience(amount: number): void {
    const player = this.engine.player;
    player.stats.experience += amount;
    
    // Check for level up
    while (player.stats.experience >= player.stats.experienceToNext) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    const player = this.engine.player;
    player.stats.experience -= player.stats.experienceToNext;
    player.stats.level++;
    player.stats.availablePoints += 3; // 3 stat points per level
    
    // Increase health and mana
    const healthIncrease = 10 + player.stats.strength * 2;
    const manaIncrease = 5 + player.stats.intelligence * 3;
    
    player.stats.maxHealth += healthIncrease;
    player.stats.maxMana += manaIncrease;
    player.stats.health = player.stats.maxHealth; // Full heal on level up
    player.stats.mana = player.stats.maxMana; // Full mana on level up
    
    // Update experience requirement for next level
    player.stats.experienceToNext = this.calculateExperienceRequired(player.stats.level + 1);
    
    console.log(`Level up! Now level ${player.stats.level}`);
    
    // Save game
    this.engine.saveSystem.saveGame();
  }

  private calculateExperienceRequired(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  // Stat allocation
  allocateStatPoint(stat: 'strength' | 'intelligence' | 'dexterity'): boolean {
    const player = this.engine.player;
    if (player.stats.availablePoints <= 0) return false;
    
    player.stats.availablePoints--;
    player.stats[stat]++;
    
    // Update derived stats
    if (stat === 'strength') {
      player.stats.maxHealth += 2;
      player.stats.health = Math.min(player.stats.health + 2, player.stats.maxHealth);
    } else if (stat === 'intelligence') {
      player.stats.maxMana += 3;
      player.stats.mana = Math.min(player.stats.mana + 3, player.stats.maxMana);
    }
    
    this.engine.saveSystem.saveGame();
    return true;
  }

  // Gold management
  addGold(amount: number): void {
    this.engine.player.stats.gold += amount;
    this.engine.saveSystem.saveGame();
  }

  spendGold(amount: number): boolean {
    if (this.engine.player.stats.gold >= amount) {
      this.engine.player.stats.gold -= amount;
      this.engine.saveSystem.saveGame();
      return true;
    }
    return false;
  }
}
