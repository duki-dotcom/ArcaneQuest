import { Vector2 } from '../../types/GameTypes';

export class InputSystem {
  private keys: Set<string> = new Set();
  private mousePos: Vector2 = { x: 0, y: 0 };
  private mouseButtons: Set<number> = new Set();

  initialize(): void {
    console.log('Initializing InputSystem...');
    
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    // Mouse events
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    
    // Prevent context menu
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    
    console.log('InputSystem initialized');
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
    console.log(`Key pressed: ${event.code}`);
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  private handleMouseDown = (event: MouseEvent): void => {
    this.mouseButtons.add(event.button);
  };

  private handleMouseUp = (event: MouseEvent): void => {
    this.mouseButtons.delete(event.button);
  };

  private handleMouseMove = (event: MouseEvent): void => {
    this.mousePos.x = event.clientX;
    this.mousePos.y = event.clientY;
  };

  update(): void {
    // Update logic can go here if needed
  }

  isKeyPressed(keyCode: string): boolean {
    return this.keys.has(keyCode);
  }

  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.has(button);
  }

  getMousePosition(): Vector2 {
    return { ...this.mousePos };
  }

  // Movement helpers
  isMovingUp(): boolean {
    return this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp');
  }

  isMovingDown(): boolean {
    return this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown');
  }

  isMovingLeft(): boolean {
    return this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft');
  }

  isMovingRight(): boolean {
    return this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight');
  }

  // Action keys
  isActionPressed(): boolean {
    return this.isKeyPressed('Space') || this.isKeyPressed('Enter');
  }

  isAttackPressed(): boolean {
    return this.isKeyPressed('KeyJ') || this.isMouseButtonPressed(0);
  }

  isCastSpellPressed(): boolean {
    return this.isKeyPressed('KeyK') || this.isMouseButtonPressed(2);
  }

  isInventoryPressed(): boolean {
    return this.isKeyPressed('KeyI') || this.isKeyPressed('Tab');
  }

  isSpellBookPressed(): boolean {
    return this.isKeyPressed('KeyM') || this.isKeyPressed('KeyB');
  }

  destroy(): void {
    console.log('Destroying InputSystem...');
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }
}
