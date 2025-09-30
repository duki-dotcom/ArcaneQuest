import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Spell, SpellComponent, SpellSchool } from '../../types/GameTypes';

interface SpellCreatorProps {
  onClose: () => void;
  onSpellCreated: (spell: Spell) => void;
  playerLevel: number;
  playerIntelligence: number;
}

export function SpellCreator({ onClose, onSpellCreated, playerLevel, playerIntelligence }: SpellCreatorProps) {
  const [spellName, setSpellName] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<SpellComponent[]>([]);
  const [availableComponents, setAvailableComponents] = useState({
    elements: [] as SpellComponent[],
    shapes: [] as SpellComponent[],
    powers: [] as SpellComponent[],
    effects: [] as SpellComponent[]
  });
  const [previewSpell, setPreviewSpell] = useState<Partial<Spell> | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [playerMana, setPlayerMana] = useState(120);

  const maxComponents = 4;

  // Initialize available components based on player progress
  useEffect(() => {
    // Mock unlocked components - in real implementation this would come from game engine
    const unlockedComponents = {
      elements: [
        { type: 'element' as const, value: 'fire', modifier: 2 },
        { type: 'element' as const, value: 'ice', modifier: 1.5 },
        { type: 'element' as const, value: 'lightning', modifier: 2.5 },
        { type: 'element' as const, value: 'earth', modifier: 1.8 },
        { type: 'element' as const, value: 'air', modifier: 1.3 },
        ...(playerLevel >= 15 ? [{ type: 'element' as const, value: 'arcane', modifier: 3 }] : [])
      ],
      shapes: [
        { type: 'shape' as const, value: 'bolt', modifier: 1 },
        { type: 'shape' as const, value: 'orb', modifier: 1.2 },
        { type: 'shape' as const, value: 'cone', modifier: 1.5 },
        ...(playerLevel >= 12 ? [{ type: 'shape' as const, value: 'aura', modifier: 2 }] : []),
        ...(playerLevel >= 18 ? [{ type: 'shape' as const, value: 'beam', modifier: 1.8 }] : [])
      ],
      powers: [
        { type: 'power' as const, value: 'minor', modifier: 0.5 },
        { type: 'power' as const, value: 'normal', modifier: 1 },
        { type: 'power' as const, value: 'major', modifier: 1.5 },
        ...(playerLevel >= 16 ? [{ type: 'power' as const, value: 'greater', modifier: 2 }] : []),
        ...(playerLevel >= 22 ? [{ type: 'power' as const, value: 'supreme', modifier: 3 }] : [])
      ],
      effects: [
        { type: 'effect' as const, value: 'damage', modifier: 1 },
        { type: 'effect' as const, value: 'healing', modifier: 1.2 },
        ...(playerLevel >= 14 ? [{ type: 'effect' as const, value: 'buff', modifier: 1.5 }] : []),
        ...(playerLevel >= 14 ? [{ type: 'effect' as const, value: 'debuff', modifier: 1.3 }] : []),
        ...(playerLevel >= 20 ? [{ type: 'effect' as const, value: 'utility', modifier: 2 }] : [])
      ]
    };

    setAvailableComponents(unlockedComponents);
  }, [playerLevel]);

  // Update spell preview when components change
  useEffect(() => {
    if (selectedComponents.length > 0) {
      const preview = calculateSpellProperties(selectedComponents);
      setPreviewSpell(preview);
      setErrors(validateSpell(selectedComponents));
    } else {
      setPreviewSpell(null);
      setErrors([]);
    }
  }, [selectedComponents, playerIntelligence]);

  const calculateSpellProperties = (components: SpellComponent[]): Partial<Spell> => {
    let manaCost = 15; // Base cost
    let damage = 0;
    let healing = 0;
    let cooldown = 3.0;
    let school: SpellSchool = 'arcane';

    // Intelligence bonus
    const intBonus = Math.floor(playerIntelligence / 5);

    for (const component of components) {
      manaCost += component.modifier * 8;

      switch (component.type) {
        case 'element':
          school = getSchoolFromElement(component.value);
          damage += component.modifier * (15 + intBonus);
          break;

        case 'shape':
          const shapeMultiplier = getShapeMultiplier(component.value);
          damage = Math.floor(damage * shapeMultiplier);
          cooldown += component.modifier * 0.5;
          break;

        case 'power':
          const powerMultiplier = getPowerMultiplier(component.value);
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

    // Create effects
    const effects = [];
    if (damage > 0) {
      effects.push({
        type: 'damage' as const,
        value: damage,
        target: getTargetFromShape(components)
      });
    }
    if (healing > 0) {
      effects.push({
        type: 'healing' as const,
        value: healing,
        target: 'self' as const
      });
    }

    return {
      name: spellName || 'Custom Spell',
      school,
      manaCost: Math.max(5, manaCost),
      cooldown: Math.max(1.0, cooldown),
      damage: damage > 0 ? damage : undefined,
      healing: healing > 0 ? healing : undefined,
      effects
    };
  };

  const getSchoolFromElement = (element: string): SpellSchool => {
    const schoolMap: Record<string, SpellSchool> = {
      fire: 'fire',
      ice: 'ice',
      lightning: 'lightning',
      earth: 'arcane',
      air: 'arcane',
      arcane: 'arcane'
    };
    return schoolMap[element] || 'arcane';
  };

  const getShapeMultiplier = (shape: string): number => {
    const multipliers: Record<string, number> = {
      bolt: 1.0,
      orb: 1.1,
      cone: 1.3,
      aura: 0.8,
      beam: 1.2
    };
    return multipliers[shape] || 1.0;
  };

  const getPowerMultiplier = (power: string): number => {
    const multipliers: Record<string, number> = {
      minor: 0.7,
      normal: 1.0,
      major: 1.4,
      greater: 1.8,
      supreme: 2.5
    };
    return multipliers[power] || 1.0;
  };

  const getTargetFromShape = (components: SpellComponent[]): 'enemy' | 'area' | 'self' => {
    const shape = components.find(c => c.type === 'shape');
    if (!shape) return 'enemy';
    
    const areaShapes = ['cone', 'aura'];
    return areaShapes.includes(shape.value) ? 'area' : 'enemy';
  };

  const validateSpell = (components: SpellComponent[]): string[] => {
    const errors: string[] = [];

    if (components.length === 0) {
      errors.push('Add at least one component');
      return errors;
    }

    if (components.length > maxComponents) {
      errors.push(`Maximum ${maxComponents} components allowed`);
    }

    const hasElement = components.some(c => c.type === 'element');
    const hasShape = components.some(c => c.type === 'shape');
    const hasEffect = components.some(c => c.type === 'effect');

    if (!hasElement) errors.push('Requires at least one element component');
    if (!hasShape) errors.push('Requires at least one shape component');
    if (!hasEffect) errors.push('Requires at least one effect component');

    if (previewSpell && previewSpell.manaCost && previewSpell.manaCost > playerMana) {
      errors.push('Spell cost exceeds available mana');
    }

    return errors;
  };

  const addComponent = (component: SpellComponent) => {
    if (selectedComponents.length >= maxComponents) return;
    setSelectedComponents(prev => [...prev, component]);
  };

  const removeComponent = (index: number) => {
    setSelectedComponents(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateSpell = () => {
    if (errors.length > 0) return;
    if (!spellName.trim()) {
      setErrors(['Spell name is required']);
      return;
    }

    const spell: Spell = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: spellName,
      description: generateDescription(selectedComponents),
      school: previewSpell?.school || 'arcane',
      manaCost: previewSpell?.manaCost || 15,
      cooldown: previewSpell?.cooldown || 3.0,
      damage: previewSpell?.damage,
      healing: previewSpell?.healing,
      effects: previewSpell?.effects || [],
      components: [...selectedComponents],
      isCustom: true
    };

    onSpellCreated(spell);
  };

  const generateDescription = (components: SpellComponent[]): string => {
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
  };

  const getComponentIcon = (type: string, value: string): string => {
    const icons: Record<string, Record<string, string>> = {
      element: {
        fire: '🔥',
        ice: '❄️',
        lightning: '⚡',
        earth: '🌍',
        air: '💨',
        arcane: '🔮'
      },
      shape: {
        bolt: '→',
        orb: '⚪',
        cone: '🔺',
        aura: '⭕',
        beam: '━'
      },
      power: {
        minor: '▪️',
        normal: '▫️',
        major: '🔸',
        greater: '🔶',
        supreme: '🔥'
      },
      effect: {
        damage: '⚔️',
        healing: '💚',
        buff: '🛡️',
        debuff: '💀',
        utility: '✨'
      }
    };
    return icons[type]?.[value] || '❓';
  };

  const getComponentColor = (type: string): string => {
    const colors = {
      element: 'bg-red-500',
      shape: 'bg-blue-500',
      power: 'bg-yellow-500',
      effect: 'bg-green-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="ui-overlay flex items-center justify-center">
      <Card className="ui-panel w-5/6 h-5/6 max-w-6xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl text-purple-300">Spell Creation Workshop</CardTitle>
          <Button 
            onClick={onClose}
            variant="outline"
            className="text-white border-purple-600 hover:bg-purple-600"
          >
            Close
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 h-full overflow-hidden">
          <div className="grid grid-cols-3 gap-6 h-full">
            {/* Component Selection */}
            <div className="col-span-2">
              <Tabs defaultValue="elements" className="h-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="elements">Elements</TabsTrigger>
                  <TabsTrigger value="shapes">Shapes</TabsTrigger>
                  <TabsTrigger value="powers">Powers</TabsTrigger>
                  <TabsTrigger value="effects">Effects</TabsTrigger>
                </TabsList>

                <TabsContent value="elements" className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Elemental Components</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {availableComponents.elements.map((component, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center border-red-500 hover:bg-red-900/20"
                        onClick={() => addComponent(component)}
                        disabled={selectedComponents.length >= maxComponents}
                      >
                        <span className="text-2xl mb-1">{getComponentIcon('element', component.value)}</span>
                        <span className="text-sm capitalize">{component.value}</span>
                        <span className="text-xs text-gray-400">×{component.modifier}</span>
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="shapes" className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Shape Components</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {availableComponents.shapes.map((component, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center border-blue-500 hover:bg-blue-900/20"
                        onClick={() => addComponent(component)}
                        disabled={selectedComponents.length >= maxComponents}
                      >
                        <span className="text-2xl mb-1">{getComponentIcon('shape', component.value)}</span>
                        <span className="text-sm capitalize">{component.value}</span>
                        <span className="text-xs text-gray-400">×{component.modifier}</span>
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="powers" className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Power Components</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {availableComponents.powers.map((component, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center border-yellow-500 hover:bg-yellow-900/20"
                        onClick={() => addComponent(component)}
                        disabled={selectedComponents.length >= maxComponents}
                      >
                        <span className="text-2xl mb-1">{getComponentIcon('power', component.value)}</span>
                        <span className="text-sm capitalize">{component.value}</span>
                        <span className="text-xs text-gray-400">×{component.modifier}</span>
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="effects" className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Effect Components</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {availableComponents.effects.map((component, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center border-green-500 hover:bg-green-900/20"
                        onClick={() => addComponent(component)}
                        disabled={selectedComponents.length >= maxComponents}
                      >
                        <span className="text-2xl mb-1">{getComponentIcon('effect', component.value)}</span>
                        <span className="text-sm capitalize">{component.value}</span>
                        <span className="text-xs text-gray-400">×{component.modifier}</span>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Spell Builder */}
            <div className="space-y-6">
              {/* Spell Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Spell Name</label>
                <Input
                  value={spellName}
                  onChange={(e) => setSpellName(e.target.value)}
                  placeholder="Enter spell name..."
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              {/* Selected Components */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Components ({selectedComponents.length}/{maxComponents})
                </h3>
                <div className="space-y-2">
                  {selectedComponents.map((component, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getComponentIcon(component.type, component.value)}</span>
                        <Badge className={getComponentColor(component.type)}>
                          {component.type}
                        </Badge>
                        <span className="text-white capitalize">{component.value}</span>
                        <span className="text-xs text-gray-400">×{component.modifier}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeComponent(index)}
                        className="text-red-400 border-red-400 hover:bg-red-900/20"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spell Preview */}
              {previewSpell && (
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-300">Spell Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">School:</span>
                        <span className="text-white capitalize">{previewSpell.school}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mana Cost:</span>
                        <span className={previewSpell.manaCost! > playerMana ? 'text-red-400' : 'text-blue-400'}>
                          {previewSpell.manaCost}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cooldown:</span>
                        <span className="text-white">{previewSpell.cooldown}s</span>
                      </div>
                      {previewSpell.damage && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Damage:</span>
                          <span className="text-red-400">{previewSpell.damage}</span>
                        </div>
                      )}
                      {previewSpell.healing && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Healing:</span>
                          <span className="text-green-400">{previewSpell.healing}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <Card className="bg-red-900/20 border-red-500">
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-semibold text-red-400 mb-2">Issues:</h4>
                    <ul className="space-y-1 text-sm text-red-300">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Create Button */}
              <Button
                onClick={handleCreateSpell}
                disabled={errors.length > 0 || !spellName.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                Create Spell
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
