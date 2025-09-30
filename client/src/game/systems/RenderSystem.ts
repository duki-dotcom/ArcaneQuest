import { Vector2 } from '../../types/GameTypes';

export class RenderSystem {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private sprites: Map<string, HTMLImageElement> = new Map();

  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  async initialize(): Promise<void> {
    console.log('Initializing RenderSystem...');
    // Load sprite sheets
    await this.loadSprites();
    console.log('RenderSystem initialized');
  }

  private async loadSprites(): Promise<void> {
    const spriteFiles = [
      'player',
      'enemies', 
      'npcs',
      'items',
      'spells',
      'tiles'
    ];

    const loadPromises = spriteFiles.map(async (filename) => {
      try {
        const img = new Image();
        img.src = `/sprites/${filename}.png`;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        this.sprites.set(filename, img);
        console.log(`Loaded sprite: ${filename}`);
      } catch (error) {
        console.warn(`Could not load sprite ${filename}, using fallback`);
        // Create a colored rectangle as fallback
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = this.getFallbackColor(filename);
        ctx.fillRect(0, 0, 64, 64);
        const img = new Image();
        img.src = canvas.toDataURL();
        this.sprites.set(filename, img);
      }
    });

    await Promise.all(loadPromises);
  }

  private getFallbackColor(filename: string): string {
    const colors: Record<string, string> = {
      player: '#4a90e2',
      enemies: '#e74c3c',
      npcs: '#f39c12',
      items: '#9b59b6',
      spells: '#1abc9c',
      tiles: '#2ecc71'
    };
    return colors[filename] || '#95a5a6';
  }

  drawSprite(
    spriteSheet: string,
    sourceX: number,
    sourceY: number,
    sourceWidth: number,
    sourceHeight: number,
    destX: number,
    destY: number,
    destWidth: number = sourceWidth,
    destHeight: number = sourceHeight
  ): void {
    const sprite = this.sprites.get(spriteSheet);
    if (sprite) {
      this.ctx.drawImage(
        sprite,
        sourceX, sourceY, sourceWidth, sourceHeight,
        destX, destY, destWidth, destHeight
      );
    } else {
      // Fallback rectangle
      this.ctx.fillStyle = this.getFallbackColor(spriteSheet);
      this.ctx.fillRect(destX, destY, destWidth, destHeight);
    }
  }

  drawRect(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  drawCircle(x: number, y: number, radius: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawText(
    text: string,
    x: number,
    y: number,
    color: string = '#ffffff',
    fontSize: number = 16,
    align: CanvasTextAlign = 'left'
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px 'Inter', sans-serif`;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  drawHealthBar(x: number, y: number, width: number, height: number, current: number, max: number): void {
    // Background
    this.drawRect(x, y, width, height, '#333');
    
    // Health bar
    const healthWidth = (current / max) * width;
    this.drawRect(x, y, healthWidth, height, '#e74c3c');
    
    // Border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);
  }

  drawManaBar(x: number, y: number, width: number, height: number, current: number, max: number): void {
    // Background
    this.drawRect(x, y, width, height, '#333');
    
    // Mana bar
    const manaWidth = (current / max) * width;
    this.drawRect(x, y, manaWidth, height, '#3498db');
    
    // Border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);
  }

  drawSpellEffect(x: number, y: number, radius: number, color: string, intensity: number = 1): void {
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${this.hexToRgb(color)}, ${intensity})`);
    gradient.addColorStop(1, `rgba(${this.hexToRgb(color)}, 0)`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '255, 255, 255';
  }

  drawTile(tileId: number, x: number, y: number, size: number = 32): void {
    const tilesPerRow = 16;
    const sourceX = (tileId % tilesPerRow) * 32;
    const sourceY = Math.floor(tileId / tilesPerRow) * 32;
    
    this.drawSprite('tiles', sourceX, sourceY, 32, 32, x, y, size, size);
  }

  getCanvasSize(): Vector2 {
    return { x: this.canvas.width, y: this.canvas.height };
  }
}
