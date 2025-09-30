import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { Item, InventorySlot, Equipment, EquipmentSlot } from '../../types/GameTypes';

interface InventoryProps {
  onClose: () => void;
}

export function Inventory({ onClose }: InventoryProps) {
  const [inventory, setInventory] = useState<InventorySlot[]>([]);
  const [equipment, setEquipment] = useState<Equipment>({
    weapon: null,
    armor: null,
    helmet: null,
    boots: null,
    accessory1: null,
    accessory2: null
  });
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [weight, setWeight] = useState({ current: 0, max: 100 });

  // Mock data - in real implementation this would come from game engine
  useEffect(() => {
    // Initialize with some sample items
    const sampleInventory: InventorySlot[] = Array(30).fill(null).map((_, index) => {
      if (index < 5) {
        return {
          item: {
            id: `item_${index}`,
            name: `Sample Item ${index + 1}`,
            description: 'A sample item for testing',
            type: 'consumable',
            rarity: 'common',
            value: 25,
            weight: 1
          },
          quantity: Math.floor(Math.random() * 5) + 1
        };
      }
      return { item: null, quantity: 0 };
    });
    
    setInventory(sampleInventory);
    setWeight({ current: 25, max: 100 });
  }, []);

  const handleUseItem = (item: Item) => {
    console.log('Using item:', item.name);
    // Implementation would call game engine
  };

  const handleEquipItem = (item: Item) => {
    console.log('Equipping item:', item.name);
    // Implementation would call game engine
  };

  const handleUnequipItem = (slot: EquipmentSlot) => {
    console.log('Unequipping from slot:', slot);
    // Implementation would call game engine
  };

  const handleSellItem = (item: Item) => {
    console.log('Selling item:', item.name);
    // Implementation would call game engine
  };

  const getRarityColor = (rarity: string): string => {
    const colors = {
      common: 'bg-gray-500',
      uncommon: 'bg-green-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-orange-500'
    };
    return colors[rarity as keyof typeof colors] || 'bg-gray-500';
  };

  const getItemIcon = (type: string): string => {
    const icons = {
      weapon: '⚔️',
      armor: '🛡️',
      accessory: '💍',
      consumable: '🧪',
      material: '📦',
      quest: '📜'
    };
    return icons[type as keyof typeof icons] || '❓';
  };

  return (
    <div className="ui-overlay flex items-center justify-center">
      <Card className="ui-panel w-5/6 h-5/6 max-w-6xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl text-amber-300">Inventory</CardTitle>
          <Button 
            onClick={onClose}
            variant="outline"
            className="text-white border-amber-600 hover:bg-amber-600"
          >
            Close (ESC)
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 h-full overflow-hidden">
          <Tabs defaultValue="inventory" className="h-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="h-full flex gap-4">
              {/* Inventory Grid */}
              <div className="flex-1">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Items</h3>
                  <div className="text-sm text-gray-300">
                    Weight: {weight.current}/{weight.max} kg
                  </div>
                </div>
                
                <div className="grid grid-cols-6 gap-2 h-96 overflow-y-auto">
                  {inventory.map((slot, index) => (
                    <div
                      key={index}
                      className={`
                        aspect-square border-2 rounded-lg p-2 cursor-pointer transition-all
                        ${slot.item ? 'border-amber-600 bg-amber-900/20 hover:bg-amber-800/30' : 'border-gray-600 bg-gray-800/50'}
                        ${selectedItem?.id === slot.item?.id ? 'ring-2 ring-amber-400' : ''}
                      `}
                      onClick={() => setSelectedItem(slot.item)}
                    >
                      {slot.item && (
                        <div className="h-full flex flex-col items-center justify-center">
                          <div className="text-2xl mb-1">{getItemIcon(slot.item.type)}</div>
                          {slot.quantity > 1 && (
                            <Badge className="text-xs">{slot.quantity}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Item Details */}
              <div className="w-80">
                {selectedItem ? (
                  <Card className="bg-gray-800 border-gray-600">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getItemIcon(selectedItem.type)}</span>
                        <CardTitle className="text-lg text-white">{selectedItem.name}</CardTitle>
                      </div>
                      <Badge className={getRarityColor(selectedItem.rarity)}>
                        {selectedItem.rarity}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4">{selectedItem.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white">{selectedItem.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Value:</span>
                          <span className="text-yellow-400">{selectedItem.value} gold</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Weight:</span>
                          <span className="text-white">{selectedItem.weight} kg</span>
                        </div>
                      </div>

                      {selectedItem.stats && (
                        <div className="mt-4 space-y-1">
                          <h4 className="text-sm font-semibold text-green-400">Stats:</h4>
                          {Object.entries(selectedItem.stats).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between text-sm">
                              <span className="text-gray-400 capitalize">{stat}:</span>
                              <span className="text-green-400">+{value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedItem.requirements && (
                        <div className="mt-4 space-y-1">
                          <h4 className="text-sm font-semibold text-red-400">Requirements:</h4>
                          {Object.entries(selectedItem.requirements).map(([req, value]) => (
                            <div key={req} className="flex justify-between text-sm">
                              <span className="text-gray-400 capitalize">{req}:</span>
                              <span className="text-red-400">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-6 space-y-2">
                        {selectedItem.type === 'consumable' && (
                          <Button 
                            onClick={() => handleUseItem(selectedItem)}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            Use
                          </Button>
                        )}
                        
                        {(selectedItem.type === 'weapon' || selectedItem.type === 'armor' || selectedItem.type === 'accessory') && (
                          <Button 
                            onClick={() => handleEquipItem(selectedItem)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Equip
                          </Button>
                        )}
                        
                        <Button 
                          onClick={() => handleSellItem(selectedItem)}
                          variant="outline"
                          className="w-full border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
                        >
                          Sell ({Math.floor(selectedItem.value * 0.5)} gold)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center text-gray-400 mt-20">
                    Select an item to view details
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="equipment" className="h-full">
              <div className="grid grid-cols-3 gap-6 h-full">
                {/* Character Model */}
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-semibold text-white mb-4">Character</h3>
                  <div className="relative w-48 h-64 bg-gray-800 rounded-lg border-2 border-gray-600">
                    {/* Character representation */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                        👤
                      </div>
                    </div>
                    
                    {/* Equipment slots around character */}
                    <EquipmentSlotComponent 
                      slot="helmet" 
                      item={equipment.helmet}
                      className="absolute top-2 left-1/2 transform -translate-x-1/2"
                      onUnequip={handleUnequipItem}
                    />
                    <EquipmentSlotComponent 
                      slot="weapon" 
                      item={equipment.weapon}
                      className="absolute top-16 left-2"
                      onUnequip={handleUnequipItem}
                    />
                    <EquipmentSlotComponent 
                      slot="armor" 
                      item={equipment.armor}
                      className="absolute top-20 left-1/2 transform -translate-x-1/2"
                      onUnequip={handleUnequipItem}
                    />
                    <EquipmentSlotComponent 
                      slot="accessory1" 
                      item={equipment.accessory1}
                      className="absolute top-16 right-2"
                      onUnequip={handleUnequipItem}
                    />
                    <EquipmentSlotComponent 
                      slot="boots" 
                      item={equipment.boots}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                      onUnequip={handleUnequipItem}
                    />
                    <EquipmentSlotComponent 
                      slot="accessory2" 
                      item={equipment.accessory2}
                      className="absolute bottom-16 right-2"
                      onUnequip={handleUnequipItem}
                    />
                  </div>
                </div>

                {/* Equipment Stats */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-4">Equipment Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gray-800 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-sm">Combat Stats</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Spell Power:</span>
                            <span className="text-blue-400">+15</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Defense:</span>
                            <span className="text-green-400">+8</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Damage:</span>
                            <span className="text-red-400">+12</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-sm">Attribute Bonuses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Strength:</span>
                            <span className="text-red-400">+2</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Intelligence:</span>
                            <span className="text-blue-400">+8</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Dexterity:</span>
                            <span className="text-green-400">+3</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-sm">Vital Stats</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Health:</span>
                            <span className="text-red-400">+40</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Mana:</span>
                            <span className="text-blue-400">+30</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-sm">Special Effects</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 text-xs text-green-400">
                          <div>Fire damage bonus</div>
                          <div>Spell cooldown reduction</div>
                          <div>Movement speed boost</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface EquipmentSlotComponentProps {
  slot: EquipmentSlot;
  item: Item | null;
  className?: string;
  onUnequip: (slot: EquipmentSlot) => void;
}

function EquipmentSlotComponent({ slot, item, className, onUnequip }: EquipmentSlotComponentProps) {
  const getSlotIcon = (slot: EquipmentSlot): string => {
    const icons = {
      weapon: '⚔️',
      armor: '🛡️',
      helmet: '⛑️',
      boots: '👢',
      accessory1: '💍',
      accessory2: '💍'
    };
    return icons[slot];
  };

  return (
    <div className={`w-12 h-12 border-2 border-gray-600 rounded-lg bg-gray-800 flex items-center justify-center cursor-pointer hover:border-amber-600 ${className}`}>
      {item ? (
        <div 
          className="text-lg"
          onClick={() => onUnequip(slot)}
          title={`${item.name} (Click to unequip)`}
        >
          {getSlotIcon(slot)}
        </div>
      ) : (
        <div className="text-gray-600 text-lg" title={`Empty ${slot} slot`}>
          {getSlotIcon(slot)}
        </div>
      )}
    </div>
  );
}
