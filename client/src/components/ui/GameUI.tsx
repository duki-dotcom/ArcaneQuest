import React, { useState, useEffect } from 'react';
import { PlayerStats } from './PlayerStats';
import { Inventory } from './Inventory';
import { SpellBook } from './SpellBook';
import { Combat } from './Combat';

export function GameUI() {
  const [showInventory, setShowInventory] = useState(false);
  const [showSpellBook, setShowSpellBook] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyI':
        case 'Tab':
          event.preventDefault();
          setShowInventory(!showInventory);
          setShowSpellBook(false);
          break;
        case 'KeyM':
        case 'KeyB':
          event.preventDefault();
          setShowSpellBook(!showSpellBook);
          setShowInventory(false);
          break;
        case 'Escape':
          setShowInventory(false);
          setShowSpellBook(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInventory, showSpellBook]);

  return (
    <div className="ui-overlay">
      {/* Always visible UI */}
      <PlayerStats />
      
      {/* Combat UI - shown when in combat */}
      <Combat />
      
      {/* Modal UIs */}
      {showInventory && (
        <Inventory onClose={() => setShowInventory(false)} />
      )}
      
      {showSpellBook && (
        <SpellBook onClose={() => setShowSpellBook(false)} />
      )}
      
      {/* Quick action hints */}
      <div className="absolute bottom-4 right-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
        <div>I - Inventory</div>
        <div>M - Spells</div>
        <div>ESC - Close</div>
      </div>
    </div>
  );
}
