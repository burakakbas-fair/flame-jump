export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export type PlatformType = 'solid' | 'moving' | 'fragile' | 'spring';

export interface PlatformData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PlatformType;
  vx?: number; // for moving platforms
  minX?: number;
  maxX?: number;
  broken?: boolean;
  breakProgress?: number; // 0 to 1 for fragile breaking animation
  hasSpring?: boolean;
  springCompressed?: boolean;
}

export interface PlayerData {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  facingLeft: boolean;
  state: 'idle' | 'jumping' | 'falling' | 'boost';
  jumpAnimTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  maxHeight: number;
  platformsSpawned: number;
  platformsDestroyed: number;
  currentZone: 'notebook' | 'atmosphere' | 'space';
  zoneProgress: number; // 0 to 1 inside current zone
  fps: number;
}

export interface PhysicsConfig {
  gravity: number;
  jumpForce: number;
  springForce: number;
  moveSpeed: number;
  horizontalDamping: number;
  minPlatformGap: number;
  maxPlatformGap: number;
}
