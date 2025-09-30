import { Spell } from '../../types/GameTypes';

export const PRESET_SPELLS: Record<string, Spell> = {
  // Fire School
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    description: 'Launches a blazing orb that explodes on impact',
    school: 'fire',
    manaCost: 15,
    cooldown: 2.0,
    damage: 40,
    effects: [
      { type: 'damage', value: 40, target: 'enemy' }
    ]
  },

  flameStrike: {
    id: 'flame_strike',
    name: 'Flame Strike',
    description: 'Calls down a pillar of fire',
    school: 'fire',
    manaCost: 25,
    cooldown: 4.0,
    damage: 60,
    effects: [
      { type: 'damage', value: 60, target: 'area' }
    ]
  },

  infernoBlast: {
    id: 'inferno_blast',
    name: 'Inferno Blast',
    description: 'Devastating area fire spell',
    school: 'fire',
    manaCost: 40,
    cooldown: 8.0,
    damage: 100,
    effects: [
      { type: 'damage', value: 100, target: 'area' }
    ]
  },

  // Ice School
  frostBolt: {
    id: 'frost_bolt',
    name: 'Frost Bolt',
    description: 'Shoots a shard of ice that slows enemies',
    school: 'ice',
    manaCost: 12,
    cooldown: 1.5,
    damage: 30,
    effects: [
      { type: 'damage', value: 30, target: 'enemy' },
      { type: 'debuff', value: 25, duration: 3, target: 'enemy' }
    ]
  },

  iceShield: {
    id: 'ice_shield',
    name: 'Ice Shield',
    description: 'Creates a protective barrier of ice',
    school: 'ice',
    manaCost: 20,
    cooldown: 10.0,
    effects: [
      { type: 'buff', value: 50, duration: 30, target: 'self' }
    ]
  },

  blizzard: {
    id: 'blizzard',
    name: 'Blizzard',
    description: 'Summons a devastating ice storm',
    school: 'ice',
    manaCost: 50,
    cooldown: 15.0,
    damage: 80,
    effects: [
      { type: 'damage', value: 80, target: 'area' },
      { type: 'debuff', value: 50, duration: 5, target: 'area' }
    ]
  },

  // Lightning School
  lightning: {
    id: 'lightning',
    name: 'Lightning Bolt',
    description: 'Strikes with the power of thunder',
    school: 'lightning',
    manaCost: 18,
    cooldown: 2.5,
    damage: 50,
    effects: [
      { type: 'damage', value: 50, target: 'enemy' }
    ]
  },

  chainLightning: {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    description: 'Lightning that jumps between enemies',
    school: 'lightning',
    manaCost: 30,
    cooldown: 5.0,
    damage: 35,
    effects: [
      { type: 'damage', value: 35, target: 'area' }
    ]
  },

  thunderStorm: {
    id: 'thunder_storm',
    name: 'Thunder Storm',
    description: 'Calls down multiple lightning strikes',
    school: 'lightning',
    manaCost: 45,
    cooldown: 12.0,
    damage: 90,
    effects: [
      { type: 'damage', value: 90, target: 'area' }
    ]
  },

  // Healing School
  heal: {
    id: 'heal',
    name: 'Heal',
    description: 'Restores health with divine energy',
    school: 'healing',
    manaCost: 10,
    cooldown: 1.0,
    healing: 40,
    effects: [
      { type: 'healing', value: 40, target: 'self' }
    ]
  },

  greaterHeal: {
    id: 'greater_heal',
    name: 'Greater Heal',
    description: 'Powerful healing magic',
    school: 'healing',
    manaCost: 25,
    cooldown: 3.0,
    healing: 80,
    effects: [
      { type: 'healing', value: 80, target: 'self' }
    ]
  },

  regeneration: {
    id: 'regeneration',
    name: 'Regeneration',
    description: 'Gradually restores health over time',
    school: 'healing',
    manaCost: 20,
    cooldown: 8.0,
    effects: [
      { type: 'buff', value: 10, duration: 15, target: 'self' }
    ]
  },

  // Buff School
  shield: {
    id: 'shield',
    name: 'Magic Shield',
    description: 'Creates a protective magical barrier',
    school: 'buff',
    manaCost: 15,
    cooldown: 5.0,
    effects: [
      { type: 'buff', value: 30, duration: 20, target: 'self' }
    ]
  },

  strength: {
    id: 'strength',
    name: 'Strength',
    description: 'Enhances physical power',
    school: 'buff',
    manaCost: 20,
    cooldown: 10.0,
    effects: [
      { type: 'buff', value: 20, duration: 60, target: 'self' }
    ]
  },

  haste: {
    id: 'haste',
    name: 'Haste',
    description: 'Increases movement and attack speed',
    school: 'buff',
    manaCost: 25,
    cooldown: 15.0,
    effects: [
      { type: 'buff', value: 30, duration: 45, target: 'self' }
    ]
  },

  // Debuff School
  slow: {
    id: 'slow',
    name: 'Slow',
    description: 'Reduces enemy movement speed',
    school: 'debuff',
    manaCost: 12,
    cooldown: 3.0,
    effects: [
      { type: 'debuff', value: 40, duration: 10, target: 'enemy' }
    ]
  },

  weakness: {
    id: 'weakness',
    name: 'Weakness',
    description: 'Reduces enemy damage',
    school: 'debuff',
    manaCost: 18,
    cooldown: 6.0,
    effects: [
      { type: 'debuff', value: 30, duration: 15, target: 'enemy' }
    ]
  },

  curse: {
    id: 'curse',
    name: 'Curse',
    description: 'Inflicts multiple debuffs on target',
    school: 'debuff',
    manaCost: 35,
    cooldown: 10.0,
    effects: [
      { type: 'debuff', value: 25, duration: 20, target: 'enemy' },
      { type: 'damage', value: 20, target: 'enemy' }
    ]
  },

  // Arcane School
  magicMissile: {
    id: 'magic_missile',
    name: 'Magic Missile',
    description: 'Unerring bolts of magical force',
    school: 'arcane',
    manaCost: 8,
    cooldown: 1.0,
    damage: 25,
    effects: [
      { type: 'damage', value: 25, target: 'enemy' }
    ]
  },

  dispel: {
    id: 'dispel',
    name: 'Dispel Magic',
    description: 'Removes magical effects',
    school: 'arcane',
    manaCost: 15,
    cooldown: 4.0,
    effects: [
      { type: 'utility', value: 1, target: 'enemy' }
    ]
  },

  teleport: {
    id: 'teleport',
    name: 'Teleport',
    description: 'Instantly moves to target location',
    school: 'arcane',
    manaCost: 30,
    cooldown: 8.0,
    effects: [
      { type: 'utility', value: 1, target: 'self' }
    ]
  }
};

