import { GameEngine } from '../GameEngine';
import { GameSave } from '../../types/GameTypes';

export class SaveSystem {
  private engine: GameEngine;
  private saveKey = 'rpg_game_save';

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  saveGame(): void {
    try {
      const saveData: GameSave = {
        player: {
          stats: this.engine.player.stats,
          position: this.engine.player.position,
          currentArea: this.engine.worldSystem.getCurrentArea()?.id || 'village'
        },
        inventory: this.engine.inventorySystem.getInventory(),
        equipment: this.engine.inventorySystem.getEquipment(),
        spells: this.engine.spellSystem.getKnownSpells(),
        quests: [], // TODO: Implement quest system
        worldState: {},
        timestamp: Date.now()
      };

      localStorage.setItem(this.saveKey, JSON.stringify(saveData));
      console.log('Game saved successfully');
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  loadGame(): boolean {
    try {
      const saveDataString = localStorage.getItem(this.saveKey);
      if (!saveDataString) {
        console.log('No save file found, starting new game');
        return false;
      }

      const saveData: GameSave = JSON.parse(saveDataString);
      
      // Restore player data
      this.engine.player.stats = saveData.player.stats;
      this.engine.player.position = saveData.player.position;
      
      // Restore inventory and equipment
      // Note: This would need proper restoration logic
      
      // Restore spells
      for (const spell of saveData.spells) {
        this.engine.spellSystem.learnSpell(spell);
      }
      
      // Change to saved area
      this.engine.worldSystem.changeArea(saveData.player.currentArea);
      
      console.log('Game loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  }

  deleteSave(): void {
    localStorage.removeItem(this.saveKey);
    console.log('Save file deleted');
  }

  hasSave(): boolean {
    return localStorage.getItem(this.saveKey) !== null;
  }

  getSaveInfo(): { timestamp: number; level: number } | null {
    try {
      const saveDataString = localStorage.getItem(this.saveKey);
      if (!saveDataString) return null;

      const saveData: GameSave = JSON.parse(saveDataString);
      return {
        timestamp: saveData.timestamp,
        level: saveData.player.stats.level
      };
    } catch (error) {
      return null;
    }
  }
}
