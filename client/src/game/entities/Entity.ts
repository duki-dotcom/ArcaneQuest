import { Vector2 } from '../../types/GameTypes';
import { RenderSystem } from '../systems/RenderSystem';

export abstract class Entity {
  public position: Vector2;
  public size: Vector2;
  
  constructor(position: Vector2, size: Vector2 = { x: 32, y: 32 }) {
    this.position = position;
    this.size = size;
  }

  abstract update(deltaTime: number, ...args: any[]): void;
  abstract render(renderSystem: RenderSystem): void;

  getBounds() {
    return {
      left: this.position.x - this.size.x / 2,
      right: this.position.x + this.size.x / 2,
      top: this.position.y - this.size.y / 2,
      bottom: this.position.y + this.size.y / 2
    };
  }

  isColliding(other: Entity): boolean {
    const bounds1 = this.getBounds();
    const bounds2 = other.getBounds();
    
    return bounds1.left < bounds2.right &&
           bounds1.right > bounds2.left &&
           bounds1.top < bounds2.bottom &&
           bounds1.bottom > bounds2.top;
  }
}
