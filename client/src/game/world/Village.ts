import { BaseArea } from './Area';
import { Vector2 } from '../../types/GameTypes';

export class Village extends BaseArea {
  constructor() {
    super(
      'village',
      'Peaceful Village',
      'A quiet village where adventurers can rest, trade, and gather information.',
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
    
    // Generate grass base
    this.tileMap = this.generateBaseTileMap(width, height, 0); // Grass
    
    // Add some dirt paths
    this.addPaths();
    
    // Add some variation
    this.addVariation(this.tileMap, 1, 0.05); // 5% dirt patches
  }

  private addPaths(): void {
    const width = this.tileMap[0].length;
    const height = this.tileMap.length;
    
    // Main horizontal path
    const mainPathY = Math.floor(height / 2);
    for (let x = 0; x < width; x++) {
      this.tileMap[mainPathY][x] = 1; // Dirt
      if (mainPathY + 1 < height) this.tileMap[mainPathY + 1][x] = 1;
    }
    
    // Vertical path to castle
    const castlePathX = Math.floor(width * 0.8);
    for (let y = 0; y < height; y++) {
      this.tileMap[y][castlePathX] = 1;
      if (castlePathX + 1 < width) this.tileMap[y][castlePathX + 1] = 1;
    }
  }

  populateFeatures(): void {
    // Add buildings
    this.addFeature('building', { x: 200, y: 150 }, { x: 80, y: 60 }, {
      type: 'inn',
      name: 'The Prancing Pony',
      description: 'A warm, welcoming inn'
    });

    this.addFeature('building', { x: 350, y: 200 }, { x: 100, y: 80 }, {
      type: 'shop',
      name: 'General Store',
      description: 'Everything an adventurer needs'
    });

    this.addFeature('building', { x: 150, y: 300 }, { x: 70, y: 50 }, {
      type: 'house',
      name: 'Cottage',
      description: 'A cozy village home'
    });

    this.addFeature('building', { x: 400, y: 350 }, { x: 90, y: 70 }, {
      type: 'blacksmith',
      name: 'The Forge',
      description: 'Master Thane\'s smithy'
    });

    // Add a well in the center
    this.addFeature('altar', { x: 400, y: 250 }, { x: 30, y: 30 }, {
      type: 'well',
      name: 'Village Well',
      description: 'The heart of the village'
    });

    // Add some signs
    this.addFeature('sign', { x: 300, y: 100 }, { x: 20, y: 20 }, {
      text: 'Welcome to Willowbrook Village\nPopulation: 127'
    });
  }

  private addNPCs(): void {
    // Shopkeeper
    this.addNPC('shopkeeper', { x: 400, y: 240 });
    
    // Blacksmith
    this.addNPC('blacksmith', { x: 445, y: 385 });
    
    // Innkeeper
    this.addNPC('innkeeper', { x: 240, y: 180 });
    
    // Add some generic villagers
    this.addNPC('generic', { x: 380, y: 270 }); // Near well
    this.addNPC('generic', { x: 180, y: 320 }); // Near cottage
  }

  private addExits(): void {
    // Exit to castle (north-east)
    this.addExit('castle', { x: 750, y: 200 }, { x: 50, y: 150 });
    
    // Exit to wilderness (south)
    this.addExit('wilderness', { x: 350, y: 550 }, { x: 100, y: 50 });
  }
}
