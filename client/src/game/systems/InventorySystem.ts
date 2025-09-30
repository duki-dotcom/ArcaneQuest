import { GameEngine } from '../GameEngine';
import { Item, InventorySlot, Equipment, EquipmentSlot } from '../../types/GameTypes';
import { ITEMS } from '../items/ItemData';

export class InventorySystem {
  private engine: GameEngine;
  private inventory: InventorySlot[] = [];
  private equipment: Equipment = {
    weapon: null,
    armor: null,
    helmet: null,
    boots: null,
    accessory1: null,
    accessory2: null
  };
  private maxSlots = 30;
  private maxWeight = 100;

  constructor(engine: GameEngine) {
    this.engine = engine;
    
    // Initialize empty inventory
    for (let i = 0; i < this.maxSlots; i++) {
      this.inventory.push({ item: null, quantity: 0 });
    }
  }

  async initialize(): Promise<void> {
    console.log('Initializing InventorySystem...');
    
    // Give player starting items
    this.addItem('health_potion', 3);
    this.addItem('mana_potion', 2);
    this.addItem('wooden_staff', 1);
    this.addItem('cloth_robe', 1);
    
    console.log('InventorySystem initialized');
  }

  addItem(itemId: string, quantity: number = 1): boolean {
    const itemData = ITEMS[itemId];
    if (!itemData) {
      console.log('Unknown item:', itemId);
      return false;
    }

    // Check weight limit
    const totalWeight = this.getTotalWeight() + (itemData.weight * quantity);
    if (totalWeight > this.maxWeight) {
      console.log('Inventory too heavy!');
      return false;
    }

    // Try to stack with existing items
    for (const slot of this.inventory) {
      if (slot.item && slot.item.id === itemId && this.canStack(itemData)) {
        slot.quantity += quantity;
        this.engine.saveSystem.saveGame();
        return true;
      }
    }

    // Find empty slot
    for (const slot of this.inventory) {
      if (!slot.item) {
        slot.item = itemData;
        slot.quantity = quantity;
        this.engine.saveSystem.saveGame();
        return true;
      }
    }

    console.log('Inventory full!');
    return false;
  }

  removeItem(itemId: string, quantity: number = 1): boolean {
    for (const slot of this.inventory) {
      if (slot.item && slot.item.id === itemId) {
        if (slot.quantity >= quantity) {
          slot.quantity -= quantity;
          if (slot.quantity === 0) {
            slot.item = null;
          }
          this.engine.saveSystem.saveGame();
          return true;
        }
      }
    }
    return false;
  }

  useItem(itemId: string): boolean {
    const slot = this.inventory.find(s => s.item && s.item.id === itemId);
    if (!slot || !slot.item) return false;

    // Apply item effects
    switch (itemId) {
      case 'health_potion':
        const player = this.engine.player;
        const healAmount = 50;
        const newHealth = Math.min(player.stats.maxHealth, player.stats.health + healAmount);
        player.stats.health = newHealth;
        console.log(`Used health potion, healed ${healAmount} HP`);
        break;
      
      case 'mana_potion':
        const manaAmount = 30;
        const newMana = Math.min(this.engine.player.stats.maxMana, this.engine.player.stats.mana + manaAmount);
        this.engine.player.stats.mana = newMana;
        console.log(`Used mana potion, restored ${manaAmount} MP`);
        break;
        
      default:
        console.log('Item not usable:', itemId);
        return false;
    }

    // Remove the used item
    this.removeItem(itemId, 1);
    return true;
  }

  equipItem(itemId: string): boolean {
    const slot = this.inventory.find(s => s.item && s.item.id === itemId);
    if (!slot || !slot.item) return false;

    const item = slot.item;
    const equipSlot = this.getEquipmentSlot(item);
    if (!equipSlot) {
      console.log('Item cannot be equipped:', itemId);
      return false;
    }

    // Check requirements
    if (!this.meetsRequirements(item)) {
      console.log('Requirements not met for:', itemId);
      return false;
    }

    // Unequip current item in slot
    const currentItem = this.equipment[equipSlot];
    if (currentItem) {
      this.addItem(currentItem.id, 1);
    }

    // Equip new item
    this.equipment[equipSlot] = item;
    this.removeItem(itemId, 1);
    
    // Apply stat bonuses
    this.applyEquipmentStats();
    
    console.log(`Equipped ${item.name}`);
    this.engine.saveSystem.saveGame();
    return true;
  }

  unequipItem(slot: EquipmentSlot): boolean {
    const item = this.equipment[slot];
    if (!item) return false;

    // Add back to inventory
    if (this.addItem(item.id, 1)) {
      this.equipment[slot] = null;
      this.applyEquipmentStats();
      console.log(`Unequipped ${item.name}`);
      this.engine.saveSystem.saveGame();
      return true;
    }
    
    return false;
  }

  private getEquipmentSlot(item: Item): EquipmentSlot | null {
    switch (item.type) {
      case 'weapon':
        return 'weapon';
      case 'armor':
        if (item.id.includes('helmet')) return 'helmet';
        if (item.id.includes('boots')) return 'boots';
        return 'armor';
      case 'accessory':
        return this.equipment.accessory1 ? 'accessory2' : 'accessory1';
      default:
        return null;
    }
  }

  private meetsRequirements(item: Item): boolean {
    if (!item.requirements) return true;
    
    const player = this.engine.player;
    const req = item.requirements;
    
    if (req.level && player.stats.level < req.level) return false;
    if (req.strength && player.stats.strength < req.strength) return false;
    if (req.intelligence && player.stats.intelligence < req.intelligence) return false;
    if (req.dexterity && player.stats.dexterity < req.dexterity) return false;
    
    return true;
  }

  private applyEquipmentStats(): void {
    // Reset to base stats and reapply equipment bonuses
    // This would integrate with the player's stat system
    console.log('Applied equipment stats');
  }

  private canStack(item: Item): boolean {
    return item.type === 'consumable' || item.type === 'material';
  }

  private getTotalWeight(): number {
    return this.inventory.reduce((total, slot) => {
      if (slot.item) {
        return total + (slot.item.weight * slot.quantity);
      }
      return total;
    }, 0);
  }

  // Getters
  getInventory(): InventorySlot[] {
    return [...this.inventory];
  }

  getEquipment(): Equipment {
    return { ...this.equipment };
  }

  getWeight(): { current: number; max: number } {
    return {
      current: this.getTotalWeight(),
      max: this.maxWeight
    };
  }

  hasItem(itemId: string, quantity: number = 1): boolean {
    const totalQuantity = this.inventory
      .filter(slot => slot.item && slot.item.id === itemId)
      .reduce((total, slot) => total + slot.quantity, 0);
    
    return totalQuantity >= quantity;
  }

  // Shop functionality
  buyItem(itemId: string, quantity: number = 1): boolean {
    const itemData = ITEMS[itemId];
    if (!itemData) return false;

    const totalCost = itemData.value * quantity;
    if (this.engine.gameSystem.spendGold(totalCost)) {
      return this.addItem(itemId, quantity);
    }
    
    return false;
  }

  sellItem(itemId: string, quantity: number = 1): boolean {
    if (this.hasItem(itemId, quantity)) {
      const itemData = ITEMS[itemId];
      const sellValue = Math.floor(itemData.value * 0.5 * quantity); // Sell for 50% of value
      
      if (this.removeItem(itemId, quantity)) {
        this.engine.gameSystem.addGold(sellValue);
        return true;
      }
    }
    
    return false;
  }
}
