import { BaseArea } from './Area';
import { Vector2 } from '../../types/GameTypes';

export class Castle extends BaseArea {
  constructor() {
    super(
      'castle',
      'Royal Castle',
      'The magnificent castle of King Aldwin, seat of power in the realm.',
      { x: 800, y: 600 }
    );
    this.safeZone = true;
  }

  initialize(): void {
    this.generateTerrain();
    this.populateFeatures();
    this.addNPCs();
    this.addExits();
  }

  generateTerrain(): void {
    const width = Math.ceil(this.size.x / 32);
    const height = Math.ceil(this.size.y / 32);
    
    // Generate stone base
    this.tileMap = this.generateBaseTileMap(width, height, 2); // Stone
    
    // Add marble floors in important areas
    this.addMarbleFloors();
    
    // Add some variation
    this.addVariation(this.tileMap, 6, 0.1); // 10% dark stone
  }

  private addMarbleFloors(): void {
    const width = this.tileMap[0].length;
    const height = this.tileMap.length;
    
    // Throne room area (center)
    const throneStartX = Math.floor(width * 0.3);
    const throneEndX = Math.floor(width * 0.7);
    const throneStartY = Math.floor(height * 0.2);
    const throneEndY = Math.floor(height * 0.6);
    
    for (let y = throneStartY; y < throneEndY; y++) {
      for (let x = throneStartX; x < throneEndX; x++) {
        this.tileMap[y][x] = 5; // Wood (representing marble)
      }
    }
  }

  populateFeatures(): void {
    // Throne room
    this.addFeature('building', { x: 300, y: 150 }, { x: 200, y: 200 }, {
      type: 'throne_room',
      name: 'Royal Throne Room',
      description: 'Where the king holds court'
    });

    // Wizard tower
    this.addFeature('building', { x: 550, y: 100 }, { x: 80, y: 120 }, {
      type: 'tower',
      name: 'Arcane Tower',
      description: 'The court wizard\'s domain'
    });

    // Royal chambers
    this.addFeature('building', { x: 150, y: 200 }, { x: 120, y: 100 }, {
      type: 'chambers',
      name: 'Royal Chambers',
      description: 'Private quarters of the royal family'
    });

    // Armory
    this.addFeature('building', { x: 500, y: 350 }, { x: 100, y: 80 }, {
      type: 'armory',
      name: 'Royal Armory',
      description: 'The finest weapons and armor'
    });

    // Castle altar
    this.addFeature('altar', { x: 400, y: 120 }, { x: 40, y: 40 }, {
      type: 'royal_altar',
      name: 'Altar of Light',
      description: 'A blessed shrine that restores health and mana',
      effect: 'full_heal'
    });

    // Entrance to dungeons
    this.addFeature('portal', { x: 400, y: 500 }, { x: 60, y: 40 }, {
      type: 'dungeon_entrance',
      name: 'Dungeon Entrance',
      description: 'Dark stairs leading to the castle dungeons',
      target: 'dungeon',
      requiresQuest: 'castle_investigation'
    });

    // Royal library
    this.addFeature('building', { x: 150, y: 350 }, { x: 100, y: 100 }, {
      type: 'library',
      name: 'Royal Library',
      description: 'Ancient knowledge and spell tomes'
    });
  }

  private addNPCs(): void {
    // King in throne room
    this.addNPC('king', { x: 400, y: 200 });
    
    // Court wizard in tower
    this.addNPC('court_wizard', { x: 590, y: 160 });
    
    // Guards
    this.addNPC('generic', { x: 350, y: 150 }); // Throne room guard
    this.addNPC('generic', { x: 450, y: 150 }); // Throne room guard
    this.addNPC('generic', { x: 400, y: 480 }); // Dungeon entrance guard
  }

  private addExits(): void {
    // Exit to village (west)
    this.addExit('village', { x: 0, y: 200 }, { x: 50, y: 150 });
    
    // Exit to dungeon (through portal, requires quest)
    this.addExit('dungeon', { x: 380, y: 530 }, { x: 40, y: 20 });
  }

  // Special method for quest-related dungeon access
  canAccessDungeon(playerQuests: string[]): boolean {
    return playerQuests.includes('castle_investigation');
  }
}
