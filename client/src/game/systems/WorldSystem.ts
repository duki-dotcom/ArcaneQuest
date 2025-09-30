import { GameEngine } from '../GameEngine';
import { RenderSystem } from './RenderSystem';
import { Vector2 } from '../../types/GameTypes';

export interface Area {
  id: string;
  name: string;
  size: Vector2;
  tileMap: number[][];
  spawns: { type: string; position: Vector2; }[];
  npcs: { id: string; position: Vector2; }[];
  exits: { target: string; position: Vector2; size: Vector2; }[];
}

export class WorldSystem {
  private engine: GameEngine;
  private currentArea: Area | null = null;
  private areas: Map<string, Area> = new Map();
  private tileSize = 32;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  async initialize(): Promise<void> {
    console.log('Initializing WorldSystem...');
    
    // Create world areas
    this.createVillage();
    this.createCastle();
    this.createWilderness();
    this.createDungeon();
    
    // Start in village
    this.changeArea('village');
    
    console.log('WorldSystem initialized');
  }

  update(deltaTime: number): void {
    if (!this.currentArea) return;

    // Check for area transitions
    this.checkAreaTransitions();
    
    // Spawn enemies if needed
    this.handleEnemySpawning(deltaTime);
  }

  render(renderSystem: RenderSystem): void {
    if (!this.currentArea) return;

    // Render terrain
    this.renderTerrain(renderSystem);
    
    // Render area decorations
    this.renderDecorations(renderSystem);
  }

  private renderTerrain(renderSystem: RenderSystem): void {
    if (!this.currentArea) return;

    const tileMap = this.currentArea.tileMap;
    const cameraX = this.engine.camera.x;
    const cameraY = this.engine.camera.y;
    const canvasSize = renderSystem.getCanvasSize();

    // Calculate visible tile range
    const startX = Math.floor(cameraX / this.tileSize);
    const startY = Math.floor(cameraY / this.tileSize);
    const endX = Math.ceil((cameraX + canvasSize.x) / this.tileSize);
    const endY = Math.ceil((cameraY + canvasSize.y) / this.tileSize);

    // Render visible tiles
    for (let y = Math.max(0, startY); y < Math.min(tileMap.length, endY); y++) {
      for (let x = Math.max(0, startX); x < Math.min(tileMap[y].length, endX); x++) {
        const tileId = tileMap[y][x];
        const pixelX = x * this.tileSize;
        const pixelY = y * this.tileSize;
        
        this.renderTile(renderSystem, tileId, pixelX, pixelY);
      }
    }
  }

  private renderTile(renderSystem: RenderSystem, tileId: number, x: number, y: number): void {
    // Use simple colors for different tile types
    const colors: Record<number, string> = {
      0: '#228b22', // Grass
      1: '#8b4513', // Dirt
      2: '#696969', // Stone
      3: '#4682b4', // Water
      4: '#daa520', // Sand
      5: '#654321', // Wood
      6: '#2f4f4f'  // Dark stone
    };

    const color = colors[tileId] || '#228b22';
    renderSystem.drawRect(x, y, this.tileSize, this.tileSize, color);
  }

  private renderDecorations(renderSystem: RenderSystem): void {
    if (!this.currentArea) return;

    // Render area-specific decorations based on area type
    switch (this.currentArea.id) {
      case 'village':
        this.renderVillageDecorations(renderSystem);
        break;
      case 'castle':
        this.renderCastleDecorations(renderSystem);
        break;
      case 'wilderness':
        this.renderWildernessDecorations(renderSystem);
        break;
      case 'dungeon':
        this.renderDungeonDecorations(renderSystem);
        break;
    }
  }

