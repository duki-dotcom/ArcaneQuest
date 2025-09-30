import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { Progress } from './progress';
import { Spell, SpellSchool } from '../../types/GameTypes';
import { SpellCreator } from './SpellCreator';

interface SpellBookProps {
  onClose: () => void;
}

export function SpellBook({ onClose }: SpellBookProps) {
  const [knownSpells, setKnownSpells] = useState<Spell[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [cooldowns, setCooldowns] = useState<Map<string, number>>(new Map());
  const [playerMana, setPlayerMana] = useState({ current: 80, max: 120 });
  const [showSpellCreator, setShowSpellCreator] = useState(false);
  const [playerLevel, setPlayerLevel] = useState(12);
  const [canCreateSpells, setCanCreateSpells] = useState(false);
  const [filterSchool, setFilterSchool] = useState<SpellSchool | 'all'>('all');

  // Mock data - in real implementation this would come from game engine
  useEffect(() => {
    const sampleSpells: Spell[] = [
      {
        id: 'fireball',
        name: 'Fireball',
        description: 'Launches a blazing orb that explodes on impact',
        school: 'fire',
        manaCost: 15,
        cooldown: 2.0,
        damage: 40,
        effects: [{ type: 'damage', value: 40, target: 'enemy' }]
      },
      {
        id: 'heal',
        name: 'Heal',
        description: 'Restores health with divine energy',
        school: 'healing',
        manaCost: 10,
        cooldown: 1.0,
        healing: 40,
        effects: [{ type: 'healing', value: 40, target: 'self' }]
      },
      {
        id: 'lightning',
        name: 'Lightning Bolt',
        description: 'Strikes with the power of thunder',
        school: 'lightning',
        manaCost: 18,
        cooldown: 2.5,
        damage: 50,
        effects: [{ type: 'damage', value: 50, target: 'enemy' }]
      },
      {
        id: 'ice_shield',
        name: 'Ice Shield',
        description: 'Creates a protective barrier of ice',
        school: 'ice',
        manaCost: 20,
        cooldown: 10.0,
        effects: [{ type: 'buff', value: 50, duration: 30, target: 'self' }]
      },
      {
        id: 'custom_fire_blast',
        name: 'Inferno Burst',
        description: 'A custom spell that deals fire damage in a cone pattern with major intensity.',
        school: 'fire',
        manaCost: 35,
        cooldown: 4.0,
        damage: 75,
        effects: [{ type: 'damage', value: 75, target: 'area' }],
        isCustom: true,
        components: [
          { type: 'element', value: 'fire', modifier: 2 },
          { type: 'shape', value: 'cone', modifier: 1.5 },
          { type: 'power', value: 'major', modifier: 1.5 },
          { type: 'effect', value: 'damage', modifier: 1 }
        ]
      }
    ];
    
    setKnownSpells(sampleSpells);
    setCanCreateSpells(playerLevel >= 10);

    // Mock cooldowns
    const mockCooldowns = new Map();
    mockCooldowns.set('fireball', 1.2);
    mockCooldowns.set('lightning', 0.8);
    setCooldowns(mockCooldowns);

    // Update cooldowns over time
    const interval = setInterval(() => {
      setCooldowns(prev => {
        const updated = new Map(prev);
        for (const [spellId, timeLeft] of updated.entries()) {
          const newTime = Math.max(0, timeLeft - 0.1);
          if (newTime <= 0) {
            updated.delete(spellId);
          } else {
            updated.set(spellId, newTime);
          }
        }
        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [playerLevel]);

  const handleCastSpell = (spell: Spell) => {
    if (cooldowns.has(spell.id)) {
      console.log(`${spell.name} is on cooldown`);
      return;
    }

    if (playerMana.current < spell.manaCost) {
      console.log('Not enough mana');
      return;
    }

    // Cast spell logic
    console.log(`Casting ${spell.name}`);
    
    // Update mana
    setPlayerMana(prev => ({
      ...prev,
      current: Math.max(0, prev.current - spell.manaCost)
    }));

    // Set cooldown
    setCooldowns(prev => new Map(prev).set(spell.id, spell.cooldown));
  };

  const getSchoolColor = (school: SpellSchool): string => {
    const colors = {
      fire: 'bg-red-500',
      ice: 'bg-blue-500',
      lightning: 'bg-yellow-500',
      healing: 'bg-green-500',
      buff: 'bg-purple-500',
      debuff: 'bg-orange-500',
      arcane: 'bg-indigo-500'
    };
    return colors[school] || 'bg-gray-500';
  };

  const getSchoolIcon = (school: SpellSchool): string => {
    const icons = {
      fire: '🔥',
      ice: '❄️',
      lightning: '⚡',
      healing: '💚',
      buff: '🛡️',
      debuff: '💀',
      arcane: '🔮'
    };
    return icons[school] || '✨';
  };

  const filteredSpells = filterSchool === 'all' 
    ? knownSpells 
    : knownSpells.filter(spell => spell.school === filterSchool);

  const spellsBySchool = knownSpells.reduce((acc, spell) => {
    if (!acc[spell.school]) acc[spell.school] = [];
    acc[spell.school].push(spell);
    return acc;
  }, {} as Record<SpellSchool, Spell[]>);

  if (showSpellCreator) {
    return (
      <SpellCreator 
        onClose={() => setShowSpellCreator(false)}
        onSpellCreated={(spell) => {
          setKnownSpells(prev => [...prev, spell]);
          setShowSpellCreator(false);
        }}
        playerLevel={playerLevel}
        playerIntelligence={25}
      />
    );
  }

  return (
    <div className="ui-overlay flex items-center justify-center">
      <Card className="ui-panel w-5/6 h-5/6 max-w-6xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl text-amber-300">Spell Book</CardTitle>
          <div className="flex gap-2">
            {canCreateSpells && (
              <Button 
                onClick={() => setShowSpellCreator(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Create Spell
              </Button>
            )}
            <Button 
              onClick={onClose}
              variant="outline"
              className="text-white border-amber-600 hover:bg-amber-600"
            >
              Close (ESC)
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 h-full overflow-hidden">
          <Tabs defaultValue="spells" className="h-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="spells">Known Spells</TabsTrigger>
              <TabsTrigger value="schools">Spell Schools</TabsTrigger>
            </TabsList>

            <TabsContent value="spells" className="h-full flex gap-4">
              {/* Spell Filters */}
              <div className="w-48">
                <h3 className="text-lg font-semibold text-white mb-4">Filter by School</h3>
                <div className="space-y-2">
                  <Button
                    variant={filterSchool === 'all' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setFilterSchool('all')}
                  >
                    All Spells ({knownSpells.length})
                  </Button>
                  {Object.entries(spellsBySchool).map(([school, spells]) => (
                    <Button
                      key={school}
                      variant={filterSchool === school ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setFilterSchool(school as SpellSchool)}
                    >
                      {getSchoolIcon(school as SpellSchool)} {school} ({spells.length})
                    </Button>
                  ))}
                </div>

                {/* Mana Display */}
                <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <h4 className="text-sm font-semibold text-blue-300 mb-2">Current Mana</h4>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{playerMana.current}</span>
                    <span>{playerMana.max}</span>
                  </div>
                  <Progress 
                    value={(playerMana.current / playerMana.max) * 100} 
                    className="h-3"
                  />
                </div>
              </div>

              {/* Spell List */}
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-4 h-96 overflow-y-auto">
                  {filteredSpells.map((spell) => {
                    const isOnCooldown = cooldowns.has(spell.id);
                    const canCast = playerMana.current >= spell.manaCost && !isOnCooldown;
                    const cooldownProgress = isOnCooldown 
                      ? ((spell.cooldown - (cooldowns.get(spell.id) || 0)) / spell.cooldown) * 100
                      : 100;

                    return (
                      <Card
                        key={spell.id}
                        className={`
                          cursor-pointer transition-all border-2
                          ${canCast 
                            ? 'border-amber-600 bg-amber-900/20 hover:bg-amber-800/30' 
                            : 'border-gray-600 bg-gray-800/50 opacity-60'
                          }
                          ${selectedSpell?.id === spell.id ? 'ring-2 ring-amber-400' : ''}
                        `}
                        onClick={() => setSelectedSpell(spell)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{getSchoolIcon(spell.school)}</span>
                            <Badge className={getSchoolColor(spell.school)}>
                              {spell.school}
                            </Badge>
                          </div>
                          <CardTitle className="text-sm text-white">{spell.name}</CardTitle>
                          {spell.isCustom && (
                            <Badge variant="outline" className="text-purple-400 border-purple-400">
                              Custom
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Mana:</span>
                              <span className={playerMana.current >= spell.manaCost ? 'text-blue-400' : 'text-red-400'}>
                                {spell.manaCost}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Cooldown:</span>
                              <span className="text-white">{spell.cooldown}s</span>
                            </div>
                            {spell.damage && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Damage:</span>
                                <span className="text-red-400">{spell.damage}</span>
                              </div>
                            )}
                            {spell.healing && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Healing:</span>
                                <span className="text-green-400">{spell.healing}</span>
                              </div>
                            )}
                          </div>

                          {isOnCooldown && (
                            <div className="mt-2">
                              <div className="text-xs text-gray-400 mb-1">
                                Cooldown: {(cooldowns.get(spell.id) || 0).toFixed(1)}s
                              </div>
                              <Progress value={cooldownProgress} className="h-2" />
                            </div>
                          )}

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCastSpell(spell);
                            }}
                            disabled={!canCast}
                            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            size="sm"
                          >
                            Cast Spell
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Spell Details */}
              <div className="w-80">
                {selectedSpell ? (
                  <Card className="bg-gray-800 border-gray-600">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{getSchoolIcon(selectedSpell.school)}</span>
                        <div>
                          <CardTitle className="text-lg text-white">{selectedSpell.name}</CardTitle>
                          <Badge className={getSchoolColor(selectedSpell.school)}>
                            {selectedSpell.school}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4">{selectedSpell.description}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold text-amber-300 mb-2">Spell Properties</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Mana Cost:</span>
                              <span className="text-blue-400">{selectedSpell.manaCost}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Cooldown:</span>
                              <span className="text-white">{selectedSpell.cooldown}s</span>
                            </div>
                            {selectedSpell.damage && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Damage:</span>
                                <span className="text-red-400">{selectedSpell.damage}</span>
                              </div>
                            )}
                            {selectedSpell.healing && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Healing:</span>
                                <span className="text-green-400">{selectedSpell.healing}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-amber-300 mb-2">Effects</h4>
                          <div className="space-y-1 text-sm">
                            {selectedSpell.effects.map((effect, index) => (
                              <div key={index} className="flex justify-between">
                                <span className="text-gray-400 capitalize">{effect.type}:</span>
                                <span className="text-white">
                                  {effect.value} 
                                  {effect.duration && ` (${effect.duration}s)`}
                                  {` → ${effect.target}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {selectedSpell.isCustom && selectedSpell.components && (
                          <div>
                            <h4 className="text-sm font-semibold text-purple-300 mb-2">Components</h4>
                            <div className="space-y-1 text-sm">
                              {selectedSpell.components.map((component, index) => (
                                <div key={index} className="flex justify-between">
                                  <span className="text-gray-400 capitalize">{component.type}:</span>
                                  <span className="text-purple-400">
                                    {component.value} (×{component.modifier})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center text-gray-400 mt-20">
                    Select a spell to view details
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="schools" className="h-full">
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(spellsBySchool).map(([school, spells]) => (
                  <Card key={school} className="bg-gray-800 border-gray-600">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getSchoolIcon(school as SpellSchool)}</span>
                        <CardTitle className="text-lg text-white capitalize">{school}</CardTitle>
                        <Badge className={getSchoolColor(school as SpellSchool)}>
                          {spells.length} spells
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {spells.map(spell => (
                          <div key={spell.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                            <span className="text-white text-sm">{spell.name}</span>
                            <div className="flex gap-2 text-xs">
                              <span className="text-blue-400">{spell.manaCost}MP</span>
                              {spell.damage && <span className="text-red-400">{spell.damage}DMG</span>}
                              {spell.healing && <span className="text-green-400">{spell.healing}HEAL</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
