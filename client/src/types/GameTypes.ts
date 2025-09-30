export interface Vector2 {
  x: number;
  y: number;
}

export interface PlayerStats {
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  strength: number;
  intelligence: number;
  dexterity: number;
  availablePoints: number;
  gold: number;
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  school: SpellSchool;
  manaCost: number;
  cooldown: number;
  damage?: number;
  healing?: number;
  effects: SpellEffect[];
  components?: SpellComponent[];
  isCustom?: boolean;
}

export type SpellSchool = 'fire' | 'ice' | 'lightning' | 'healing' | 'buff' | 'debuff' | 'arcane';

export interface SpellEffect {
  type: 'damage' | 'healing' | 'buff' | 'debuff' | 'utility';
  value: number;
  duration?: number;
  target: 'self' | 'enemy' | 'ally' | 'area';
}

export interface SpellComponent {
  type: 'element' | 'shape' | 'power' | 'effect';
  value: string;
  modifier: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  value: number;
  weight: number;
  stats?: ItemStats;
  requirements?: ItemRequirements;
  effects?: string[];
}

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material' | 'quest';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EquipmentSlot = 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory1' | 'accessory2';

export interface ItemStats {
  strength?: number;
  intelligence?: number;
  dexterity?: number;
  health?: number;
  mana?: number;
  spellPower?: number;
  defense?: number;
}

export interface ItemRequirements {
  level?: number;
  strength?: number;
  intelligence?: number;
  dexterity?: number;
}

export interface InventorySlot {
  item: Item | null;
  quantity: number;
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  helmet: Item | null;
  boots: Item | null;
  accessory1: Item | null;
  accessory2: Item | null;
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  strength: number;
  intelligence: number;
  dexterity: number;
  experience: number;
  gold: number;
  loot: string[];
  spells: string[];
  aiType: 'aggressive' | 'defensive' | 'balanced';
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side';
  status: 'available' | 'active' | 'completed';
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  objectives: QuestObjective[];
}

export interface QuestRequirement {
  type: 'level' | 'item' | 'quest' | 'stat';
  value: string | number;
}

export interface QuestReward {
  type: 'experience' | 'gold' | 'item' | 'spell';
  value: string | number;
  quantity?: number;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'talk' | 'explore' | 'craft';
  target: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface GameSave {
  player: {
    stats: PlayerStats;
    position: Vector2;
    currentArea: string;
  };
  inventory: InventorySlot[];
  equipment: Equipment;
  spells: Spell[];
  quests: Quest[];
  worldState: Record<string, any>;
  timestamp: number;
}

export type GameState = 'menu' | 'playing' | 'paused' | 'inventory' | 'spellbook' | 'combat';
