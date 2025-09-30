import { Quest, QuestObjective, QuestReward, QuestRequirement } from '../../types/GameTypes';
import { GameEngine } from '../GameEngine';

export class QuestSystem {
  private engine: GameEngine;
  private activeQuests: Map<string, Quest> = new Map();
  private completedQuests: Set<string> = new Set();
  private availableQuests: Map<string, Quest> = new Map();

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.initializeQuests();
  }

  private initializeQuests(): void {
    // Main storyline quests
    this.registerQuest(MAIN_QUESTS.castle_investigation);
    this.registerQuest(MAIN_QUESTS.dungeon_cleansing);
    this.registerQuest(MAIN_QUESTS.ancient_evil);
    
    // Side quests
    this.registerQuest(SIDE_QUESTS.goblin_problem);
    this.registerQuest(SIDE_QUESTS.lost_tome);
    this.registerQuest(SIDE_QUESTS.herb_collection);
    this.registerQuest(SIDE_QUESTS.master_enchanter);
  }

  private registerQuest(quest: Quest): void {
    if (this.isQuestAvailable(quest)) {
      this.availableQuests.set(quest.id, quest);
    }
  }

  private isQuestAvailable(quest: Quest): boolean {
    const player = this.engine.player;
    
    // Check if already completed or active
    if (this.completedQuests.has(quest.id) || this.activeQuests.has(quest.id)) {
      return false;
    }

    // Check requirements
    for (const requirement of quest.requirements) {
      if (!this.meetsRequirement(requirement)) {
        return false;
      }
    }

    return true;
  }

  private meetsRequirement(requirement: QuestRequirement): boolean {
    const player = this.engine.player;

    switch (requirement.type) {
      case 'level':
        return player.stats.level >= (requirement.value as number);
      
      case 'item':
        return this.engine.inventorySystem.hasItem(requirement.value as string, 1);
      
      case 'quest':
        return this.completedQuests.has(requirement.value as string);
      
      case 'stat':
        // Assuming format "strength:15" etc.
        const [stat, value] = (requirement.value as string).split(':');
        const statValue = player.stats[stat as keyof typeof player.stats] as number;
        return statValue >= parseInt(value);
      
      default:
        return true;
    }
  }

  acceptQuest(questId: string): boolean {
    const quest = this.availableQuests.get(questId);
    if (!quest) {
      console.log('Quest not available:', questId);
      return false;
    }

    // Move quest from available to active
    this.availableQuests.delete(questId);
    this.activeQuests.set(questId, { ...quest, status: 'active' });
    
    console.log(`Accepted quest: ${quest.title}`);
    return true;
  }

  updateQuestProgress(type: 'kill' | 'collect' | 'talk' | 'explore' | 'craft', target: string, amount: number = 1): void {
    for (const [questId, quest] of this.activeQuests) {
      for (const objective of quest.objectives) {
        if (objective.type === type && objective.target === target && !objective.completed) {
          objective.current = Math.min(objective.required, objective.current + amount);
          
          if (objective.current >= objective.required) {
            objective.completed = true;
            console.log(`Objective completed: ${objective.description}`);
          }
          
          // Check if quest is complete
          this.checkQuestCompletion(questId);
        }
      }
    }
  }

  private checkQuestCompletion(questId: string): void {
    const quest = this.activeQuests.get(questId);
    if (!quest) return;

    const allObjectivesComplete = quest.objectives.every(obj => obj.completed);
    
    if (allObjectivesComplete) {
      this.completeQuest(questId);
    }
  }

  private completeQuest(questId: string): void {
    const quest = this.activeQuests.get(questId);
    if (!quest) return;

    // Remove from active quests
    this.activeQuests.delete(questId);
    this.completedQuests.add(questId);

    // Give rewards
    this.giveQuestRewards(quest.rewards);

    console.log(`Quest completed: ${quest.title}`);

    // Check for newly available quests
    this.checkForNewQuests();
  }

  private giveQuestRewards(rewards: QuestReward[]): void {
    for (const reward of rewards) {
      switch (reward.type) {
        case 'experience':
          this.engine.gameSystem.giveExperience(reward.value as number);
          break;
        
        case 'gold':
          this.engine.gameSystem.addGold(reward.value as number);
          break;
        
        case 'item':
          this.engine.inventorySystem.addItem(
            reward.value as string, 
            reward.quantity || 1
          );
          break;
        
        case 'spell':
          // Learn new spell
          const spellData = this.getSpellData(reward.value as string);
          if (spellData) {
            this.engine.spellSystem.learnSpell(spellData);
          }
          break;
      }
    }
  }

  private getSpellData(spellId: string): any {
    // This would reference the spell data
    // For now, return null - would need to import spell data
    return null;
  }

  private checkForNewQuests(): void {
    // Re-evaluate all quests to see if any new ones are available
    Object.values(ALL_QUESTS).forEach(quest => {
      if (!this.availableQuests.has(quest.id) && 
          !this.activeQuests.has(quest.id) && 
          !this.completedQuests.has(quest.id) &&
          this.isQuestAvailable(quest)) {
        this.availableQuests.set(quest.id, quest);
        console.log(`New quest available: ${quest.title}`);
      }
    });
  }

  getActiveQuests(): Quest[] {
    return Array.from(this.activeQuests.values());
  }

  getAvailableQuests(): Quest[] {
    return Array.from(this.availableQuests.values());
  }

  getCompletedQuests(): string[] {
    return Array.from(this.completedQuests);
  }

  getQuest(questId: string): Quest | null {
    return this.activeQuests.get(questId) || 
           this.availableQuests.get(questId) || 
           null;
  }

  isQuestActive(questId: string): boolean {
    return this.activeQuests.has(questId);
  }

  isQuestCompleted(questId: string): boolean {
    return this.completedQuests.has(questId);
  }

  getQuestObjectiveProgress(questId: string, objectiveId: string): { current: number; required: number } | null {
    const quest = this.activeQuests.get(questId);
    if (!quest) return null;

    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective) return null;

    return { current: objective.current, required: objective.required };
  }

  // Debug method to force complete quest
  forceCompleteQuest(questId: string): void {
    const quest = this.activeQuests.get(questId);
    if (quest) {
      quest.objectives.forEach(obj => {
        obj.current = obj.required;
        obj.completed = true;
      });
      this.completeQuest(questId);
    }
  }
}

