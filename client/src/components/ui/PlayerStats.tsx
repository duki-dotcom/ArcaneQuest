import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './card';
import { PlayerStats as PlayerStatsType } from '../../types/GameTypes';

export function PlayerStats() {
  const [stats, setStats] = useState<PlayerStatsType>({
    level: 1,
    experience: 0,
    experienceToNext: 100,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    strength: 10,
    intelligence: 10,
    dexterity: 10,
    availablePoints: 0,
    gold: 100
  });

  // Mock data update - in real implementation this would come from game engine
  useEffect(() => {
    const interval = setInterval(() => {
      // This would be replaced with actual game state updates
      setStats(prevStats => ({
        ...prevStats,
        // Mock some stat changes for demonstration
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const healthPercent = (stats.health / stats.maxHealth) * 100;
  const manaPercent = (stats.mana / stats.maxMana) * 100;
  const expPercent = (stats.experience / stats.experienceToNext) * 100;

  return (
    <Card className="ui-panel absolute top-4 left-4 w-64">
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Level and Gold */}
          <div className="flex justify-between items-center">
            <span className="text-amber-300 font-bold">Level {stats.level}</span>
            <span className="text-yellow-400">{stats.gold} Gold</span>
          </div>

          {/* Health Bar */}
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-red-300">Health</span>
              <span>{stats.health}/{stats.maxHealth}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="health-bar h-2 rounded-full transition-all duration-300"
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>

          {/* Mana Bar */}
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-300">Mana</span>
              <span>{stats.mana}/{stats.maxMana}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="mana-bar h-2 rounded-full transition-all duration-300"
                style={{ width: `${manaPercent}%` }}
              />
            </div>
          </div>

          {/* Experience Bar */}
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-green-300">Experience</span>
              <span>{stats.experience}/{stats.experienceToNext}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="exp-bar h-2 rounded-full transition-all duration-300"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-sm pt-2 border-t border-gray-600">
            <div className="text-center">
              <div className="text-red-300">STR</div>
              <div className="font-bold">{stats.strength}</div>
            </div>
            <div className="text-center">
              <div className="text-blue-300">INT</div>
              <div className="font-bold">{stats.intelligence}</div>
            </div>
            <div className="text-center">
              <div className="text-green-300">DEX</div>
              <div className="font-bold">{stats.dexterity}</div>
            </div>
          </div>

          {/* Available Points */}
          {stats.availablePoints > 0 && (
            <div className="text-center text-yellow-400 font-bold pt-2 border-t border-gray-600">
              {stats.availablePoints} Stat Points Available!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
