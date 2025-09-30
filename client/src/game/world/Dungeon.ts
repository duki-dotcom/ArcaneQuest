import { BaseArea } from './Area';
import { Vector2 } from '../../types/GameTypes';

export class Dungeon extends BaseArea {
  private levels: DungeonLevel[] = [];
  private currentLevel = 0;
  private maxLevels = 5;

  constructor() {
    super(
      'dungeon',
      'Ancient Dungeon',
      'Deep beneath the castle lie ancient chambers filled with dark magic and dangerous creatures.',
      { x: 800, y: 600 }
    );
    this.safeZone = false;
  }

  initialize(): void {
    this.generateDungeonLevels();
    this.setCurrentLevel(0);
  }

  generateTerrain(): void {
    const width = Math.ceil(this.size.x / 32);
    const height = Math.ceil(this.size.y / 32);
    
    // Generate dark stone base
    this.tileMap = this.generateBaseTileMap(width, height, 6); // Dark stone
    
    // Add dungeon rooms and corridors
    this.generateRoomsAndCorridors();
    
    // Add some variation
    this.addVariation(this.tileMap, 2, 0.1); // 10% regular stone
  }

  private generateRoomsAndCorridors(): void {
    const rooms = this.generateRooms();
    this.connectRoomsWithCorridors(rooms);
  }