// Quest definitions
const MAIN_QUESTS = {
  castle_investigation: {
    id: 'castle_investigation',
    title: 'The Castle Mystery',
    description: 'The king has asked you to investigate the dark magic stirring beneath his castle.',
    type: 'main' as const,
    status: 'available' as const,
    requirements: [],
    rewards: [
      { type: 'experience' as const, value: 200 },
      { type: 'gold' as const, value: 150 },
      { type: 'item' as const, value: 'crystal_staff', quantity: 1 }
    ],
    objectives: [
      {
        id: 'enter_dungeon',
        description: 'Enter the castle dungeons',
        type: 'explore' as const,
        target: 'dungeon',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'explore_levels',
        description: 'Explore 3 dungeon levels',
        type: 'explore' as const,
        target: 'dungeon_level',
        current: 0,
        required: 3,
        completed: false
      },
      {
        id: 'defeat_boss',
        description: 'Defeat the source of corruption',
        type: 'kill' as const,
        target: 'ancient_lich',
        current: 0,
        required: 1,
        completed: false
      }
    ]
  },

  dungeon_cleansing: {
    id: 'dungeon_cleansing',
    title: 'Cleansing the Darkness',
    description: 'Purge the castle dungeons of all dark creatures.',
    type: 'main' as const,
    status: 'available' as const,
    requirements: [
      { type: 'quest' as const, value: 'castle_investigation' }
    ],
    rewards: [
      { type: 'experience' as const, value: 500 },
      { type: 'gold' as const, value: 300 },
      { type: 'spell' as const, value: 'holy_light' }
    ],
    objectives: [
      {
        id: 'clear_skeletons',
        description: 'Defeat 20 skeletons',
        type: 'kill' as const,
        target: 'skeleton',
        current: 0,
        required: 20,
        completed: false
      },
      {
        id: 'clear_wraiths',
        description: 'Defeat 5 shadow wraiths',
        type: 'kill' as const,
        target: 'shadow_wraith',
        current: 0,
        required: 5,
        completed: false
      }
    ]
  },

  ancient_evil: {
    id: 'ancient_evil',
    title: 'The Ancient Evil',
    description: 'Face the ultimate source of darkness threatening the realm.',
    type: 'main' as const,
    status: 'available' as const,
    requirements: [
      { type: 'quest' as const, value: 'dungeon_cleansing' },
      { type: 'level' as const, value: 20 }
    ],
    rewards: [
      { type: 'experience' as const, value: 1000 },
      { type: 'gold' as const, value: 1000 },
      { type: 'item' as const, value: 'archmage_rod', quantity: 1 }
    ],
    objectives: [
      {
        id: 'find_ancient_one',
        description: 'Locate the Ancient Evil',
        type: 'explore' as const,
        target: 'final_chamber',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'defeat_ancient_evil',
        description: 'Defeat the Ancient Evil',
        type: 'kill' as const,
        target: 'ancient_dragon',
        current: 0,
        required: 1,
        completed: false
      }
    ]
  }
};

