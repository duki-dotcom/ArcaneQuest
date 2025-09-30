import { Entity } from './Entity';
import { Vector2 } from '../../types/GameTypes';
import { RenderSystem } from '../systems/RenderSystem';

export interface NPCData {
  id: string;
  name: string;
  type: 'shopkeeper' | 'blacksmith' | 'innkeeper' | 'king' | 'court_wizard' | 'quest_giver';
  dialogue: DialogueNode[];
  shop?: ShopData;
  quests?: string[];
}

export interface DialogueNode {
  id: string;
  text: string;
  responses?: DialogueResponse[];
  actions?: DialogueAction[];
}

export interface DialogueResponse {
  text: string;
  nextNodeId?: string;
  requirements?: DialogueRequirement[];
}

export interface DialogueAction {
  type: 'give_item' | 'take_item' | 'give_quest' | 'complete_quest' | 'learn_spell' | 'heal';
  value: string | number;
  quantity?: number;
}

export interface DialogueRequirement {
  type: 'item' | 'level' | 'quest' | 'gold';
  value: string | number;
  quantity?: number;
}

export interface ShopData {
  items: string[];
  buyMultiplier: number;
  sellMultiplier: number;
}

export class NPC extends Entity {
  public data: NPCData;
  public currentDialogue: string | null = null;
  public interactionRange = 60;

  constructor(position: Vector2, data: NPCData) {
    super(position);
    this.data = data;
  }

  static create(type: string, position: Vector2): NPC {
    const npcData = NPC_TYPES[type] || NPC_TYPES.generic;
    return new NPC(position, { ...npcData });
  }

  update(deltaTime: number): void {
    // NPCs are mostly stationary, but could have basic AI here
  }

  render(renderSystem: RenderSystem): void {
    // Draw NPC as a colored rectangle
    const color = this.getColorByType();
    renderSystem.drawRect(
      this.position.x - this.size.x / 2,
      this.position.y - this.size.y / 2,
      this.size.x,
      this.size.y,
      color
    );

    // Draw name above NPC
    renderSystem.drawText(
      this.data.name,
      this.position.x,
      this.position.y - this.size.y / 2 - 10,
      '#ffffff',
      12,
      'center'
    );

    // Draw interaction indicator if in range
    // This would be handled by the game engine based on player distance
  }

  private getColorByType(): string {
    const colors: Record<string, string> = {
      shopkeeper: '#9b59b6',
      blacksmith: '#e67e22',
      innkeeper: '#3498db',
      king: '#f1c40f',
      court_wizard: '#8e44ad',
      quest_giver: '#27ae60'
    };
    
    return colors[this.data.type] || '#95a5a6';
  }

  canInteract(playerPosition: Vector2): boolean {
    const dx = this.position.x - playerPosition.x;
    const dy = this.position.y - playerPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.interactionRange;
  }

  getDialogue(nodeId?: string): DialogueNode | null {
    if (!nodeId) {
      return this.data.dialogue[0] || null;
    }
    
    return this.data.dialogue.find(node => node.id === nodeId) || null;
  }
}

