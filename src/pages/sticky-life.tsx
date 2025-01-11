import React, { useState, useEffect, useRef } from 'react';
// import { Upload, Download } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface Coin {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

interface Spike {
  id: number;
  x: number;
  y: number;
}

interface KeysPressed {
  [key: string]: boolean;
}

interface GameState {
  playerPos: Position;
  velocity: Velocity;
  isJumping: boolean;
  facingRight: boolean;
  isRunning: boolean;
  currentMap: string | null;
  coins: Coin[];
  spikes: Spike[];
  score: number;
  lives: number;
  gameOver: boolean;
  lastGroundTime: number;
  canJump: boolean;
}

// Game constants
const GRAVITY: number = 0.5;
const JUMP_FORCE: number = -13;
const MOVE_SPEED: number = 2;
const FRICTION: number = 0.85;
const INITIAL_LIVES: number = 3;
const COIN_VALUE: number = 10;
const COLLISION_THRESHOLD: number = 20;
const MAX_FALL_SPEED: number = 12;

const generateRandomPlatforms = (): string => {
  const platforms = [];
  const platformCount = Math.floor(Math.random() * 4) + 5; // 5 to 8 platforms
  const minVerticalSpacing = 60; // Minimum vertical spacing between platforms
  const maxVerticalSpacing = 100; // Fixed maximum vertical spacing to ensure reachability

  // Main long platform at the bottom
  platforms.push('<rect x="0" y="580" width="800" height="100" fill="#3C8D2F"/>');
  platforms.push('<rect x="0" y="530" width="800" height="15" fill="#8B4513"/>');

  let lastY = 530; // Start from the top of the main platform

  for (let i = 0; i < platformCount; i++) {
    const width = 100 + Math.random() * 200;
    const x = Math.random() * (800 - width);
    const y = Math.max(100, lastY - minVerticalSpacing - Math.random() * (maxVerticalSpacing - minVerticalSpacing)); // Ensure minimum and maximum vertical spacing
    platforms.push(`<rect x="${x}" y="${y}" width="${width}" height="15" fill="#8B4513"/>`);
    lastY = y; // Update lastY to the current platform's y position
  }

  return platforms.join('');
};

const initialPlatforms = generateRandomPlatforms();

const defaultMap: string = `
  <svg viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#1E90FF"/>
        <stop offset="100%" style="stop-color:#87CEEB"/>
      </linearGradient>
    </defs>
    
    <!-- Sky background -->
    <rect width="800" height="600" fill="url(#skyGradient)"/>
    
    <!-- Platforms - these will have collision -->
    ${initialPlatforms}
    
    <!-- Decorative elements - no collision -->
    <circle cx="700" cy="80" r="30" fill="#FFD700"/>
    <path d="M 50,50 Q 75,40 100,50 T 150,50" fill="white" opacity="0.8"/>
    <path d="M 250,80 Q 275,70 300,80 T 350,80" fill="white" opacity="0.8"/>
  </svg>
`;