  private renderVillageDecorations(renderSystem: RenderSystem): void {
    // Render houses, shops, etc.
    const buildings = [
      { x: 200, y: 150, width: 80, height: 60, color: '#8b4513', label: 'Inn' },
      { x: 350, y: 200, width: 100, height: 80, color: '#654321', label: 'Shop' },
      { x: 150, y: 300, width: 70, height: 50, color: '#8b4513', label: 'House' },
      { x: 400, y: 350, width: 90, height: 70, color: '#654321', label: 'Blacksmith' }
    ];

    buildings.forEach(building => {
      renderSystem.drawRect(building.x, building.y, building.width, building.height, building.color);
      renderSystem.drawText(building.label, building.x + building.width/2, building.y - 10, '#ffffff', 14, 'center');
    });
  }

  private renderCastleDecorations(renderSystem: RenderSystem): void {
    // Render castle walls, towers, etc.
    renderSystem.drawRect(300, 200, 200, 150, '#696969');
    renderSystem.drawText('Castle Keep', 400, 185, '#ffffff', 16, 'center');
  }

  private renderWildernessDecorations(renderSystem: RenderSystem): void {
    // Render trees, rocks, etc.
    const decorations = [
      { x: 150, y: 100, size: 20, color: '#006400', type: 'tree' },
      { x: 300, y: 180, size: 25, color: '#006400', type: 'tree' },
      { x: 450, y: 120, size: 15, color: '#696969', type: 'rock' },
      { x: 200, y: 250, size: 30, color: '#006400', type: 'tree' }
    ];

    decorations.forEach(dec => {
      renderSystem.drawCircle(dec.x, dec.y, dec.size, dec.color);
    });
  }

  private renderDungeonDecorations(renderSystem: RenderSystem): void {
    // Render dungeon walls, doors, etc.
    renderSystem.drawText('Mysterious Dungeon', 400, 50, '#ffffff', 18, 'center');
  }

  private checkAreaTransitions(): void {
    if (!this.currentArea) return;

    const player = this.engine.player;
    
    for (const exit of this.currentArea.exits) {
      const exitBounds = {
        left: exit.position.x,
        right: exit.position.x + exit.size.x,
        top: exit.position.y,
        bottom: exit.position.y + exit.size.y
      };

      if (player.position.x >= exitBounds.left &&
          player.position.x <= exitBounds.right &&
          player.position.y >= exitBounds.top &&
          player.position.y <= exitBounds.bottom) {
        this.changeArea(exit.target);
        break;
      }
    }
  }

  private handleEnemySpawning(deltaTime: number): void {
    if (!this.currentArea) return;

    // Only spawn enemies in wilderness and dungeons
    if (this.currentArea.id === 'wilderness' || this.currentArea.id === 'dungeon') {
      const currentEnemyCount = this.engine.combatSystem.getEnemies().length;
      const maxEnemies = this.currentArea.id === 'dungeon' ? 5 : 3;

      if (currentEnemyCount < maxEnemies && Math.random() < 0.01) { // 1% chance per frame
        this.spawnRandomEnemy();
      }
    }
  }

  private spawnRandomEnemy(): void {
    if (!this.currentArea) return;

    const enemyTypes = this.getEnemyTypesForArea(this.currentArea.id);
    const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    // Spawn away from player
    const player = this.engine.player;
    const spawnDistance = 200;
    const angle = Math.random() * Math.PI * 2;
    const spawnX = player.position.x + Math.cos(angle) * spawnDistance;
    const spawnY = player.position.y + Math.sin(angle) * spawnDistance;

    this.engine.combatSystem.spawnEnemy(enemyType, spawnX, spawnY);
  }

  private getEnemyTypesForArea(areaId: string): string[] {
    const areaEnemies: Record<string, string[]> = {
      wilderness: ['goblin', 'giant_spider', 'orc'],
      dungeon: ['skeleton', 'skeleton_mage', 'shadow_wraith', 'fire_elemental'],
      castle: ['orc', 'skeleton_mage'],
      village: [] // No enemies in village
    };

    return areaEnemies[areaId] || [];
  }

  changeArea(areaId: string): void {
    const area = this.areas.get(areaId);
    if (!area) {
      console.log('Unknown area:', areaId);
      return;
    }

    console.log(`Changing to area: ${area.name}`);
    this.currentArea = area;
    
    // Clear enemies when changing areas
    this.engine.combatSystem.clearEnemies();
    
    // Set player position based on area
    this.setPlayerStartPosition(areaId);
    
    // Save game
    this.engine.saveSystem.saveGame();
  }

