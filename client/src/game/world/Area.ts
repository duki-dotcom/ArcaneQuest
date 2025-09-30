import { Vector2 } from '../../types/GameTypes';
import { NPC } from '../entities/NPC';

export interface AreaExit {
  target: string;
  position: Vector2;
  size: Vector2;
  requiresKey?: string;
}

export interface EnemySpawn {
  type: string;
  position: Vector2;
  level?: number;
  respawnTime?: number;
}

export interface AreaFeature {
  type: 'chest' | 'altar' | 'portal' | 'sign' | 'building';
  position: Vector2;
  size: Vector2;
  data: any;
}

export abstract class BaseArea {
  public id: string;
  public name: string;
  public description: string;
  public size: Vector2;
  public tileMap: number[][];
  public npcs: NPC[] = [];
  public exits: AreaExit[] = [];
  public spawns: EnemySpawn[] = [];
  public features: AreaFeature[] = [];
  public discovered = false;
  public safeZone = false;

  constructor(
    id: string,
    name: string,
    description: string,
    size: Vector2
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.size = size;
    this.tileMap = [];
  }

  abstract initialize(): void;
  abstract generateTerrain(): void;
  abstract populateFeatures(): void;

  protected generateBaseTileMap(width: number, height: number, baseTile: number): number[][] {
    const map: number[][] = [];
    
    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        row.push(baseTile);
      }
      map.push(row);
    }
    
    return map;
  }

  protected addVariation(map: number[][], variationTile: number, chance: number): void {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (Math.random() < chance) {
          map[y][x] = variationTile;
        }
      }
    }
  }

  getTileAt(x: number, y: number): number {
    const tileX = Math.floor(x / 32);
    const tileY = Math.floor(y / 32);
    
    if (tileY >= 0 && tileY < this.tileMap.length &&
        tileX >= 0 && tileX < this.tileMap[tileY].length) {
      return this.tileMap[tileY][tileX];
    }
    
    return 0;
  }

  isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.size.x && y >= 0 && y < this.size.y;
  }

  getSpawnPoint(): Vector2 {
    return { x: this.size.x / 2, y: this.size.y / 2 };
  }

  addNPC(npcType: string, position: Vector2): void {
    const npc = NPC.create(npcType, position);
    this.npcs.push(npc);
  }

  addExit(target: string, position: Vector2, size: Vector2, requiresKey?: string): void {
    this.exits.push({ target, position, size, requiresKey });
  }

  addSpawn(type: string, position: Vector2, level?: number, respawnTime?: number): void {
    this.spawns.push({ type, position, level, respawnTime });
  }

  addFeature(type: 'chest' | 'altar' | 'portal' | 'sign' | 'building', position: Vector2, size: Vector2, data: any): void {
    this.features.push({ type, position, size, data });
  }

  checkExits(playerPosition: Vector2): string | null {
    for (const exit of this.exits) {
      if (playerPosition.x >= exit.position.x &&
          playerPosition.x <= exit.position.x + exit.size.x &&
          playerPosition.y >= exit.position.y &&
          playerPosition.y <= exit.position.y + exit.size.y) {
        return exit.target;
      }
    }
    return null;
  }

  getNearbyNPCs(position: Vector2, radius: number): NPC[] {
    return this.npcs.filter(npc => {
      const dx = npc.position.x - position.x;
      const dy = npc.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius;
    });
  }

  getRandomSpawnPosition(): Vector2 {
    const attempts = 50;
    for (let i = 0; i < attempts; i++) {
      const x = Math.random() * this.size.x;
      const y = Math.random() * this.size.y;
      
      if (this.isValidSpawnPosition(x, y)) {
        return { x, y };
      }
    }
    
    // Fallback to center
    return this.getSpawnPoint();
  }

  private isValidSpawnPosition(x: number, y: number): boolean {
    // Check if position is not too close to NPCs or features
    const minDistance = 100;
    
    for (const npc of this.npcs) {
      const dx = npc.position.x - x;
      const dy = npc.position.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
        return false;
      }
    }
    
    for (const feature of this.features) {
      const dx = feature.position.x - x;
      const dy = feature.position.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
        return false;
      }
    }
    
    return true;
  }

  onEnter(): void {
    this.discovered = true;
    console.log(`Entered ${this.name}`);
  }

  onExit(): void {
    console.log(`Left ${this.name}`);
  }

  update(deltaTime: number): void {
    // Update NPCs
    for (const npc of this.npcs) {
      npc.update(deltaTime);
    }
  }
}