const StickyLife: React.FC = () => {
  // Add debug mode ref
  const debugMode = useRef(false);

  // Add reload function
  const reloadGame = () => {
   window.location.reload();
  };

  // Make both debug and reload available globally
  useEffect(() => {
    (window as any).toggleDebugMode = () => {
      debugMode.current = !debugMode.current;
      console.log(`Debug mode ${debugMode.current ? 'enabled' : 'disabled'}`);
    };
    (window as any).reloadGame = reloadGame;
    return () => {
      delete (window as any).toggleDebugMode;
      delete (window as any).reloadGame;
    };
  }, []);

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    playerPos: { x: 100, y: 50 }, // Start near top of screen
    velocity: { x: 0, y: 0 },
    isJumping: false,
    facingRight: true,
    isRunning: false,
    currentMap: null,
    coins: [],
    spikes: [],
    score: 0,
    lives: INITIAL_LIVES,
    lastGroundTime: Date.now(),
    canJump: true,
    gameOver: false
  });

  const gameRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number>();
  const keysPressed = useRef<KeysPressed>({});

  // Initialize game elements
  const initializeGameElements = (): void => {
    const platforms = initialPlatforms.match(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"/g) || [];
    const platformRects = platforms.map(platform => {
      const [, x, y, width, height] = platform.match(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"/) || [];
      return { x: parseInt(x), y: parseInt(y), width: parseInt(width), height: parseInt(height) };
    });

    const isCoinOverlapping = (coinX: number, coinY: number) => {
      return platformRects.some(platform => 
        coinX >= platform.x && coinX <= platform.x + platform.width &&
        coinY >= platform.y && coinY <= platform.y + platform.height
      );
    };

    const newCoins: Coin[] = Array.from({ length: 10 }, (_, i) => {
      let x, y;
      do {
        x = 100 + Math.random() * 600;
        y = 50 + Math.random() * 300; // Raise the lowest point for coins
      } while (isCoinOverlapping(x, y));
      return { id: i, x, y, collected: false };
    });

    const newSpikes: Spike[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 150 + Math.random() * 500,
      y: 100 + Math.random() * 350 // Ensure spikes are above the bottom platform
    }));

    setGameState(prev => ({
      ...prev,
      coins: newCoins,
      spikes: newSpikes
    }));
  };

  // // Handle file upload
  // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e: ProgressEvent<FileReader>) => {
  //       setGameState(prev => ({
  //         ...prev,
  //         currentMap: e.target?.result as string,
  //         playerPos: { x: 100, y: 100 },
  //         velocity: { x: 0, y: 0 }
  //       }));
  //     };
  //     reader.readAsText(file);
  //   }
  // };

  const PLAYER_HEIGHT = 40;
  const PLAYER_WIDTH = 20;

  const checkCollision = (): { collided: boolean; groundLevel: number | null; sideHit: boolean } => {
    const svg = gameRef.current?.querySelector('svg');
    if (!svg) return { collided: false, groundLevel: null, sideHit: false };

    const platforms = Array.from(svg.querySelectorAll('rect')).filter(rect => {
      const fill = rect.getAttribute('fill');
      return fill && !fill.includes('url(#skyGradient)');
    });

    // Player hitbox
    const player = {
      left: gameState.playerPos.x,
      right: gameState.playerPos.x + PLAYER_WIDTH,
      top: gameState.playerPos.y,
      bottom: gameState.playerPos.y + PLAYER_HEIGHT,
      centerX: gameState.playerPos.x + PLAYER_WIDTH / 2,
      nextBottom: gameState.playerPos.y + PLAYER_HEIGHT + gameState.velocity.y
    };

    // Find the highest platform we're going to hit
    let platformToLandOn = null;
    let minDistance = Infinity;

    for (const platform of platforms) {
      const bbox = platform.getBBox();

      // Only check platforms we're above and falling towards
      if (player.centerX >= bbox.x && 
          player.centerX <= bbox.x + bbox.width && 
          player.bottom <= bbox.y && 
          player.nextBottom >= bbox.y) {

        const distance = bbox.y - player.bottom;
        
        if (debugMode.current) {
          console.debug('Platform check:', {
            platformY: bbox.y,
            playerBottom: player.bottom,
            distance,
            velocity: gameState.velocity.y
          });
        }

        if (distance < minDistance) {
          minDistance = distance;
          platformToLandOn = bbox.y;
        }
      }
    }

    const willLand = platformToLandOn !== null && gameState.velocity.y > 0;

    if (debugMode.current && willLand) {
      console.debug('Will land on:', platformToLandOn);
    }

    return {
      collided: willLand,
      groundLevel: platformToLandOn,
      sideHit: false
    };
  };

  // Reset game
  const resetGame = (): void => {
    setGameState({
      ...gameState,
      playerPos: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      score: 0,
      lives: INITIAL_LIVES,
      gameOver: false
    });
    initializeGameElements();
  };

  // Game loop
  useEffect(() => {
    const gameLoop = (): void => {
      if (!gameState.gameOver) {
        setGameState(prev => {
          const newState = { ...prev };

          // Handle input
          if (keysPressed.current.ArrowLeft) {
            newState.velocity.x = -MOVE_SPEED;
            newState.facingRight = false;
            newState.isRunning = true;
          } else if (keysPressed.current.ArrowRight) {
            newState.velocity.x = MOVE_SPEED;
            newState.facingRight = true;
            newState.isRunning = true;
          } else {
            newState.velocity.x = 0; // Stop moving when no key is pressed
            newState.isRunning = false;
          }

          // Only allow jumping if on ground
          if (keysPressed.current.Space && !prev.isJumping) {
            newState.velocity.y = JUMP_FORCE;
            newState.isJumping = true;
          }

          // Apply gravity before collision check
          newState.velocity.y = Math.min(MAX_FALL_SPEED, prev.velocity.y + GRAVITY);

          // Check for landing before updating position
          const { collided, groundLevel } = checkCollision();
          
          // Update position
          newState.playerPos.x += newState.velocity.x * FRICTION;
          
          if (collided && groundLevel !== null) {
            newState.playerPos.y = groundLevel - PLAYER_HEIGHT;
            newState.velocity.y = 0;
            newState.isJumping = false;
          } else {
            newState.playerPos.y += newState.velocity.y;
          }

          // Keep player in bounds
          newState.playerPos.x = Math.max(0, Math.min(newState.playerPos.x, 780));
          newState.playerPos.y = Math.max(0, Math.min(newState.playerPos.y, 560));

          // Check coin collisions
          newState.coins = prev.coins.map(coin => {
            if (!coin.collected &&
                Math.abs(prev.playerPos.x - coin.x) < COLLISION_THRESHOLD &&
                Math.abs(prev.playerPos.y - coin.y) < COLLISION_THRESHOLD) {
              newState.score += COIN_VALUE;
              return { ...coin, collected: true };
            }
            return coin;
          });

          // Check spike collisions
          prev.spikes.forEach(spike => {
            if (Math.abs(prev.playerPos.x - spike.x) < COLLISION_THRESHOLD &&
                Math.abs(prev.playerPos.y - spike.y) < COLLISION_THRESHOLD) {
              newState.lives--;
              if (newState.lives <= 0) {
                newState.gameOver = true;
              }
              
              // Reset player position to a safe location
              newState.playerPos = { x: 100, y: 100 };
              newState.velocity = { x: 0, y: 0 };
              newState.isJumping = false;
            }
          });

          return newState;
        });
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.gameOver]);

  // Check if all coins are collected
  useEffect(() => {
    if (gameState.coins.every(coin => coin.collected) && gameState.coins.length > 0) {
      setGameState(prev => ({ ...prev, gameOver: true }));
    }
  }, [gameState.coins]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.code === 'KeyR') {
        reloadGame();
        return;
      }
      // Check both e.code and e.key for Space
      if (e.code === 'Space' || e.key === ' ') {
        keysPressed.current.Space = true;
        return;
      }
      keysPressed.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent): void => {
      // Check both e.code and e.key for Space
      if (e.code === 'Space' || e.key === ' ') {
        keysPressed.current.Space = false;
        return;
      }
      keysPressed.current[e.code] = false;
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        setGameState(prev => ({ ...prev, isRunning: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize game elements when map changes
  useEffect(() => {
    if (!gameState.gameOver) {
      initializeGameElements();
    }
  }, [gameState.currentMap, gameState.gameOver]);

  return (
    <div className="relative w-full h-screen bg-gray-900 flex flex-col items-center justify-center">
      <div 
        ref={gameRef}
        className="relative w-[800px] h-[600px] bg-gray-800 overflow-hidden"
      >
        {/* Map */}
        <div dangerouslySetInnerHTML={{ __html: gameState.currentMap || defaultMap }} />

        {/* Stick Figure */}
        <div
          className="absolute transition-transform"
          style={{
            left: gameState.playerPos.x,
            top: gameState.playerPos.y,
            transform: `scaleX(${gameState.facingRight ? 1 : -1})`
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="10" r="6" stroke="white" fill="none" strokeWidth="2" />
            <line x1="20" y1="16" x2="20" y2="30" stroke="white" strokeWidth="2" />
            <line 
              x1="20" y1="20" x2="12" y2={gameState.isRunning ? (Math.sin(Date.now() / 100) * 4 + 24) : "24"} 
              stroke="white" strokeWidth="2" 
            />
            <line 
              x1="20" y1="20" x2="28" y2={gameState.isRunning ? (Math.sin(Date.now() / 100 + Math.PI) * 4 + 24) : "24"} 
              stroke="white" strokeWidth="2" 
            />
            <line 
              x1="20" y1="30" x2="12" y2={gameState.isRunning ? (Math.sin(Date.now() / 100 + Math.PI) * 4 + 36) : "36"} 
              stroke="white" strokeWidth="2" 
            />
            <line 
              x1="20" y1="30" x2="28" y2={gameState.isRunning ? (Math.sin(Date.now() / 100) * 4 + 36) : "36"} 
              stroke="white" strokeWidth="2" 
            />
          </svg>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          {/*
          <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2">
            <Upload size={20} />
            Upload Map
            <input
              type="file"
              accept=".svg"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={() => {
              const svgBlob = new Blob([(gameState.currentMap || defaultMap)], { type: 'image/svg+xml' });
              const downloadLink = document.createElement('a');
              downloadLink.href = URL.createObjectURL(svgBlob);
              downloadLink.download = 'platform-map.svg';
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              URL.revokeObjectURL(downloadLink.href);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download size={20} />
            Download Map
          </button>
          */}
          <button
            onClick={reloadGame}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            Reload Game
          </button>
        </div>

        {/* Game UI */}
        <div className="absolute top-4 left-4 flex gap-4">
          <div className="bg-blue-500 px-4 py-2 rounded-lg text-white">
            Score: {gameState.score}
          </div>
          <div className="bg-red-500 px-4 py-2 rounded-lg text-white">
            Lives: {Array(gameState.lives).fill('❤️').join('')}
          </div>
        </div>

        {/* Coins */}
        {gameState.coins.map(coin => !coin.collected && (
          <div
            key={coin.id}
            className="absolute w-6 h-6 animate-bounce"
            style={{
              left: coin.x,
              top: coin.y,
              transition: 'transform 0.2s'
            }}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#FFD700" />
              <circle cx="12" cy="12" r="8" fill="#DAA520" />
              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12">$</text>
            </svg>
          </div>
        ))}

        {/* Spikes */}
        {gameState.spikes.map(spike => (
          <div
            key={spike.id}
            className="absolute"
            style={{
              left: spike.x,
              top: spike.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M12 2 L22 22 L12 18 L2 22 Z"
                fill="#FF4444"
                stroke="#AA0000"
                strokeWidth="1"
              />
            </svg>
          </div>
        ))}

        {/* Title */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 text-shadow-lg">
            StickyLife
          </h1>
          <p className="text-blue-300">Stick around, collect coins, survive!</p>
        </div>

        {/* Game Over Screen */}
        {gameState.gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg text-center">
              {gameState.coins.every(coin => coin.collected) ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">YOU WIN!</h2>
                  <div className="fireworks">
                    {/* Fireworks SVG or animation can be added here */}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4">Stick No More!</h2>
                  <p className="mb-4">Final Score: {gameState.score}</p>
                </>
              )}
              <button
                onClick={resetGame}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-gray-300 text-center">
        <p>🏃‍♂️ Arrow Keys to run • Space to jump</p>
        <p>💰 Collect golden coins • ⚠️ Avoid deadly spikes</p>
        <p>🎮 Create your own world with custom SVG maps!</p>
      </div>
    </div>
  );
};

export default StickyLife;