  private setPlayerStartPosition(areaId: string): void {
    const startPositions: Record<string, Vector2> = {
      village: { x: 300, y: 300 },
      castle: { x: 400, y: 400 },
      wilderness: { x: 250, y: 250 },
      dungeon: { x: 100, y: 100 }
    };

    const startPos = startPositions[areaId] || { x: 300, y: 300 };
    this.engine.player.position = { ...startPos };
  }

  private createVillage(): void {
    const village: Area = {
      id: 'village',
      name: 'Peaceful Village',
      size: { x: 800, y: 600 },
      tileMap: this.generateTileMap(25, 19, 0), // Grass
      spawns: [],
      npcs: [
        { id: 'shopkeeper', position: { x: 400, y: 240 } },
        { id: 'blacksmith', position: { x: 445, y: 385 } },
        { id: 'innkeeper', position: { x: 240, y: 180 } }
      ],
      exits: [
        { target: 'castle', position: { x: 750, y: 250 }, size: { x: 50, y: 100 } },
        { target: 'wilderness', position: { x: 350, y: 550 }, size: { x: 100, y: 50 } }
      ]
    };
    
    this.areas.set('village', village);
  }

  private createCastle(): void {
    const castle: Area = {
      id: 'castle',
      name: 'Royal Castle',
      size: { x: 800, y: 600 },
      tileMap: this.generateTileMap(25, 19, 2), // Stone
      spawns: [],
      npcs: [
        { id: 'king', position: { x: 400, y: 200 } },
        { id: 'court_wizard', position: { x: 350, y: 250 } }
      ],
      exits: [
        { target: 'village', position: { x: 0, y: 250 }, size: { x: 50, y: 100 } },
        { target: 'dungeon', position: { x: 400, y: 550 }, size: { x: 100, y: 50 } }
      ]
    };
    
    this.areas.set('castle', castle);
  }

  private createWilderness(): void {
    const wilderness: Area = {
      id: 'wilderness',
      name: 'Dark Wilderness',
      size: { x: 1200, y: 900 },
      tileMap: this.generateTileMap(38, 28, 0), // Mixed terrain
      spawns: [
        { type: 'goblin', position: { x: 200, y: 200 } },
        { type: 'orc', position: { x: 600, y: 400 } }
      ],
      npcs: [],
      exits: [
        { target: 'village', position: { x: 550, y: 0 }, size: { x: 100, y: 50 } }
      ]
    };
    
    this.areas.set('wilderness', wilderness);
  }

  private createDungeon(): void {
    const dungeon: Area = {
      id: 'dungeon',
      name: 'Ancient Dungeon',
      size: { x: 800, y: 600 },
      tileMap: this.generateTileMap(25, 19, 6), // Dark stone
      spawns: [
        { type: 'skeleton', position: { x: 300, y: 200 } },
        { type: 'skeleton_mage', position: { x: 500, y: 400 } }
      ],
      npcs: [],
      exits: [
        { target: 'castle', position: { x: 350, y: 0 }, size: { x: 100, y: 50 } }
      ]
    };
    
    this.areas.set('dungeon', dungeon);
  }

  private generateTileMap(width: number, height: number, baseTile: number): number[][] {
    const map: number[][] = [];
    
    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        // Add some variation
        let tile = baseTile;
        if (Math.random() < 0.1) {
          tile = (baseTile + 1) % 7;
        }
        row.push(tile);
      }
      map.push(row);
    }
    
    return map;
  }

  getCurrentArea(): Area | null {
    return this.currentArea;
  }

  getTileAt(x: number, y: number): number {
    if (!this.currentArea) return 0;
    
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    
    if (tileY >= 0 && tileY < this.currentArea.tileMap.length &&
        tileX >= 0 && tileX < this.currentArea.tileMap[tileY].length) {
      return this.currentArea.tileMap[tileY][tileX];
    }
    
    return 0;
  }
}
