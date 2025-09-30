import { Spell, SpellComponent, SpellSchool, SpellEffect } from '../../types/GameTypes';
import { SPELL_COMPONENTS } from './SpellData';

export class SpellCreationSystem {
  private unlockedComponents: Set<string> = new Set();
  private maxComponents = 4;
  private baseCost = 15;

  constructor() {
    // Start with basic components unlocked
    this.unlockedComponents.add('fire');
    this.unlockedComponents.add('ice');
    this.unlockedComponents.add('bolt');
    this.unlockedComponents.add('orb');
    this.unlockedComponents.add('minor');
    this.unlockedComponents.add('normal');
    this.unlockedComponents.add('damage');
    this.unlockedComponents.add('healing');
  }

  createSpell(
    name: string,
    components: SpellComponent[],
    playerLevel: number,
    playerIntelligence: number
  ): Spell | null {
    // Validate spell creation requirements
    if (!this.canCreateSpells(playerLevel)) {
      return null;
    }

    // Validate components
    if (!this.validateComponents(components)) {
      return null;
    }

    // Calculate spell properties
    const spellProperties = this.calculateSpellProperties(components, playerIntelligence);
    
    if (!spellProperties) {
      return null;
    }

    // Create the spell
    const customSpell: Spell = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name || 'Custom Spell',
      description: this.generateDescription(components),
      school: spellProperties.school,
      manaCost: spellProperties.manaCost,
      cooldown: spellProperties.cooldown,
      damage: spellProperties.damage > 0 ? spellProperties.damage : undefined,
      healing: spellProperties.healing > 0 ? spellProperties.healing : undefined,
      effects: spellProperties.effects,
      components: [...components],
      isCustom: true
    };