// Spell components for custom spell creation
export const SPELL_COMPONENTS = {
  elements: [
    { type: 'element' as const, value: 'fire', modifier: 2 },
    { type: 'element' as const, value: 'ice', modifier: 1.5 },
    { type: 'element' as const, value: 'lightning', modifier: 2.5 },
    { type: 'element' as const, value: 'earth', modifier: 1.8 },
    { type: 'element' as const, value: 'air', modifier: 1.3 },
    { type: 'element' as const, value: 'arcane', modifier: 3 }
  ],
  shapes: [
    { type: 'shape' as const, value: 'bolt', modifier: 1 },
    { type: 'shape' as const, value: 'orb', modifier: 1.2 },
    { type: 'shape' as const, value: 'cone', modifier: 1.5 },
    { type: 'shape' as const, value: 'aura', modifier: 2 },
    { type: 'shape' as const, value: 'beam', modifier: 1.8 }
  ],
  powers: [
    { type: 'power' as const, value: 'minor', modifier: 0.5 },
    { type: 'power' as const, value: 'normal', modifier: 1 },
    { type: 'power' as const, value: 'major', modifier: 1.5 },
    { type: 'power' as const, value: 'greater', modifier: 2 },
    { type: 'power' as const, value: 'supreme', modifier: 3 }
  ],
  effects: [
    { type: 'effect' as const, value: 'damage', modifier: 1 },
    { type: 'effect' as const, value: 'healing', modifier: 1.2 },
    { type: 'effect' as const, value: 'buff', modifier: 1.5 },
    { type: 'effect' as const, value: 'debuff', modifier: 1.3 },
    { type: 'effect' as const, value: 'utility', modifier: 2 }
  ]
};