const SIDE_QUESTS = {
  goblin_problem: {
    id: 'goblin_problem',
    title: 'The Goblin Problem',
    description: 'The village is being harassed by goblins. Clear them out!',
    type: 'side' as const,
    status: 'available' as const,
    requirements: [
      { type: 'level' as const, value: 3 }
    ],
    rewards: [
      { type: 'experience' as const, value: 100 },
      { type: 'gold' as const, value: 75 }
    ],
    objectives: [
      {
        id: 'kill_goblins',
        description: 'Defeat 10 goblins',
        type: 'kill' as const,
        target: 'goblin',
        current: 0,
        required: 10,
        completed: false
      }
    ]
  },

  lost_tome: {
    id: 'lost_tome',
    title: 'The Lost Tome',
    description: 'Recover a lost spellbook for the court wizard.',
    type: 'side' as const,
    status: 'available' as const,
    requirements: [
      { type: 'level' as const, value: 8 }
    ],
    rewards: [
      { type: 'experience' as const, value: 150 },
      { type: 'spell' as const, value: 'teleport' }
    ],
    objectives: [
      {
        id: 'find_tome',
        description: 'Find the lost tome in the wilderness',
        type: 'collect' as const,
        target: 'ancient_tome',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'return_tome',
        description: 'Return the tome to the wizard',
        type: 'talk' as const,
        target: 'court_wizard',
        current: 0,
        required: 1,
        completed: false
      }
    ]
  },

  herb_collection: {
    id: 'herb_collection',
    title: 'Herb Collection',
    description: 'Gather rare herbs for the village healer.',
    type: 'side' as const,
    status: 'available' as const,
    requirements: [],
    rewards: [
      { type: 'experience' as const, value: 50 },
      { type: 'item' as const, value: 'greater_health_potion', quantity: 3 }
    ],
    objectives: [
      {
        id: 'collect_herbs',
        description: 'Collect 5 healing herbs',
        type: 'collect' as const,
        target: 'healing_herb',
        current: 0,
        required: 5,
        completed: false
      }
    ]
  },

  master_enchanter: {
    id: 'master_enchanter',
    title: 'Path of the Master Enchanter',
    description: 'Learn the art of spell creation from the archmage.',
    type: 'side' as const,
    status: 'available' as const,
    requirements: [
      { type: 'level' as const, value: 10 },
      { type: 'stat' as const, value: 'intelligence:20' }
    ],
    rewards: [
      { type: 'experience' as const, value: 300 },
      { type: 'spell' as const, value: 'spell_creation_unlock' }
    ],
    objectives: [
      {
        id: 'learn_components',
        description: 'Learn about spell components',
        type: 'talk' as const,
        target: 'court_wizard',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'create_spell',
        description: 'Create your first custom spell',
        type: 'craft' as const,
        target: 'custom_spell',
        current: 0,
        required: 1,
        completed: false
      }
    ]
  }
};

const ALL_QUESTS = { ...MAIN_QUESTS, ...SIDE_QUESTS };

export { MAIN_QUESTS, SIDE_QUESTS, ALL_QUESTS };