    return customSpell;
  }

  private canCreateSpells(playerLevel: number): boolean {
    return playerLevel >= 10;
  }

  private validateComponents(components: SpellComponent[]): boolean {
    if (components.length === 0 || components.length > this.maxComponents) {
      return false;
    }

    // Must have at least one element and one shape
    const hasElement = components.some(c => c.type === 'element');
    const hasShape = components.some(c => c.type === 'shape');
    const hasEffect = components.some(c => c.type === 'effect');

    if (!hasElement || !hasShape || !hasEffect) {
      return false;
    }

    // Check if all components are unlocked
    return components.every(component => 
      this.unlockedComponents.has(component.value)
    );
  }

  private calculateSpellProperties(
    components: SpellComponent[],
    playerIntelligence: number
  ): SpellProperties | null {
    let manaCost = this.baseCost;
    let damage = 0;
    let healing = 0;
    let cooldown = 3.0;
    let school: SpellSchool = 'arcane';
    const effects: SpellEffect[] = [];

    // Base intelligence scaling
    const intBonus = Math.floor(playerIntelligence / 5);

    for (const component of components) {
      manaCost += component.modifier * 8;

      switch (component.type) {
        case 'element':
          school = this.getSchoolFromElement(component.value);
          damage += component.modifier * (15 + intBonus);
          break;

        case 'shape':
          const shapeMultiplier = this.getShapeMultiplier(component.value);
          damage = Math.floor(damage * shapeMultiplier);
          cooldown += component.modifier * 0.5;
          break;

        case 'power':
          const powerMultiplier = this.getPowerMultiplier(component.value);
          damage = Math.floor(damage * powerMultiplier);
          healing = Math.floor(healing * powerMultiplier);
          manaCost = Math.floor(manaCost * powerMultiplier);
          break;

        case 'effect':
          if (component.value === 'healing') {
            healing += component.modifier * (20 + intBonus);
            school = 'healing';
          } else if (component.value === 'damage') {
            damage += component.modifier * (10 + intBonus);
          }
          break;
      }
    }

    // Create effects based on final damage/healing values
    if (damage > 0) {
      effects.push({
        type: 'damage',
        value: damage,
        target: this.getTargetFromShape(components)
      });
    }

    if (healing > 0) {
      effects.push({
        type: 'healing',
        value: healing,
        target: 'self'
      });
    }

    // Add special effects based on components
    this.addSpecialEffects(components, effects);

    return {
      manaCost: Math.max(5, manaCost),
      damage,
      healing,
      cooldown: Math.max(1.0, cooldown),
      school,
      effects
    };
  }

  private getSchoolFromElement(element: string): SpellSchool {
    const schoolMap: Record<string, SpellSchool> = {
      fire: 'fire',
      ice: 'ice',
      lightning: 'lightning',
      earth: 'arcane',
      air: 'arcane',
      arcane: 'arcane'
    };
    return schoolMap[element] || 'arcane';
  }

  private getShapeMultiplier(shape: string): number {
    const shapeMultipliers: Record<string, number> = {
      bolt: 1.0,
      orb: 1.1,
      cone: 1.3,
      aura: 0.8,
      beam: 1.2
    };
    return shapeMultipliers[shape] || 1.0;
  }

  private getPowerMultiplier(power: string): number {
    const powerMultipliers: Record<string, number> = {
      minor: 0.7,
      normal: 1.0,
      major: 1.4,
      greater: 1.8,
      supreme: 2.5
    };
    return powerMultipliers[power] || 1.0;
  }

  private getTargetFromShape(components: SpellComponent[]): 'enemy' | 'area' | 'self' {
    const shape = components.find(c => c.type === 'shape');
    if (!shape) return 'enemy';

    const areaShapes = ['cone', 'aura'];
    return areaShapes.includes(shape.value) ? 'area' : 'enemy';
  }

  private addSpecialEffects(components: SpellComponent[], effects: SpellEffect[]): void {
    const hasIce = components.some(c => c.value === 'ice');
    const hasCone = components.some(c => c.value === 'cone');
    const hasAura = components.some(c => c.value === 'aura');

    // Ice effects slow enemies
    if (hasIce) {
      effects.push({
        type: 'debuff',
        value: 25,
        duration: 5,
        target: 'enemy'
      });
    }

    // Cone and aura shapes hit multiple targets
    if (hasCone || hasAura) {
      // Modify existing damage effects to be area-targeted
      effects.forEach(effect => {
        if (effect.type === 'damage') {
          effect.target = 'area';
        }
      });
    }
  }

  private generateDescription(components: SpellComponent[]): string {
    const elementComponent = components.find(c => c.type === 'element');
    const shapeComponent = components.find(c => c.type === 'shape');
    const powerComponent = components.find(c => c.type === 'power');
    const effectComponent = components.find(c => c.type === 'effect');

    let description = 'A custom spell that ';

    if (effectComponent?.value === 'healing') {
      description += 'restores health';
    } else {
      description += 'deals damage';
    }

    if (elementComponent) {
      description += ` using ${elementComponent.value} magic`;
    }

    if (shapeComponent) {
      description += ` in a ${shapeComponent.value} pattern`;
    }

    if (powerComponent && powerComponent.value !== 'normal') {
      description += ` with ${powerComponent.value} intensity`;
    }

    description += '.';

    return description;
  }

  unlockComponent(componentValue: string): void {
    this.unlockedComponents.add(componentValue);
    console.log(`Unlocked spell component: ${componentValue}`);
  }

  getUnlockedComponents(): string[] {
    return Array.from(this.unlockedComponents);
  }

  getAvailableComponents(): {
    elements: SpellComponent[];
    shapes: SpellComponent[];
    powers: SpellComponent[];
    effects: SpellComponent[];
  } {
    return {
      elements: SPELL_COMPONENTS.elements.filter(c => 
        this.unlockedComponents.has(c.value)
      ),
      shapes: SPELL_COMPONENTS.shapes.filter(c => 
        this.unlockedComponents.has(c.value)
      ),
      powers: SPELL_COMPONENTS.powers.filter(c => 
        this.unlockedComponents.has(c.value)
      ),
      effects: SPELL_COMPONENTS.effects.filter(c => 
        this.unlockedComponents.has(c.value)
      )
    };
  }

  calculateSpellCost(components: SpellComponent[]): number {
    let cost = this.baseCost;
    
    for (const component of components) {
      cost += component.modifier * 8;
    }
    
    return Math.max(5, cost);
  }

  getMaxComponents(): number {
    return this.maxComponents;
  }
}

interface SpellProperties {
  manaCost: number;
  damage: number;
  healing: number;
  cooldown: number;
  school: SpellSchool;
  effects: SpellEffect[];
}
