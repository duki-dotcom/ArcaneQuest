import { Item } from '../../types/GameTypes';

export const ITEMS: Record<string, Item> = {
  // Consumables
  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Restores 50 health points',
    type: 'consumable',
    rarity: 'common',
    value: 25,
    weight: 0.5,
    effects: ['heal_50']
  },

  mana_potion: {
    id: 'mana_potion',
    name: 'Mana Potion',
    description: 'Restores 30 mana points',
    type: 'consumable',
    rarity: 'common',
    value: 30,
    weight: 0.5,
    effects: ['mana_30']
  },

  greater_health_potion: {
    id: 'greater_health_potion',
    name: 'Greater Health Potion',
    description: 'Restores 100 health points',
    type: 'consumable',
    rarity: 'uncommon',
    value: 75,
    weight: 0.5,
    effects: ['heal_100']
  },

  elixir_of_strength: {
    id: 'elixir_of_strength',
    name: 'Elixir of Strength',
    description: 'Temporarily increases strength by 5',
    type: 'consumable',
    rarity: 'rare',
    value: 150,
    weight: 0.3,
    effects: ['temp_strength_5']
  },

  // Weapons - Staffs
  wooden_staff: {
    id: 'wooden_staff',
    name: 'Wooden Staff',
    description: 'A simple wooden staff for novice mages',
    type: 'weapon',
    rarity: 'common',
    value: 50,
    weight: 2,
    stats: {
      intelligence: 2,
      spellPower: 5
    },
    requirements: {
      level: 1,
      intelligence: 5
    }
  },

  apprentice_wand: {
    id: 'apprentice_wand',
    name: 'Apprentice Wand',
    description: 'A basic wand with minor enchantments',
    type: 'weapon',
    rarity: 'common',
    value: 100,
    weight: 1,
    stats: {
      intelligence: 3,
      spellPower: 8,
      mana: 10
    },
    requirements: {
      level: 3,
      intelligence: 8
    }
  },

  crystal_staff: {
    id: 'crystal_staff',
    name: 'Crystal Staff',
    description: 'A staff topped with a focusing crystal',
    type: 'weapon',
    rarity: 'uncommon',
    value: 300,
    weight: 3,
    stats: {
      intelligence: 5,
      spellPower: 15,
      mana: 20
    },
    requirements: {
      level: 8,
      intelligence: 15
    }
  },

  staff_of_flames: {
    id: 'staff_of_flames',
    name: 'Staff of Flames',
    description: 'A staff imbued with fire magic',
    type: 'weapon',
    rarity: 'rare',
    value: 750,
    weight: 4,
    stats: {
      intelligence: 8,
      spellPower: 25,
      mana: 15
    },
    requirements: {
      level: 15,
      intelligence: 20
    },
    effects: ['fire_damage_bonus']
  },

  archmage_rod: {
    id: 'archmage_rod',
    name: 'Archmage Rod',
    description: 'A legendary weapon of great magical power',
    type: 'weapon',
    rarity: 'legendary',
    value: 2000,
    weight: 2,
    stats: {
      intelligence: 15,
      spellPower: 40,
      mana: 50
    },
    requirements: {
      level: 25,
      intelligence: 30
    },
    effects: ['spell_cooldown_reduction']
  },

  // Armor
  cloth_robe: {
    id: 'cloth_robe',
    name: 'Cloth Robe',
    description: 'Simple robes for beginning mages',
    type: 'armor',
    rarity: 'common',
    value: 40,
    weight: 1,
    stats: {
      intelligence: 1,
      mana: 5,
      defense: 2
    }
  },

  apprentice_robes: {
    id: 'apprentice_robes',
    name: 'Apprentice Robes',
    description: 'Robes worn by magic apprentices',
    type: 'armor',
    rarity: 'common',
    value: 120,
    weight: 2,
    stats: {
      intelligence: 3,
      mana: 15,
      defense: 5
    },
    requirements: {
      level: 5
    }
  },

  mage_robes: {
    id: 'mage_robes',
    name: 'Mage Robes',
    description: 'Enchanted robes that enhance magical abilities',
    type: 'armor',
    rarity: 'uncommon',
    value: 400,
    weight: 3,
    stats: {
      intelligence: 6,
      mana: 30,
      defense: 8,
      spellPower: 10
    },
    requirements: {
      level: 12,
      intelligence: 15
    }
  },

  robes_of_the_elements: {
    id: 'robes_of_the_elements',
    name: 'Robes of the Elements',
    description: 'Robes infused with elemental magic',
    type: 'armor',
    rarity: 'rare',
    value: 1000,
    weight: 4,
    stats: {
      intelligence: 10,
      mana: 50,
      defense: 12,
      spellPower: 20
    },
    requirements: {
      level: 20,
      intelligence: 25
    },
    effects: ['elemental_resistance']
  },

  // Helmets
  cloth_hood: {
    id: 'cloth_hood',
    name: 'Cloth Hood',
    description: 'A simple hood that provides basic protection',
    type: 'armor',
    rarity: 'common',
    value: 25,
    weight: 0.5,
    stats: {
      defense: 1,
      mana: 5
    }
  },

  wizards_hat: {
    id: 'wizards_hat',
    name: "Wizard's Hat",
    description: 'A pointed hat that increases magical focus',
    type: 'armor',
    rarity: 'uncommon',
    value: 200,
    weight: 0.8,
    stats: {
      intelligence: 4,
      mana: 20,
      defense: 3,
      spellPower: 8
    },
    requirements: {
      level: 10,
      intelligence: 12
    }
  },

  // Boots
  cloth_shoes: {
    id: 'cloth_shoes',
    name: 'Cloth Shoes',
    description: 'Soft shoes suitable for mages',
    type: 'armor',
    rarity: 'common',
    value: 30,
    weight: 1,
    stats: {
      defense: 1,
      dexterity: 1
    }
  },

  boots_of_swiftness: {
    id: 'boots_of_swiftness',
    name: 'Boots of Swiftness',
    description: 'Enchanted boots that increase movement speed',
    type: 'armor',
    rarity: 'uncommon',
    value: 250,
    weight: 1.5,
    stats: {
      dexterity: 5,
      defense: 4
    },
    requirements: {
      level: 8
    },
    effects: ['movement_speed_bonus']
  },

  // Accessories
  ring_of_power: {
    id: 'ring_of_power',
    name: 'Ring of Power',
    description: 'A ring that enhances magical abilities',
    type: 'accessory',
    rarity: 'rare',
    value: 500,
    weight: 0.1,
    stats: {
      intelligence: 5,
      spellPower: 15,
      mana: 25
    },
    requirements: {
      level: 15,
      intelligence: 18
    }
  },

  amulet_of_health: {
    id: 'amulet_of_health',
    name: 'Amulet of Health',
    description: 'An amulet that increases vitality',
    type: 'accessory',
    rarity: 'uncommon',
    value: 300,
    weight: 0.2,
    stats: {
      health: 40,
      defense: 5
    },
    requirements: {
      level: 10
    }
  },

  crystal_pendant: {
    id: 'crystal_pendant',
    name: 'Crystal Pendant',
    description: 'A pendant with a mana-storing crystal',
    type: 'accessory',
    rarity: 'rare',
    value: 600,
    weight: 0.3,
    stats: {
      mana: 60,
      spellPower: 12,
      intelligence: 3
    },
    requirements: {
      level: 18,
      intelligence: 20
    }
  },

  // Grimoires
  basic_spellbook: {
    id: 'basic_spellbook',
    name: 'Basic Spellbook',
    description: 'Contains fundamental magical knowledge',
    type: 'material',
    rarity: 'common',
    value: 100,
    weight: 1,
    effects: ['unlock_basic_spells']
  },

  tome_of_fire: {
    id: 'tome_of_fire',
    name: 'Tome of Fire',
    description: 'Ancient knowledge of fire magic',
    type: 'material',
    rarity: 'uncommon',
    value: 400,
    weight: 2,
    effects: ['unlock_fire_spells']
  },

  grimoire_of_shadows: {
    id: 'grimoire_of_shadows',
    name: 'Grimoire of Shadows',
    description: 'Dark magic contained within forbidden pages',
    type: 'material',
    rarity: 'epic',
    value: 1500,
    weight: 3,
    effects: ['unlock_shadow_spells'],
    requirements: {
      level: 20,
      intelligence: 25
    }
  },

  // Materials
  crystal_shard: {
    id: 'crystal_shard',
    name: 'Crystal Shard',
    description: 'A fragment of magical crystal',
    type: 'material',
    rarity: 'common',
    value: 15,
    weight: 0.2
  },

  mana_crystal: {
    id: 'mana_crystal',
    name: 'Mana Crystal',
    description: 'A crystal infused with pure mana',
    type: 'material',
    rarity: 'uncommon',
    value: 50,
    weight: 0.5
  },

  dragon_scale: {
    id: 'dragon_scale',
    name: 'Dragon Scale',
    description: 'A scale from an ancient dragon',
    type: 'material',
    rarity: 'legendary',
    value: 1000,
    weight: 0.3
  }
};
