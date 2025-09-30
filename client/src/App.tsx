import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameUI } from './components/ui/GameUI';
import { MainMenu } from './components/ui/MainMenu';
import { useGame } from './lib/stores/useGame';
import '@fontsource/inter';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { phase } = useGame();
  const [gameInitialized, setGameInitialized] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(canvasRef.current);
      gameEngineRef.current.initialize().then(() => {
        setGameInitialized(true);
        console.log('Game engine initialized');
      });
    }

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      backgroundColor: '#000'
    }}>
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          backgroundColor: '#2a1810'
        }}
      />
      
      {gameInitialized && (
        <>
          {phase === 'ready' && <MainMenu />}
          {phase === 'playing' && <GameUI />}
        </>
      )}
    </div>
  );
}

export default App;
