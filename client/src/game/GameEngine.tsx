import React from 'react';
import { RenderSystem } from './systems/RenderSystem';
import { InputSystem } from './systems/InputSystem';
import { GameSystem } from './systems/GameSystem';
import { CombatSystem } from './systems/CombatSystem';
import { InventorySystem } from './systems/InventorySystem';
import { SpellSystem } from './systems/SpellSystem';
import { WorldSystem } from './systems/WorldSystem';
import { SaveSystem } from './systems/SaveSystem';
import { Player } from './entities/Player';
import { Vector2 } from '../types/GameTypes';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private running = false;
  private lastTime = 0;

  // Systems
  public renderSystem: RenderSystem;
  public inputSystem: InputSystem;
  public gameSystem: GameSystem;
  public combatSystem: CombatSystem;
  public inventorySystem: InventorySystem;
  public spellSystem: SpellSystem;
  public worldSystem: WorldSystem;
  public saveSystem: SaveSystem;

  // Game entities
  public player: Player;
  public camera: Vector2 = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;

    // Initialize systems
    this.renderSystem = new RenderSystem(this.ctx, this.canvas);
    this.inputSystem = new InputSystem();
    this.gameSystem = new GameSystem(this);
    this.combatSystem = new CombatSystem(this);
    this.inventorySystem = new InventorySystem(this);
    this.spellSystem = new SpellSystem(this);
    this.worldSystem = new WorldSystem(this);
    this.saveSystem = new SaveSystem(this);

    // Initialize player
    this.player = new Player({ x: 400, y: 300 });

    console.log('GameEngine constructor completed');
  }

  async initialize(): Promise<void> {
    console.log('Initializing GameEngine...');
    
    // Initialize systems
    await this.renderSystem.initialize();
    this.inputSystem.initialize();
    await this.spellSystem.initialize();
    await this.inventorySystem.initialize();
    await this.worldSystem.initialize();
    
    // Load saved game or create new
    this.saveSystem.loadGame();
    
    console.log('GameEngine initialized successfully');
  }

  start(): void {
    if (this.running) return;
    
    console.log('Starting game engine...');
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  stop(): void {
    console.log('Stopping game engine...');
    this.running = false;
  }

  private gameLoop = (currentTime: number = performance.now()): void => {
    if (!this.running) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Update systems
    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Update input
    this.inputSystem.update();
    
    // Update player
    this.player.update(deltaTime, this.inputSystem);
    
    // Update camera to follow player
    this.updateCamera();
    
    // Update game systems
    this.gameSystem.update(deltaTime);
    this.combatSystem.update(deltaTime);
    this.spellSystem.update(deltaTime);
    this.worldSystem.update(deltaTime);
  }

  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set camera transform
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);
    
    // Render world
    this.worldSystem.render(this.renderSystem);
    
    // Render player
    this.player.render(this.renderSystem);
    
    // Render other entities
    this.combatSystem.render(this.renderSystem);
    
    // Render spell effects
    this.spellSystem.render(this.renderSystem);
    
    this.ctx.restore();
  }

  private updateCamera(): void {
    // Simple follow camera
    const targetX = this.player.position.x - this.canvas.width / 2;
    const targetY = this.player.position.y - this.canvas.height / 2;
    
    // Smooth camera movement
    this.camera.x += (targetX - this.camera.x) * 0.1;
    this.camera.y += (targetY - this.camera.y) * 0.1;
  }

  destroy(): void {
    this.stop();
    this.inputSystem.destroy();
    console.log('GameEngine destroyed');
  }

  // Utility methods
  worldToScreen(worldPos: Vector2): Vector2 {
    return {
      x: worldPos.x - this.camera.x,
      y: worldPos.y - this.camera.y
    };
  }

  screenToWorld(screenPos: Vector2): Vector2 {
    return {
      x: screenPos.x + this.camera.x,
      y: screenPos.y + this.camera.y
    };
  }
}
