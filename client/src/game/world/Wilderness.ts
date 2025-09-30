import { BaseArea } from './Area';
import { Vector2 } from '../../types/GameTypes';

export class Wilderness extends BaseArea {
  constructor() {
    super(
      'wilderness',
      'Dark Wilderness',
      'A dangerous region filled with monsters and ancient secrets.',
      { x: 1200, y: 900 }
    );
    this.safeZone = false;
  }

  initialize(): void {
    this.generateTerrain();
    this.populateFeatures();
    this.addEnemySpawns();
    this.addExits();
  }

  generateTerrain(): void {
    const width = Math.ceil(this.size.x / 32);
    const height = Math.ceil(this.size.y / 32);
    
    // Generate mixed terrain
    this.tileMap = this.generateBaseTileMap(width, height, 0); // Grass base
    
    // Add forest areas
    this.addForestPatch(0.2, 0.1, 0.3, 0.4); // Northwest forest
    this.addForestPatch(0.6, 0.5, 0.35, 0.4); // Southeast forest
    
    // Add water features
    this.addWaterFeatures();
    
    // Add some dirt and sand patches
    this.addVariation(this.tileMap, 1, 0.15); // 15% dirt
    this.addVariation(this.tileMap, 4, 0.05); // 5% sand
  }

  private addForestPatch(startX: number, startY: number, width: number, height: number): void {
    const mapWidth = this.tileMap[0].length;
    const mapHeight = this.tileMap.length;
    
    const forestStartX = Math.floor(mapWidth * startX);
    const forestEndX = Math.floor(mapWidth * (startX + width));
    const forestStartY = Math.floor(mapHeight * startY);
    const forestEndY = Math.floor(mapHeight * (startY + height));
    
    for (let y = forestStartY; y < forestEndY && y < mapHeight; y++) {
      for (let x = forestStartX; x < forestEndX && x < mapWidth; x++) {
        // Create irregular forest boundaries
        if (Math.random() < 0.8) {
          this.tileMap[y][x] = 5; // Wood (representing dense forest)
        }
      }
    }
  }

  private addWaterFeatures(): void {
    const width = this.tileMap[0].length;
    const height = this.tileMap.length;
    
    // Add a small lake in the center
    const lakeX = Math.floor(width * 0.4);
    const lakeY = Math.floor(height * 0.6);
    const lakeRadius = 5;
    
    for (let y = lakeY - lakeRadius; y <= lakeY + lakeRadius; y++) {
      for (let x = lakeX - lakeRadius; x <= lakeX + lakeRadius; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const dx = x - lakeX;
          const dy = y - lakeY;
          if (dx * dx + dy * dy <= lakeRadius * lakeRadius) {
            this.tileMap[y][x] = 3; // Water
          }
        }
      }
    }
  }

  populateFeatures(): void {
    // Ancient ruins
    this.addFeature('building', { x: 300, y: 200 }, { x: 100, y: 80 }, {
      type: 'ruins',
      name: 'Ancient Ruins',
      description: 'Crumbling stones of a forgotten civilization'
    });

    // Mysterious altar
    this.addFeature('altar', { x: 800, y: 600 }, { x: 50, y: 50 }, {
      type: 'dark_altar',
      name: 'Dark Altar',
      description: 'An ominous stone altar radiating dark energy',
      effect: 'dark_blessing'
    });

    // Hidden treasure chest
    this.addFeature('chest', { x: 150, y: 450 }, { x: 30, y: 20 }, {
      type: 'treasure_chest',
      name: 'Hidden Chest',
      description: 'A chest concealed among the trees',
      loot: ['mana_crystal', 'crystal_staff', 'tome_of_fire'],
      trapped: true
    });

    // Camping spot
    this.addFeature('altar', { x: 600, y: 300 }, { x: 40, y: 40 }, {
      type: 'campfire',
      name: 'Abandoned Campfire',
      description: 'A safe place to rest in the wilderness',
      effect: 'rest'
    });

    // Magic spring
    this.addFeature('altar', { x: 500, y: 550 }, { x: 30, y: 30 }, {
      type: 'magic_spring',
      name: 'Crystal Spring',
      description: 'A spring that restores mana',
      effect: 'mana_restore'
    });

    // Monster den entrance
    this.addFeature('portal', { x: 900, y: 200 }, { x: 40, y: 30 }, {
      type: 'cave_entrance',
      name: 'Dark Cave',
      description: 'A cave that seems to exhale darkness',
      spawnPoint: true
    });

    // Waypoint stone
    this.addFeature('sign', { x: 400, y: 100 }, { x: 20, y: 30 }, {
      text: 'Beware: Dangerous creatures ahead!\nTurn back while you still can!'
    });
  }

  private addEnemySpawns(): void {
    // Goblin camps
    this.addSpawn('goblin', { x: 200, y: 300 }, 1, 30);
    this.addSpawn('goblin', { x: 700, y: 400 }, 2, 30);
    this.addSpawn('goblin', { x: 1000, y: 600 }, 1, 30);
    
    // Orc patrols
    this.addSpawn('orc', { x: 400, y: 500 }, 3, 60);
    this.addSpawn('orc', { x: 800, y: 200 }, 4, 60);
    
    // Spider nests in forests
    this.addSpawn('giant_spider', { x: 250, y: 150 }, 4, 45);
    this.addSpawn('giant_spider', { x: 900, y: 700 }, 5, 45);
    
    // Random encounter spawns
    this.addSpawn('skeleton', { x: 350, y: 250 }, 3, 90);
    this.addSpawn('skeleton_mage', { x: 750, y: 500 }, 6, 120);
    
    // Boss-level encounters
    this.addSpawn('fire_elemental', { x: 820, y: 580 }, 8, 300); // Near dark altar
  }

  private addExits(): void {
    // Exit to village (north)
    this.addExit('village', { x: 550, y: 0 }, { x: 100, y: 50 });
    
    // Hidden exit to secret dungeon (requires exploration)
    this.addExit('secret_dungeon', { x: 880, y: 180 }, { x: 60, y: 50 });
  }

  // Special method to check if player has found the secret entrance
  hasFoundSecretEntrance(playerPosition: Vector2): boolean {
    const secretArea = { x: 880, y: 180, width: 60, height: 50 };
    return playerPosition.x >= secretArea.x && 
           playerPosition.x <= secretArea.x + secretArea.width &&
           playerPosition.y >= secretArea.y && 
           playerPosition.y <= secretArea.y + secretArea.height;
  }

  // Generate random encounter based on player level
  getRandomEncounter(playerLevel: number): string[] {
    const encounters: Record<number, string[]> = {
      1: ['goblin'],
      3: ['goblin', 'giant_spider'],
      5: ['orc', 'skeleton'],
      8: ['skeleton_mage', 'fire_elemental'],
      10: ['shadow_wraith']
    };
    
    // Find appropriate encounter for player level
    const availableEncounters = [];
    for (const [level, enemies] of Object.entries(encounters)) {
      if (playerLevel >= parseInt(level)) {
        availableEncounters.push(...enemies);
      }
    }
    
    return availableEncounters;
  }
}
