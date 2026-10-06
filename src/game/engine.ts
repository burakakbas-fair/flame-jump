import { GameState, PlatformData, PlayerData, Particle, GameStats, PhysicsConfig } from '../types/game';
import { soundManager } from '../utils/audio';

export class GameEngine {
  public width = 420;
  public height = 740;

  public state: GameState = 'menu';
  public stats: GameStats = {
    score: 0,
    highScore: 0,
    maxHeight: 0,
    platformsSpawned: 0,
    platformsDestroyed: 0,
    currentZone: 'notebook',
    zoneProgress: 0,
    fps: 60,
  };

  public physics: PhysicsConfig = {
    gravity: 980,
    jumpForce: -620,
    springForce: -950,
    moveSpeed: 440,
    horizontalDamping: 0.88,
    minPlatformGap: 65,
    maxPlatformGap: 110,
  };

  public player: PlayerData = {
    x: 210,
    y: 600,
    width: 44,
    height: 48,
    vx: 0,
    vy: 0,
    facingLeft: false,
    state: 'idle',
    jumpAnimTimer: 0,
  };

  public platforms: PlatformData[] = [];
  public particles: Particle[] = [];

  // Camera system
  public cameraY = 370; // camera center Y
  public lowestPlayerY = 600; // in canvas coords (lower value = higher altitude)
  private highestSpawnY = 600;

  // Frame timing
  private lastTime = 0;
  private frameCount = 0;
  private fpsTimer = 0;

  // Input states
  private keys: { [key: string]: boolean } = {};
  private tiltInput = 0;
  private targetVx = 0;

  // Audio & notifications callback
  public onStateChange?: (state: GameState) => void;
  public onMilestone?: (zone: string) => void;

  constructor() {
    this.loadHighScore();
    this.reset();
  }

  private loadHighScore() {
    try {
      const saved = localStorage.getItem('flame_jump_high_score');
      if (saved) {
        this.stats.highScore = parseInt(saved, 10) || 0;
      }
    } catch {
      // ignore
    }
  }

  private saveHighScore() {
    try {
      localStorage.setItem('flame_jump_high_score', this.stats.highScore.toString());
    } catch {
      // ignore
    }
  }

  public reset() {
    this.platforms = [];
    this.particles = [];
    this.stats.score = 0;
    this.stats.maxHeight = 0;
    this.stats.platformsSpawned = 0;
    this.stats.platformsDestroyed = 0;
    this.stats.currentZone = 'notebook';
    this.stats.zoneProgress = 0;

    this.cameraY = this.height / 2;
    this.highestSpawnY = this.height - 70;
    this.lowestPlayerY = this.height - 150;

    // Reset player position
    this.player = {
      x: this.width / 2,
      y: this.height - 130,
      width: 44,
      height: 48,
      vx: 0,
      vy: 0,
      facingLeft: false,
      state: 'idle',
      jumpAnimTimer: 0,
    };

    // Spawn initial base platform directly under player
    this.spawnPlatform(this.width / 2, this.height - 70, 'solid');

    // Build the initial ladder up above viewport
    while (this.highestSpawnY > -this.height * 1.5) {
      this.generateNextPlatform();
    }
  }

  public startGame() {
    this.reset();
    this.state = 'playing';
    this.onStateChange?.(this.state);
  }