  private generateRooms(): Array<{x: number, y: number, width: number, height: number}> {
    const rooms = [];
    const width = this.tileMap[0].length;
    const height = this.tileMap.length;
    
    // Generate 4-6 rooms per level
    const numRooms = 4 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numRooms; i++) {
      const roomWidth = 3 + Math.floor(Math.random() * 4);
      const roomHeight = 3 + Math.floor(Math.random() * 4);
      const roomX = Math.floor(Math.random() * (width - roomWidth - 2)) + 1;
      const roomY = Math.floor(Math.random() * (height - roomHeight - 2)) + 1;
      
      rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });
      
      // Fill room with floor tiles
      for (let y = roomY; y < roomY + roomHeight; y++) {
        for (let x = roomX; x < roomX + roomWidth; x++) {
          this.tileMap[y][x] = 2; // Stone floor
        }
      }
    }
    
    return rooms;
  }

  private connectRoomsWithCorridors(rooms: Array<{x: number, y: number, width: number, height: number}>): void {
    for (let i = 0; i < rooms.length - 1; i++) {
      const room1 = rooms[i];
      const room2 = rooms[i + 1];
      
      const centerX1 = room1.x + Math.floor(room1.width / 2);
      const centerY1 = room1.y + Math.floor(room1.height / 2);
      const centerX2 = room2.x + Math.floor(room2.width / 2);
      const centerY2 = room2.y + Math.floor(room2.height / 2);
      
      // Create L-shaped corridor
      this.createCorridor(centerX1, centerY1, centerX2, centerY1);
      this.createCorridor(centerX2, centerY1, centerX2, centerY2);
    }
  }

  private createCorridor(x1: number, y1: number, x2: number, y2: number): void {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    
    for (let x = minX; x <= maxX; x++) {
      if (this.tileMap[y1] && this.tileMap[y1][x] !== undefined) {
        this.tileMap[y1][x] = 2; // Stone floor
      }
    }
    
    for (let y = minY; y <= maxY; y++) {
      if (this.tileMap[y] && this.tileMap[y][x2] !== undefined) {
        this.tileMap[y][x2] = 2; // Stone floor
      }
    }
  }

  populateFeatures(): void {
    const currentLevelData = this.levels[this.currentLevel];
    if (!currentLevelData) return;

    // Boss room (final room of dungeon)
    if (this.currentLevel === this.maxLevels - 1) {
      this.addFeature('altar', { x: 400, y: 150 }, { x: 60, y: 60 }, {
        type: 'dark_portal',
        name: 'Portal of Shadows',
        description: 'The source of the castle\'s corruption',
        boss: 'shadow_wraith',
        questComplete: 'castle_investigation'
      });
    }

    // Treasure chests
    this.addFeature('chest', { x: 150, y: 200 }, { x: 30, y: 20 }, {
      type: 'dungeon_chest',
      name: 'Ancient Chest',
      description: 'A chest from ages past',
      loot: currentLevelData.loot,
      locked: true
    });

    // Magic circles for spell learning
    this.addFeature('altar', { x: 600, y: 400 }, { x: 40, y: 40 }, {
      type: 'spell_circle',
      name: 'Arcane Circle',
      description: 'Ancient magic still flows through this circle',
      effect: 'learn_spell',
      spell: currentLevelData.spellReward
    });

    // Stairs to next level
    if (this.currentLevel < this.maxLevels - 1) {
      this.addFeature('portal', { x: 700, y: 500 }, { x: 40, y: 40 }, {
        type: 'stairs_down',
        name: 'Stairs Deeper',
        description: 'Stone steps leading further into darkness',
        nextLevel: this.currentLevel + 1
      });
    }

    // Stairs back up
    if (this.currentLevel > 0) {
      this.addFeature('portal', { x: 100, y: 100 }, { x: 40, y: 40 }, {
        type: 'stairs_up',
        name: 'Stairs Up',
        description: 'Stone steps leading back up',
        nextLevel: this.currentLevel - 1
      });
    } else {
      // Exit to castle
      this.addFeature('portal', { x: 100, y: 100 }, { x: 40, y: 40 }, {
        type: 'exit',
        name: 'Castle Exit',
        description: 'Steps leading back to the castle',
        target: 'castle'
      });
    }

    // Torture chambers and prison cells
    this.addFeature('building', { x: 300, y: 450 }, { x: 80, y: 60 }, {
      type: 'prison',
      name: 'Old Prison Cells',
      description: 'Dark cells that once held prisoners'
    });

    // Ancient library
    this.addFeature('building', { x: 500, y: 200 }, { x: 100, y: 80 }, {
      type: 'library',
      name: 'Forgotten Library',
      description: 'Books and scrolls covered in dust and shadow'
    });
  }

  private generateDungeonLevels(): void {
    this.levels = [
      {
        id: 0,
        name: 'Upper Chambers',
        enemies: ['skeleton', 'giant_spider'],
        loot: ['health_potion', 'mana_potion', 'crystal_shard'],
        spellReward: 'dispel',
        bossType: null
      },
      {
        id: 1,
        name: 'Guard Quarters',
        enemies: ['skeleton', 'skeleton_mage'],
        loot: ['greater_health_potion', 'mana_crystal', 'apprentice_wand'],
        spellReward: 'ice_shield',
        bossType: null
      },
      {
        id: 2,
        name: 'Ancient Armory',
        enemies: ['skeleton_mage', 'shadow_wraith'],
        loot: ['crystal_staff', 'mage_robes', 'ring_of_power'],
        spellReward: 'chain_lightning',
        bossType: null
      },
      {
        id: 3,
        name: 'Ritual Chambers',
        enemies: ['shadow_wraith', 'fire_elemental'],
        loot: ['staff_of_flames', 'robes_of_the_elements', 'grimoire_of_shadows'],
        spellReward: 'meteor',
        bossType: null
      },
      {
        id: 4,
        name: 'Heart of Darkness',
        enemies: ['shadow_wraith'],
        loot: ['archmage_rod', 'crystal_of_power', 'dragon_scale'],
        spellReward: 'time_stop',
        bossType: 'ancient_lich'
      }
    ];
  }

  private addEnemySpawns(): void {
    const currentLevelData = this.levels[this.currentLevel];
    if (!currentLevelData) return;

    const spawnPositions = [
      { x: 200, y: 300 },
      { x: 500, y: 350 },
      { x: 350, y: 500 },
      { x: 600, y: 200 },
      { x: 150, y: 450 }
    ];

    // Add regular enemy spawns
    currentLevelData.enemies.forEach((enemyType, index) => {
      if (spawnPositions[index]) {
        this.addSpawn(enemyType, spawnPositions[index], this.currentLevel + 3, 120);
      }
    });

    // Add boss spawn if this is the boss level
    if (currentLevelData.bossType) {
      this.addSpawn(currentLevelData.bossType, { x: 400, y: 200 }, this.currentLevel + 5, 0);
    }
  }

  private addExits(): void {
    // Exit to castle (from level 0 only)
    if (this.currentLevel === 0) {
      this.addExit('castle', { x: 80, y: 80 }, { x: 60, y: 60 });
    }
  }

  setCurrentLevel(level: number): void {
    if (level >= 0 && level < this.maxLevels) {
      this.currentLevel = level;
      
      // Clear existing features and spawns
      this.features = [];
      this.spawns = [];
      this.exits = [];
      
      // Regenerate for new level
      this.generateTerrain();
      this.populateFeatures();
      this.addEnemySpawns();
      this.addExits();
      
      console.log(`Entered dungeon level ${level}: ${this.levels[level].name}`);
    }
  }

  getCurrentLevel(): number {
    return this.currentLevel;
  }

  getMaxLevels(): number {
    return this.maxLevels;
  }

  getCurrentLevelData(): DungeonLevel | null {
    return this.levels[this.currentLevel] || null;
  }

  canDescend(): boolean {
    return this.currentLevel < this.maxLevels - 1;
  }

  canAscend(): boolean {
    return this.currentLevel > 0;
  }

  descend(): boolean {
    if (this.canDescend()) {
      this.setCurrentLevel(this.currentLevel + 1);
      return true;
    }
    return false;
  }

  ascend(): boolean {
    if (this.canAscend()) {
      this.setCurrentLevel(this.currentLevel - 1);
      return true;
    }
    return false;
  }
}

interface DungeonLevel {
  id: number;
  name: string;
  enemies: string[];
  loot: string[];
  spellReward: string;
  bossType: string | null;
}
