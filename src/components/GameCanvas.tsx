import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { CanvasRenderer } from '../game/canvasRenderer';
import { GameState } from '../types/game';
import { soundManager } from '../utils/audio';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Bug, 
  Sliders, 
  Pause, 
  ChevronLeft, 
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface GameCanvasProps {
  onEngineReady?: (engine: GameEngine) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onEngineReady }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  const [gameState, setGameState] = useState<GameState>('menu');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [showPhysicsPanel, setShowPhysicsPanel] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);

  // Drag interaction state
  const isDragging = useRef<boolean>(false);
  const lastDragX = useRef<number>(0);

  // Initialize engine and canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = new GameEngine();
    const renderer = new CanvasRenderer(ctx, engine);

    engineRef.current = engine;
    rendererRef.current = renderer;
    onEngineReady?.(engine);

    engine.onStateChange = (state) => {
      setGameState(state);
      setScore(engine.stats.score);
      setHighScore(engine.stats.highScore);
    };

    engine.onMilestone = (msg) => {
      setNotification(msg);
      setTimeout(() => setNotification(null), 3000);
    };

    let animationFrameId: number;

    const loop = (timestamp: number) => {
      engine.update(timestamp);
      renderer.render(timestamp);
      setScore(engine.stats.score);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    // Keyboard listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      engine.handleKeyDown(e.code);
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (engine.state === 'playing') engine.pauseGame();
        else if (engine.state === 'paused') engine.resumeGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.handleKeyUp(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onEngineReady]);

  // Handle Mute toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  // Handle Debug toggle
  const toggleDebug = () => {
    const next = !showDebug;
    setShowDebug(next);
    if (rendererRef.current) {
      rendererRef.current.showDebug = next;
    }
  };

  // Start / Restart
  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleRestartGame = () => {
    if (engineRef.current) {
      engineRef.current.restartGame();
    }
  };

  const handleTogglePause = () => {
    if (!engineRef.current) return;
    if (engineRef.current.state === 'playing') {
      engineRef.current.pauseGame();
    } else if (engineRef.current.state === 'paused') {
      engineRef.current.resumeGame();
    }
  };

  // Touch / Drag input
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastDragX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    // Quick tap direction if clicked on left/right side
    if (engineRef.current && engineRef.current.state === 'playing') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const width = rect.width;
        if (x < width * 0.4) {
          engineRef.current.handleKeyDown('ArrowLeft');
          setTimeout(() => engineRef.current?.handleKeyUp('ArrowLeft'), 120);
        } else if (x > width * 0.6) {
          engineRef.current.handleKeyDown('ArrowRight');
          setTimeout(() => engineRef.current?.handleKeyUp('ArrowRight'), 120);
        }
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !engineRef.current) return;
    const deltaX = e.clientX - lastDragX.current;
    lastDragX.current = e.clientX;
    engineRef.current.handleTouchMove(deltaX);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative select-none">
      {/* Game Viewport Container */}
      <div 
        ref={containerRef}
        className="relative bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center"
        style={{ width: '420px', height: '740px', maxWidth: '100%', maxHeight: '88vh', aspectRatio: '420 / 740' }}
      >
        {/* HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          width={420}
          height={740}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none block"
        />

        {/* Milestone Banner */}
        {notification && (
          <div className="absolute top-16 left-4 right-4 bg-emerald-600/90 text-white text-xs font-semibold py-2 px-3 rounded-lg text-center shadow-lg backdrop-blur-sm animate-bounce transition-all z-20">
            {notification}
          </div>
        )}

        {/* Top Control Bar inside canvas frame */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900/90 text-slate-200 transition-colors backdrop-blur-sm border border-white/10"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <button
            onClick={toggleDebug}
            aria-label="Toggle debug hitboxes"
            className={`p-2 rounded-lg transition-colors backdrop-blur-sm border ${
              showDebug 
                ? 'bg-cyan-500/80 text-white border-cyan-400' 
                : 'bg-slate-900/60 hover:bg-slate-900/90 text-slate-200 border-white/10'
            }`}
          >
            <Bug size={15} />
          </button>
          {gameState === 'playing' && (
            <button
              onClick={handleTogglePause}
              aria-label="Pause game"
              className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900/90 text-slate-200 transition-colors backdrop-blur-sm border border-white/10"
            >
              <Pause size={15} />
            </button>
          )}
        </div>

        {/* Overlay: MAIN MENU */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="mb-2 text-emerald-400 font-black tracking-widest text-xs uppercase">
              Flutter & Flame 2D Engine
            </div>
            <h1 className="text-4xl font-black text-white tracking-wider mb-1 drop-shadow-md">
              FLAME JUMP
            </h1>
            <p className="text-slate-300 text-xs mb-8 max-w-xs">
              Endless vertical platformer with dynamic height progression & Flame component architecture.
            </p>

            <button
              onClick={handleStartGame}
              className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-105 active:scale-95"
            >
              <Play size={22} className="fill-current" />
              <span>START PLAYING</span>
            </button>

            {highScore > 0 && (
              <div className="mt-6 text-xs text-slate-400">
                High Score: <span className="text-amber-400 font-bold">{highScore}</span>
              </div>
            )}

            <div className="mt-8 border-t border-slate-800 pt-4 w-full max-w-xs text-slate-400 text-[11px] leading-relaxed">
              <span className="font-semibold text-slate-300">Controls:</span> Drag or use <kbd className="px-1 py-0.5 bg-slate-800 text-slate-200 rounded">←</kbd> <kbd className="px-1 py-0.5 bg-slate-800 text-slate-200 rounded">→</kbd> or <kbd className="px-1 py-0.5 bg-slate-800 text-slate-200 rounded">A</kbd> <kbd className="px-1 py-0.5 bg-slate-800 text-slate-200 rounded">D</kbd> to steer left/right.
            </div>
          </div>
        )}

        {/* Overlay: GAME OVER */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="text-rose-500 font-black tracking-wider text-3xl mb-4 animate-pulse">
              GAME OVER
            </div>

            <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-inner">
              <div className="text-xs text-slate-400 font-medium">FINAL SCORE</div>
              <div className="text-4xl font-black text-white mt-1 mb-3">{score}</div>
              
              <div className="h-px bg-slate-800 my-2" />

              <div className="flex justify-between items-center text-xs mt-2">
                <span className="text-slate-400">BEST ALTITUDE</span>
                <span className="text-amber-400 font-bold">{highScore}</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-slate-400">MAX ZONE</span>
                <span className="text-slate-200 font-semibold uppercase">
                  {engineRef.current?.stats.currentZone}
                </span>
              </div>
            </div>

            <button
              onClick={handleRestartGame}
              className="flex items-center gap-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold px-7 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:scale-105 active:scale-95"
            >
              <RotateCcw size={18} />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        )}

        {/* Overlay: PAUSED */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
            <h2 className="text-2xl font-black text-white mb-4">GAME PAUSED</h2>
            <button
              onClick={handleTogglePause}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg transition-colors"
            >
              <Play size={18} className="fill-current" />
              <span>RESUME</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Controls Bar Below Canvas */}
      <div className="w-full max-w-[420px] mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPhysicsPanel(!showPhysicsPanel)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <Sliders size={13} />
            <span>Tune Physics</span>
          </button>
        </div>

        {/* Left/Right On-Screen Steer Buttons for quick touch/mouse play */}
        <div className="flex items-center gap-1.5">
          <button
            onPointerDown={() => engineRef.current?.handleKeyDown('ArrowLeft')}
            onPointerUp={() => engineRef.current?.handleKeyUp('ArrowLeft')}
            onPointerLeave={() => engineRef.current?.handleKeyUp('ArrowLeft')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-200 transition-colors border border-slate-700 select-none"
            aria-label="Steer Left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onPointerDown={() => engineRef.current?.handleKeyDown('ArrowRight')}
            onPointerUp={() => engineRef.current?.handleKeyUp('ArrowRight')}
            onPointerLeave={() => engineRef.current?.handleKeyUp('ArrowRight')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-200 transition-colors border border-slate-700 select-none"
            aria-label="Steer Right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Physics Tuning Drawer */}
      {showPhysicsPanel && engineRef.current && (
        <div className="w-full max-w-[420px] mt-2 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
          <div className="font-semibold text-slate-200 mb-2 flex justify-between items-center">
            <span>Flame Engine Physics Tuning</span>
            <button 
              onClick={() => setShowPhysicsPanel(false)} 
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              Close
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span>Gravity: {engineRef.current.physics.gravity} px/s²</span>
              </div>
              <input 
                type="range" 
                min="600" 
                max="1400" 
                step="20"
                value={engineRef.current.physics.gravity}
                onChange={(e) => {
                  if (engineRef.current) engineRef.current.physics.gravity = Number(e.target.value);
                }}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span>Jump Force: {Math.abs(engineRef.current.physics.jumpForce)} px/s</span>
              </div>
              <input 
                type="range" 
                min="450" 
                max="850" 
                step="10"
                value={Math.abs(engineRef.current.physics.jumpForce)}
                onChange={(e) => {
                  if (engineRef.current) engineRef.current.physics.jumpForce = -Number(e.target.value);
                }}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span>Horizontal Speed: {engineRef.current.physics.moveSpeed} px/s</span>
              </div>
              <input 
                type="range" 
                min="250" 
                max="650" 
                step="10"
                value={engineRef.current.physics.moveSpeed}
                onChange={(e) => {
                  if (engineRef.current) engineRef.current.physics.moveSpeed = Number(e.target.value);
                }}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
