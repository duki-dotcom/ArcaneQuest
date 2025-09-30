import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { useGame } from '../../lib/stores/useGame';

export function MainMenu() {
  const { start } = useGame();

  const handleNewGame = () => {
    console.log('Starting new game...');
    start();
  };

  const handleLoadGame = () => {
    console.log('Loading game...');
    // TODO: Implement load game functionality
    start();
  };

  return (
    <div className="ui-overlay flex items-center justify-center">
      <Card className="ui-panel w-96">
        <CardHeader>
          <CardTitle className="text-center text-3xl text-amber-300">
            Mystic Realms RPG
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-lg text-gray-300 mb-6">
            An Expansive Magical Adventure
          </div>
          
          <Button
            onClick={handleNewGame}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            New Game
          </Button>
          
          <Button
            onClick={handleLoadGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Load Game
          </Button>
          
          <div className="text-center text-sm text-gray-400 mt-6">
            <div>Controls:</div>
            <div>WASD/Arrow Keys - Move</div>
            <div>J/Left Click - Attack</div>
            <div>K/Right Click - Cast Spell</div>
            <div>I/Tab - Inventory</div>
            <div>M/B - Spell Book</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