  public pauseGame() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.onStateChange?.(this.state);
    }
  }

  public resumeGame() {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.onStateChange?.(this.state);
    }
  }

  public restartGame() {
    this.startGame();
  }

  private spawnPlatform(x: number, y: number, type: 'solid' | 'moving' | 'fragile'): PlatformData {
    const hasSpring = type === 'solid' && Math.random() < 0.12;
    const platform: PlatformData = {
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      width: 76,
      height: 18,
      type,
      vx: type === 'moving' ? (Math.random() > 0.5 ? 120 : -120) : 0,
      minX: 42,
      maxX: this.width - 42,
      broken: false,
      breakProgress: 0,
      hasSpring,
      springCompressed: false,
    };

    this.platforms.push(platform);
    this.stats.platformsSpawned++;
    return platform;
  }

  private generateNextPlatform() {
    const gap = this.physics.minPlatformGap + Math.random() * (this.physics.maxPlatformGap - this.physics.minPlatformGap);
    this.highestSpawnY -= gap;

    const xMargin = 50;
    const randomX = xMargin + Math.random() * (this.width - xMargin * 2);

    // Platform distribution depends on score
    const score = this.stats.score;
    const roll = Math.random();
    let type: 'solid' | 'moving' | 'fragile' = 'solid';

    if (score < 1000) {
      if (roll < 0.85) type = 'solid';
      else if (roll < 0.95) type = 'moving';
      else type = 'fragile';
    } else if (score < 3000) {
      if (roll < 0.60) type = 'solid';
      else if (roll < 0.85) type = 'moving';
      else type = 'fragile';
    } else {
      if (roll < 0.40) type = 'solid';
      else if (roll < 0.80) type = 'moving';
      else type = 'fragile';
    }

    this.spawnPlatform(randomX, this.highestSpawnY, type);
  }

  public handleKeyDown(key: string) {
    this.keys[key] = true;
  }

  public handleKeyUp(key: string) {
    this.keys[key] = false;
  }

  public handleTouchMove(deltaX: number) {
    this.targetVx = Math.max(-this.physics.moveSpeed, Math.min(this.physics.moveSpeed, deltaX * 18));
  }

  public handleTilt(tilt: number) {
    this.tiltInput = tilt;
  }

  public update(time: number) {
    if (this.lastTime === 0) {
      this.lastTime = time;
      return;
    }

    let dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // Clamp dt to avoid spiral of death
    if (dt > 0.05) dt = 0.05;

    // Track FPS
    this.frameCount++;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 0.5) {
      this.stats.fps = Math.round((this.frameCount / this.fpsTimer));
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    if (this.state !== 'playing') {
      this.updateParticles(dt);
      return;
    }

    // ------------------------------------------------------------------------
    // 1. HORIZONTAL CONTROLS & PHYSICS
    // ------------------------------------------------------------------------
    let inputDir = 0;
    if (this.keys['ArrowLeft'] || this.keys['KeyA'] || this.keys['a'] || this.keys['A']) {
      inputDir -= 1;
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD'] || this.keys['d'] || this.keys['D']) {
      inputDir += 1;
    }

    if (inputDir !== 0) {
      this.player.vx = inputDir * this.physics.moveSpeed;
    } else if (this.tiltInput !== 0) {
      this.player.vx = this.tiltInput * (this.physics.moveSpeed * 0.9);
    } else if (this.targetVx !== 0) {
      this.player.vx = this.targetVx;
      this.targetVx *= 0.8;
      if (Math.abs(this.targetVx) < 5) this.targetVx = 0;
    } else {
      this.player.vx *= this.physics.horizontalDamping;
    }

    if (Math.abs(this.player.vx) > 10) {
      this.player.facingLeft = this.player.vx < 0;
    }

    // ------------------------------------------------------------------------
    // 2. GRAVITY & VERTICAL MOVEMENT
    // ------------------------------------------------------------------------
    this.player.vy += this.physics.gravity * dt;
    if (this.player.vy > 900) this.player.vy = 900; // Terminal velocity

    this.player.x += this.player.vx * dt;
    this.player.y += this.player.vy * dt;

    // ------------------------------------------------------------------------
    // 3. SCREEN WRAPPING
    // ------------------------------------------------------------------------
    const halfW = this.player.width / 2;
    if (this.player.x < -halfW) {
      this.player.x = this.width + halfW;
    } else if (this.player.x > this.width + halfW) {
      this.player.x = -halfW;
    }

    // Visual animation states
    if (this.player.vy < -200) {
      this.player.state = 'jumping';
    } else if (this.player.vy < 0) {
      this.player.state = 'idle';
    } else if (this.player.vy > 400) {
      this.player.state = 'falling';
    } else {
      this.player.state = 'idle';
    }

    // ------------------------------------------------------------------------
    // 4. PLATFORM LOGIC & COLLISIONS
    // ------------------------------------------------------------------------
    for (const platform of this.platforms) {
      // Update moving platforms
      if (platform.type === 'moving' && platform.vx) {
        platform.x += platform.vx * dt;
        if (platform.x <= (platform.minX || 40)) {
          platform.x = platform.minX || 40;
          platform.vx = Math.abs(platform.vx);
        } else if (platform.x >= (platform.maxX || this.width - 40)) {
          platform.x = platform.maxX || this.width - 40;
          platform.vx = -Math.abs(platform.vx);
        }
      }

      // Update fragile breaking platforms
      if (platform.type === 'fragile' && platform.broken && platform.breakProgress !== undefined) {
        platform.breakProgress += dt * 3.5;
        if (platform.breakProgress >= 1.0) {
          // Trigger crumble particles
          this.createFragileParticles(platform.x, platform.y);
        }
      }

      // ONE-WAY COLLISION DETECTION:
      // Jump triggers ONLY when falling downwards (vy > 0)
      if (this.player.vy > 0 && !platform.broken) {
        const playerBottom = this.player.y + this.player.height / 2;
        const playerLeft = this.player.x - this.player.width / 2 + 6;
        const playerRight = this.player.x + this.player.width / 2 - 6;

        const platformTop = platform.y - platform.height / 2;
        const platformBottom = platform.y + platform.height / 2;
        const platformLeft = platform.x - platform.width / 2;
        const platformRight = platform.x + platform.width / 2;

        const horizontalOverlap = playerRight > platformLeft && playerLeft < platformRight;
        const verticalIntersection = playerBottom >= platformTop && (playerBottom - platformTop) <= 22;

        if (horizontalOverlap && verticalIntersection) {
          if (platform.type === 'fragile') {
            platform.broken = true;
            soundManager.playBreak();
            this.createFragileParticles(platform.x, platform.y);
            // Fragile: NO jump applied! Player continues falling through!
          } else if (platform.hasSpring) {
            // Super bounce!
            platform.springCompressed = true;
            this.player.vy = this.physics.springForce;
            soundManager.playSpring();
            this.createBounceParticles(platform.x, platform.y - 10, '#EF4444', 16);
          } else {
            // Normal solid / moving platform bounce
            this.player.vy = this.physics.jumpForce;
            soundManager.playJump();
            this.createBounceParticles(this.player.x, playerBottom, '#22C55E', 8);
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // 5. UNIDIRECTIONAL CAMERA FOLLOWING:
    // Only follows player UP, never down.
    // ------------------------------------------------------------------------
    const topThreshold = this.cameraY - (this.height * 0.16);
    if (this.player.y < topThreshold) {
      const diff = topThreshold - this.player.y;
      this.cameraY -= diff;
    }

    // ------------------------------------------------------------------------
    // 6. SCORING & ALTITUDE PROGRESSION
    // ------------------------------------------------------------------------
    if (this.player.y < this.lowestPlayerY) {
      this.lowestPlayerY = this.player.y;
      const calculatedScore = Math.floor((this.height - 130 - this.lowestPlayerY) * 1.5);
      if (calculatedScore > this.stats.score) {
        const prevZone = this.stats.currentZone;
        this.stats.score = calculatedScore;

        if (this.stats.score < 1000) {
          this.stats.currentZone = 'notebook';
          this.stats.zoneProgress = this.stats.score / 1000;
        } else if (this.stats.score < 3000) {
          this.stats.currentZone = 'atmosphere';
          this.stats.zoneProgress = (this.stats.score - 1000) / 2000;
          if (prevZone === 'notebook') {
            soundManager.playMilestone();
            this.onMilestone?.('Atmosphere reached! (1,000 pts)');
          }
        } else {
          this.stats.currentZone = 'space';
          this.stats.zoneProgress = Math.min(1.0, (this.stats.score - 3000) / 3000);
          if (prevZone === 'atmosphere') {
            soundManager.playMilestone();
            this.onMilestone?.('Deep Space reached! (3,000 pts)');
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // 7. LEVEL GENERATION AHEAD OF CAMERA
    // ------------------------------------------------------------------------
    const cameraTop = this.cameraY - this.height / 2;
    while (this.highestSpawnY > cameraTop - 250) {
      this.generateNextPlatform();
    }

    // ------------------------------------------------------------------------
    // 8. GARBAGE COLLECTION
    // Destroy platforms falling below camera bottom to sustain 60 FPS
    // ------------------------------------------------------------------------
    const cameraBottom = this.cameraY + this.height / 2;
    const initialCount = this.platforms.length;
    this.platforms = this.platforms.filter((p) => {
      const isOffscreen = p.y > cameraBottom + 60;
      const isBrokenAndGone = p.broken && (p.breakProgress || 0) >= 1.0;
      return !isOffscreen && !isBrokenAndGone;
    });
    this.stats.platformsDestroyed += (initialCount - this.platforms.length);

    // ------------------------------------------------------------------------
    // 9. GAME OVER CHECK
    // Player falls below bottom edge of the camera
    // ------------------------------------------------------------------------
    if (this.player.y > cameraBottom + 50) {
      this.triggerGameOver();
    }

    this.updateParticles(dt);
  }

  private triggerGameOver() {
    this.state = 'gameover';
    soundManager.playGameOver();
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      this.saveHighScore();
    }
    this.onStateChange?.(this.state);
  }

  private createBounceParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * Math.PI;
      const speed = 60 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3.5,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
      });
    }
  }

  private createFragileParticles(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 160,
        vy: 40 + Math.random() * 180,
        size: 3 + Math.random() * 5,
        color: '#78350F',
        alpha: 1,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.3,
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = 1 - (p.life / p.maxLife);
    }
  }
}