// NPC type definitions
const NPC_TYPES: Record<string, NPCData> = {
  shopkeeper: {
    id: 'shopkeeper',
    name: 'Merchant Aldric',
    type: 'shopkeeper',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome to my shop! I have the finest goods in the realm.',
        responses: [
          { text: 'I\'d like to browse your wares.', nextNodeId: 'shop' },
          { text: 'Tell me about the area.', nextNodeId: 'info' },
          { text: 'Farewell.', nextNodeId: 'goodbye' }
        ]
      },
      {
        id: 'shop',
        text: 'Take a look at what I have to offer!',
        actions: [{ type: 'give_item', value: 'open_shop' }]
      },
      {
        id: 'info',
        text: 'This village has been peaceful for years, but strange things happen in the wilderness lately.',
        responses: [
          { text: 'What kind of strange things?', nextNodeId: 'warning' },
          { text: 'I see. I\'d like to shop.', nextNodeId: 'shop' },
          { text: 'Thank you for the information.', nextNodeId: 'goodbye' }
        ]
      },
      {
        id: 'warning',
        text: 'Monsters have been seen more frequently. The old paths are no longer safe. Be careful out there!',
        responses: [
          { text: 'I\'ll be careful. Let me see your goods.', nextNodeId: 'shop' },
          { text: 'Thanks for the warning.', nextNodeId: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Safe travels, adventurer!'
      }
    ],
    shop: {
      items: ['health_potion', 'mana_potion', 'apprentice_wand', 'cloth_robe', 'basic_spellbook'],
      buyMultiplier: 1.0,
      sellMultiplier: 0.5
    }
  },

  blacksmith: {
    id: 'blacksmith',
    name: 'Master Thane',
    type: 'blacksmith',
    dialogue: [
      {
        id: 'greeting',
        text: 'Greetings! I craft the finest weapons and armor. What brings you to my forge?',
        responses: [
          { text: 'I need equipment.', nextNodeId: 'shop' },
          { text: 'Can you repair my gear?', nextNodeId: 'repair' },
          { text: 'Just looking around.', nextNodeId: 'goodbye' }
        ]
      },
      {
        id: 'shop',
        text: 'My forge burns day and night! Here\'s what I have ready.',
        actions: [{ type: 'give_item', value: 'open_shop' }]
      },
      {
        id: 'repair',
        text: 'Repairs cost 50 gold per item. Your gear looks fine to me though!',
        responses: [
          { text: 'Let me see your weapons then.', nextNodeId: 'shop' },
          { text: 'Maybe later.', nextNodeId: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'May your blade stay sharp!'
      }
    ],
    shop: {
      items: ['crystal_staff', 'apprentice_robes', 'mage_robes', 'wizards_hat', 'boots_of_swiftness'],
      buyMultiplier: 1.2,
      sellMultiplier: 0.6
    }
  },

  innkeeper: {
    id: 'innkeeper',
    name: 'Marta Goodheart',
    type: 'innkeeper',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome to the Prancing Pony! Rest and good food await weary travelers.',
        responses: [
          { text: 'I need to rest and recover.', nextNodeId: 'rest' },
          { text: 'Any news from other travelers?', nextNodeId: 'news' },
          { text: 'Just passing through.', nextNodeId: 'goodbye' }
        ]
      },
      {
        id: 'rest',
        text: 'A good rest will restore your health and mana! It costs 20 gold.',
        responses: [
          { 
            text: 'I\'ll take it.', 
            nextNodeId: 'rested',
            requirements: [{ type: 'gold', value: 20 }]
          },
          { text: 'Too expensive for me.', nextNodeId: 'goodbye' }
        ]
      },
      {
        id: 'rested',
        text: 'There you go! You look much better now.',
        actions: [
          { type: 'take_item', value: 'gold', quantity: 20 },
          { type: 'heal', value: 'full' }
        ]
      },
      {
        id: 'news',
        text: 'A wizard passed through yesterday, muttering about ancient powers stirring in the castle dungeons.',
        responses: [
          { text: 'Tell me more about the castle.', nextNodeId: 'castle_info' },
          { text: 'Interesting. I\'d like to rest.', nextNodeId: 'rest' },
          { text: 'Thank you for the information.', nextNodeId: 'goodbye' }
        ]
      },
      {
        id: 'castle_info',
        text: 'The king has been troubled lately. Something about old magic awakening beneath the castle.',
        responses: [
          { text: 'I should investigate this.', nextNodeId: 'goodbye' },
          { text: 'Sounds dangerous. I\'ll rest first.', nextNodeId: 'rest' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Safe travels, and remember - there\'s always a warm bed here when you need it!'
      }
    ]
  },

  king: {
    id: 'king',
    name: 'King Aldwin',
    type: 'king',
    dialogue: [
      {
        id: 'greeting',
        text: 'Ah, a brave adventurer! My kingdom faces a great threat. Will you aid us?',
        responses: [
          { text: 'I am at your service, Your Majesty.', nextNodeId: 'quest' },
          { text: 'What kind of threat?', nextNodeId: 'threat' },
          { text: 'I need to prepare first.', nextNodeId: 'goodbye' }
        ]
      },
      {
        id: 'threat',
        text: 'Ancient magic stirs beneath my castle. Dark creatures emerge from the dungeons below.',
        responses: [
          { text: 'I\'ll investigate the dungeons.', nextNodeId: 'quest' },
          { text: 'How can I help?', nextNodeId: 'quest' },
          { text: 'This sounds too dangerous.', nextNodeId: 'goodbye' }
        ]
      },
      {
        id: 'quest',
        text: 'Venture into the castle dungeons and discover the source of this dark magic. The realm depends on you!',
        actions: [{ type: 'give_quest', value: 'castle_investigation' }],
        responses: [
          { text: 'I accept this quest.', nextNodeId: 'accepted' },
          { text: 'I need more time to think.', nextNodeId: 'goodbye' }
        ]
      },
      {
        id: 'accepted',
        text: 'Excellent! Take this as a token of my trust. May it serve you well.',
        actions: [
          { type: 'give_item', value: 'royal_seal', quantity: 1 },
          { type: 'give_item', value: 'greater_health_potion', quantity: 3 }
        ]
      },
      {
        id: 'goodbye',
        text: 'Think carefully, brave one. The kingdom\'s fate may rest in your hands.'
      }
    ],
    quests: ['castle_investigation']
  },

  court_wizard: {
    id: 'court_wizard',
    name: 'Archmage Elara',
    type: 'court_wizard',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome, young mage. I sense magical potential within you.',
        responses: [
          { text: 'Can you teach me spells?', nextNodeId: 'spells' },
          { text: 'Tell me about the castle\'s magic.', nextNodeId: 'castle_magic' },
          { text: 'I seek knowledge of spell creation.', nextNodeId: 'spell_creation' }
        ]
      },
      {
        id: 'spells',
        text: 'Indeed! I have some advanced spells that might interest you.',
        actions: [{ type: 'give_item', value: 'open_spell_shop' }]
      },
      {
        id: 'castle_magic',
        text: 'The castle was built on ancient ley lines. Powerful magic flows beneath our feet, but something corrupts it.',
        responses: [
          { text: 'How can this corruption be stopped?', nextNodeId: 'corruption' },
          { text: 'Can you teach me to counter it?', nextNodeId: 'spells' }
        ]
      },
      {
        id: 'corruption',
        text: 'The source lies deep in the dungeons. Only by facing it directly can the corruption be cleansed.',
        responses: [
          { text: 'I\'ll need powerful spells for that.', nextNodeId: 'spells' },
          { text: 'Thank you for the knowledge.', nextNodeId: 'goodbye' }
        ]
      },
      {
        id: 'spell_creation',
        text: 'Ah, the art of weaving new magic! It requires great skill and understanding.',
        responses: [
          {
            text: 'I\'m ready to learn.',
            nextNodeId: 'teach_creation',
            requirements: [{ type: 'level', value: 10 }]
          },
          { text: 'I need more experience first.', nextNodeId: 'goodbye' }
        ]
      },
      {
        id: 'teach_creation',
        text: 'Very well! I shall unlock the secrets of spell creation for you.',
        actions: [
          { type: 'learn_spell', value: 'spell_creation_unlock' },
          { type: 'give_item', value: 'tome_of_creation', quantity: 1 }
        ]
      },
      {
        id: 'goodbye',
        text: 'May the arcane arts guide your path, young mage.'
      }
    ]
  },

  generic: {
    id: 'generic',
    name: 'Villager',
    type: 'quest_giver',
    dialogue: [
      {
        id: 'greeting',
        text: 'Greetings, traveler. May the roads be safe for you.',
        responses: [
          { text: 'Thank you.', nextNodeId: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Farewell!'
      }
    ]
  }
};

export { NPC_TYPES };
