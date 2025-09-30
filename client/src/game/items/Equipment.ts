import { Item, Equipment, EquipmentSlot, ItemStats } from '../../types/GameTypes';

export class EquipmentManager {
  private equipment: Equipment = {
    weapon: null,
    armor: null,
    helmet: null,
    boots: null,
    accessory1: null,
    accessory2: null
  };

  private equippedStats: ItemStats = {};

  constructor() {
    this.recalculateStats();
  }

  equipItem(item: Item, slot?: EquipmentSlot): boolean {
    const targetSlot = slot || this.getAppropriateSlot(item);
    
    if (!targetSlot) {
      console.log('Cannot determine equipment slot for item:', item.name);
      return false;
    }

    // Check if slot is valid for this item type
    if (!this.isValidSlotForItem(item, targetSlot)) {
      console.log(`Cannot equip ${item.name} in ${targetSlot} slot`);
      return false;
    }

    // Store previously equipped item (if any)
    const previousItem = this.equipment[targetSlot];

    // Equip the new item
    this.equipment[targetSlot] = item;
    
    // Recalculate stats
    this.recalculateStats();
    
    console.log(`Equipped ${item.name} in ${targetSlot} slot`);
    
    return true;
  }

  unequipItem(slot: EquipmentSlot): Item | null {
    const item = this.equipment[slot];
    
    if (!item) {
      return null;
    }

    this.equipment[slot] = null;
    this.recalculateStats();
    
    console.log(`Unequipped ${item.name} from ${slot} slot`);
    
    return item;
  }

  private getAppropriateSlot(item: Item): EquipmentSlot | null {
    switch (item.type) {
      case 'weapon':
        return 'weapon';
      
      case 'armor':
        // Determine armor slot based on item name/description
        if (item.id.includes('helmet') || item.id.includes('hat') || item.id.includes('hood')) {
          return 'helmet';
        }
        if (item.id.includes('boots') || item.id.includes('shoes')) {
          return 'boots';
        }
        return 'armor';
      
      case 'accessory':
        // Use first available accessory slot
        if (!this.equipment.accessory1) {
          return 'accessory1';
        }
        if (!this.equipment.accessory2) {
          return 'accessory2';
        }
        // If both slots occupied, replace accessory1
        return 'accessory1';
      
      default:
        return null;
    }
  }

  private isValidSlotForItem(item: Item, slot: EquipmentSlot): boolean {
    switch (slot) {
      case 'weapon':
        return item.type === 'weapon';
      
      case 'armor':
        return item.type === 'armor' && 
               !item.id.includes('helmet') && 
               !item.id.includes('hat') && 
               !item.id.includes('hood') &&
               !item.id.includes('boots') && 
               !item.id.includes('shoes');
      
      case 'helmet':
        return item.type === 'armor' && (
          item.id.includes('helmet') || 
          item.id.includes('hat') || 
          item.id.includes('hood')
        );
      
      case 'boots':
        return item.type === 'armor' && (
          item.id.includes('boots') || 
          item.id.includes('shoes')
        );
      
      case 'accessory1':
      case 'accessory2':
        return item.type === 'accessory';
      
      default:
        return false;
    }
  }

  private recalculateStats(): void {
    this.equippedStats = {};

    // Sum stats from all equipped items
    Object.values(this.equipment).forEach(item => {
      if (item && item.stats) {
        Object.entries(item.stats).forEach(([stat, value]) => {
          const statKey = stat as keyof ItemStats;
          if (typeof value === 'number') {
            this.equippedStats[statKey] = (this.equippedStats[statKey] || 0) + value;
          }
        });
      }
    });
  }

  getEquipment(): Equipment {
    return { ...this.equipment };
  }

  getEquippedStats(): ItemStats {
    return { ...this.equippedStats };
  }

  getItemInSlot(slot: EquipmentSlot): Item | null {
    return this.equipment[slot];
  }

  isSlotEmpty(slot: EquipmentSlot): boolean {
    return this.equipment[slot] === null;
  }

  getWeaponPower(): number {
    const weapon = this.equipment.weapon;
    if (!weapon || !weapon.stats) return 0;
    
    return (weapon.stats.spellPower || 0) + (weapon.stats.strength || 0);
  }

  getDefenseValue(): number {
    let totalDefense = 0;
    
    Object.values(this.equipment).forEach(item => {
      if (item && item.stats && item.stats.defense) {
        totalDefense += item.stats.defense;
      }
    });
    
    return totalDefense;
  }

  getSpellPowerBonus(): number {
    let totalSpellPower = 0;
    
    Object.values(this.equipment).forEach(item => {
      if (item && item.stats && item.stats.spellPower) {
        totalSpellPower += item.stats.spellPower;
      }
    });
    
    return totalSpellPower;
  }

  getManaBonus(): number {
    let totalMana = 0;
    
    Object.values(this.equipment).forEach(item => {
      if (item && item.stats && item.stats.mana) {
        totalMana += item.stats.mana;
      }
    });
    
    return totalMana;
  }

  getHealthBonus(): number {
    let totalHealth = 0;
    
    Object.values(this.equipment).forEach(item => {
      if (item && item.stats && item.stats.health) {
        totalHealth += item.stats.health;
      }
    });
    
    return totalHealth;
  }

  hasItemEquipped(itemId: string): boolean {
    return Object.values(this.equipment).some(item => item?.id === itemId);
  }

  getEquippedItemsByType(type: 'weapon' | 'armor' | 'accessory'): Item[] {
    return Object.values(this.equipment).filter(item => 
      item && item.type === type
    ) as Item[];
  }

  canEquip(item: Item, playerLevel: number, playerStats: { strength: number; intelligence: number; dexterity: number }): boolean {
    if (!item.requirements) return true;

    const req = item.requirements;

    if (req.level && playerLevel < req.level) {
      return false;
    }

    if (req.strength && playerStats.strength < req.strength) {
      return false;
    }

    if (req.intelligence && playerStats.intelligence < req.intelligence) {
      return false;
    }

    if (req.dexterity && playerStats.dexterity < req.dexterity) {
      return false;
    }

    return true;
  }

  getEquipmentEffects(): string[] {
    const effects: string[] = [];
    
    Object.values(this.equipment).forEach(item => {
      if (item && item.effects) {
        effects.push(...item.effects);
      }
    });
    
    return effects;
  }

  // Calculate total equipment value for selling/insurance purposes
  getTotalValue(): number {
    return Object.values(this.equipment)
      .filter(item => item !== null)
      .reduce((total, item) => total + (item!.value || 0), 0);
  }

  // Get equipment durability (if implemented)
  getEquipmentCondition(): Record<EquipmentSlot, number> {
    const condition: Partial<Record<EquipmentSlot, number>> = {};
    
    Object.entries(this.equipment).forEach(([slot, item]) => {
      if (item) {
        // For now, assume all equipment is at 100% condition
        // This could be extended to include durability system
        condition[slot as EquipmentSlot] = 100;
      }
    });
    
    return condition as Record<EquipmentSlot, number>;
  }

  // Repair equipment (if durability system implemented)
  repairEquipment(slot: EquipmentSlot): boolean {
    const item = this.equipment[slot];
    if (!item) return false;
    
    // Placeholder for repair logic
    console.log(`Repaired ${item.name}`);
    return true;
  }

  // Get set bonuses (if set items implemented)
  getSetBonuses(): { name: string; pieces: number; bonus: ItemStats }[] {
    // Placeholder for set bonus system
    return [];
  }
}
