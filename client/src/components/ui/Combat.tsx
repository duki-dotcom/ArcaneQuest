import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Progress } from './progress';
import { Badge } from './badge';
import { Spell, Enemy } from '../../types/GameTypes';

interface CombatProps {
  isVisible?: boolean;
}

export function Combat({ isVisible = true }: CombatProps) {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<Spell[]>([]);
  const [spellCooldowns, setSpellCooldowns] = useState<Map<string, number>>(new Map());
  const [playerMana, setPlayerMana] = useState({ current: 85, max: 120 });
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [isInCombat, setIsInCombat] = useState(false);

  // Mock combat data - in real implementation this would come from game engine
  useEffect(() => {
    // Sample enemies for demonstration
    const sampleEnemies: Enemy[] = [
      {
        id: 'goblin_1',
        name: 'Goblin Warrior',
        level: 3,
        health: 45,
        maxHealth: 60,
        mana: 10,
        maxMana: 10,
        strength: 8,
        intelligence: 4,
        dexterity: 12,
        experience: 25,
        gold: 15,
        loot: ['crystal_shard'],
        spells: [],
        aiType: 'aggressive'
      },
      {
        id: 'skeleton_1',
        name: 'Skeleton Mage',
        level: 5,
        health: 50,
        maxHealth: 60,
        mana: 40,
        maxMana: 80,
        strength: 6,
        intelligence: 18,
        dexterity: 12,
        experience: 60,
        gold: 40,
        loot: ['mana_potion', 'apprentice_wand'],
        spells: ['fireball', 'ice_shield'],
        aiType: 'defensive'
      }
    ];

    // Sample spells
    const sampleSpells: Spell[] = [
      {
        id: 'fireball',
        name: 'Fireball',
        description: 'Launches a blazing orb',
        school: 'fire',
        manaCost: 15,
        cooldown: 2.0,
        damage: 40,
        effects: [{ type: 'damage', value: 40, target: 'enemy' }]
      },
      {
        id: 'heal',
        name: 'Heal',
        description: 'Restores health',
        school: 'healing',
        manaCost: 10,
        cooldown: 1.0,
        healing: 40,
        effects: [{ type: 'healing', value: 40, target: 'self' }]
      },
      {
        id: 'lightning',
        name: 'Lightning Bolt',
        description: 'Strikes with thunder',
        school: 'lightning',
        manaCost: 18,
        cooldown: 2.5,
        damage: 50,
        effects: [{ type: 'damage', value: 50, target: 'enemy' }]
      },
      {
        id: 'ice_shield',
        name: 'Ice Shield',
        description: 'Protective barrier',
        school: 'ice',
        manaCost: 20,
        cooldown: 10.0,
        effects: [{ type: 'buff', value: 50, duration: 30, target: 'self' }]
      }
    ];

    setEnemies(sampleEnemies);
    setSelectedSpells(sampleSpells);
    setIsInCombat(sampleEnemies.length > 0);

    // Initial combat log
    setCombatLog([
      'Combat begins!',
      `${sampleEnemies.length} enemies detected`
    ]);

    // Mock cooldowns
    const mockCooldowns = new Map();
    mockCooldowns.set('fireball', 0.8);
    setSpellCooldowns(mockCooldowns);

    // Update cooldowns over time
    const interval = setInterval(() => {
      setSpellCooldowns(prev => {
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
  }, []);

  const handleCastSpell = (spell: Spell, targetId?: string) => {
    if (spellCooldowns.has(spell.id)) {
      addToCombatLog(`${spell.name} is on cooldown`);
      return;
    }

    if (playerMana.current < spell.manaCost) {
      addToCombatLog('Not enough mana');
      return;
    }

    // Apply spell effects
    if (spell.effects.some(e => e.type === 'damage') && targetId) {
      const target = enemies.find(e => e.id === targetId);
      if (target) {
        const damage = spell.damage || 0;
        setEnemies(prev => prev.map(enemy => 
          enemy.id === targetId 
            ? { ...enemy, health: Math.max(0, enemy.health - damage) }
            : enemy
        ));
        addToCombatLog(`Cast ${spell.name} on ${target.name} for ${damage} damage`);
      }
    } else if (spell.effects.some(e => e.type === 'healing')) {
      // Heal player (mock)
      addToCombatLog(`Cast ${spell.name} - restored ${spell.healing} health`);
    } else if (spell.effects.some(e => e.type === 'buff')) {
      addToCombatLog(`Cast ${spell.name} - applied protective buff`);
    }

    // Update mana and cooldown
    setPlayerMana(prev => ({
      ...prev,
      current: Math.max(0, prev.current - spell.manaCost)
    }));
    setSpellCooldowns(prev => new Map(prev).set(spell.id, spell.cooldown));
    setSelectedTarget(null);
  };

  const handleMeleeAttack = (targetId: string) => {
    const target = enemies.find(e => e.id === targetId);
    if (target) {
      const damage = 25; // Mock melee damage
      setEnemies(prev => prev.map(enemy => 
        enemy.id === targetId 
          ? { ...enemy, health: Math.max(0, enemy.health - damage) }
          : enemy
      ));
      addToCombatLog(`Melee attack on ${target.name} for ${damage} damage`);
    }
  };

  const addToCombatLog = (message: string) => {
    setCombatLog(prev => [...prev.slice(-9), message]); // Keep last 10 messages
  };

  const getEnemyHealthPercent = (enemy: Enemy): number => {
    return (enemy.health / enemy.maxHealth) * 100;
  };

  const getEnemyManaPercent = (enemy: Enemy): number => {
    return (enemy.mana / enemy.maxMana) * 100;
  };

  const getSpellIcon = (school: string): string => {
    const icons = {
      fire: '🔥',
      ice: '❄️',
      lightning: '⚡',
      healing: '💚',
      buff: '🛡️',
      debuff: '💀',
      arcane: '🔮'
    };
    return icons[school as keyof typeof icons] || '✨';
  };

  const getEnemyTypeIcon = (name: string): string => {
    if (name.toLowerCase().includes('goblin')) return '👹';
    if (name.toLowerCase().includes('skeleton')) return '💀';
    if (name.toLowerCase().includes('orc')) return '🧌';
    if (name.toLowerCase().includes('spider')) return '🕷️';
    if (name.toLowerCase().includes('dragon')) return '🐉';
    return '👾';
  };

  // Don't render if not in combat or not visible
  if (!isVisible || !isInCombat || enemies.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
      <div className="grid grid-cols-3 gap-4">
        {/* Enemy List */}
        <Card className="ui-panel">
          <CardHeader>
            <CardTitle className="text-lg text-red-300">Enemies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-48 overflow-y-auto">
            {enemies.map((enemy) => (
              <div
                key={enemy.id}
                className={`
                  p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${selectedTarget === enemy.id 
                    ? 'border-red-500 bg-red-900/30' 
                    : 'border-gray-600 bg-gray-800/50 hover:border-red-400'
                  }
                  ${enemy.health <= 0 ? 'opacity-50 pointer-events-none' : ''}
                `}
                onClick={() => setSelectedTarget(enemy.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getEnemyTypeIcon(enemy.name)}</span>
                    <span className="text-white font-medium">{enemy.name}</span>
                    <Badge variant="outline" className="text-xs">
                      Lv.{enemy.level}
                    </Badge>
                  </div>
                </div>

                {/* Health Bar */}
                <div className="mb-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-red-300">HP</span>
                    <span className="text-white">{enemy.health}/{enemy.maxHealth}</span>
                  </div>
                  <Progress value={getEnemyHealthPercent(enemy)} className="h-2" />
                </div>

                {/* Mana Bar (if enemy has mana) */}
                {enemy.maxMana > 0 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-300">MP</span>
                      <span className="text-white">{enemy.mana}/{enemy.maxMana}</span>
                    </div>
                    <Progress value={getEnemyManaPercent(enemy)} className="h-2" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-1 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-red-500 text-red-400 hover:bg-red-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMeleeAttack(enemy.id);
                    }}
                    disabled={enemy.health <= 0}
                  >
                    Attack
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Spells */}
        <Card className="ui-panel">
          <CardHeader>
            <CardTitle className="text-lg text-blue-300">Combat Spells</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-48 overflow-y-auto">
            {selectedSpells.map((spell) => {
              const isOnCooldown = spellCooldowns.has(spell.id);
              const canCast = playerMana.current >= spell.manaCost && !isOnCooldown;
              const needsTarget = spell.effects.some(e => e.target === 'enemy' || e.target === 'area');
              const cooldownProgress = isOnCooldown 
                ? ((spell.cooldown - (spellCooldowns.get(spell.id) || 0)) / spell.cooldown) * 100
                : 100;

              return (
                <div
                  key={spell.id}
                  className={`
                    p-2 rounded border transition-all
                    ${canCast 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-gray-600 bg-gray-800/50 opacity-60'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getSpellIcon(spell.school)}</span>
                      <span className="text-white text-sm font-medium">{spell.name}</span>
                    </div>
                    <div className="flex gap-1 text-xs">
                      <span className={playerMana.current >= spell.manaCost ? 'text-blue-400' : 'text-red-400'}>
                        {spell.manaCost}MP
                      </span>
                      {spell.damage && <span className="text-red-400">{spell.damage}DMG</span>}
                      {spell.healing && <span className="text-green-400">{spell.healing}HEAL</span>}
                    </div>
                  </div>

                  {isOnCooldown && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-400 mb-1">
                        Cooldown: {(spellCooldowns.get(spell.id) || 0).toFixed(1)}s
                      </div>
                      <Progress value={cooldownProgress} className="h-1" />
                    </div>
                  )}

                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    disabled={!canCast || (needsTarget && !selectedTarget)}
                    onClick={() => handleCastSpell(spell, selectedTarget || undefined)}
                  >
                    {needsTarget && !selectedTarget ? 'Select Target' : 'Cast'}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Combat Log */}
        <Card className="ui-panel">
          <CardHeader>
            <CardTitle className="text-lg text-amber-300">Combat Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-48 overflow-y-auto text-sm">
              {combatLog.map((message, index) => (
                <div
                  key={index}
                  className={`
                    ${message.includes('damage') ? 'text-red-300' : ''}
                    ${message.includes('heal') || message.includes('restored') ? 'text-green-300' : ''}
                    ${message.includes('buff') || message.includes('shield') ? 'text-blue-300' : ''}
                    ${!message.includes('damage') && !message.includes('heal') && !message.includes('buff') ? 'text-gray-300' : ''}
                  `}
                >
                  {message}
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-green-500 text-green-400 hover:bg-green-900/20"
                  onClick={() => addToCombatLog('Used health potion')}
                >
                  Use Potion
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-yellow-500 text-yellow-400 hover:bg-yellow-900/20"
                  onClick={() => {
                    setIsInCombat(false);
                    addToCombatLog('Attempted to flee!');
                  }}
                >
                  Flee
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player Mana Bar */}
      <Card className="ui-panel mt-4">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <span className="text-blue-300 font-medium">Mana</span>
            <span className="text-white">{playerMana.current}/{playerMana.max}</span>
          </div>
          <Progress 
            value={(playerMana.current / playerMana.max) * 100} 
            className="h-3 mt-2"
          />
        </CardContent>
      </Card>
    </div>
  );
}
