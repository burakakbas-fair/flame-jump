import { GameEngine } from './engine';
import { PlatformData, PlayerData } from '../types/game';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private engine: GameEngine;
  public showDebug = false;

  // Star field cache
  private stars: Array<{ x: number; y: number; size: number; baseAlpha: number; twinkleSpeed: number }> = [];

  constructor(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    this.ctx = ctx;
    this.engine = engine;
    this.initStars();
  }

  private initStars() {
    for (let i = 0; i < 90; i++) {
      this.stars.push({
        x: Math.random() * this.engine.width,
        y: Math.random() * this.engine.height,
        size: 0.8 + Math.random() * 2.2,
        baseAlpha: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 1 + Math.random() * 3,
      });
    }
  }

  public render(timestamp: number) {
    const { ctx, engine } = this;
    const { width, height } = engine;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Dynamic Height-Based Background with Parallax
    this.renderBackground(timestamp);

    // 2. Apply Camera Transform for World Elements
    // In camera space: player/platforms at Y world are drawn at (Y - cameraY + height/2)
    const cameraOffsetY = height / 2 - engine.cameraY;

    ctx.save();
    ctx.translate(0, cameraOffsetY);

    // Render "START" marker in Zone 1
    this.renderStartMarker();

    // Render Platforms
    for (const platform of engine.platforms) {
      this.renderPlatform(platform);
    }

    // Render Particles
    this.renderParticles();

    // Render Player
    this.renderPlayer(engine.player, timestamp);

    // Render Debug Overlay if enabled
    if (this.showDebug) {
      this.renderDebugWorld();
    }

    ctx.restore();

    // Render HUD (fixed on screen)
    this.renderHUD();

    if (this.showDebug) {
      this.renderDebugHUD();
    }
  }

  // ==========================================================================
  // DYNAMIC BACKGROUND PROGRESSION (3 HEIGHT ZONES)
  // ==========================================================================
  private renderBackground(timestamp: number) {
    const { ctx, engine } = this;
    const { width, height } = engine;
    const { currentZone, zoneProgress } = engine.stats;

    if (currentZone === 'notebook') {
      this.drawNotebookBackground();
      if (zoneProgress > 0.7) {
        // Cross-fade atmosphere
        const alpha = (zoneProgress - 0.7) / 0.3;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        this.drawAtmosphereBackground(timestamp);
        ctx.restore();
      }
    } else if (currentZone === 'atmosphere') {
      this.drawAtmosphereBackground(timestamp);
      if (zoneProgress > 0.7) {
        // Cross-fade space
        const alpha = (zoneProgress - 0.7) / 0.3;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        this.drawSpaceBackground(timestamp);
        ctx.restore();
      }
    } else {
      this.drawSpaceBackground(timestamp);
    }
  }

  /** Zone 1: Notebook Grid Paper (0 - 1,000 pts) */
  private drawNotebookBackground() {
    const { ctx, engine } = this;
    const { width, height } = engine;

    // Warm cream notebook paper color
    ctx.fillStyle = '#FAF7EE';
    ctx.fillRect(0, 0, width, height);

    // Parallax scrolling grid lines based on camera
    const cameraOffsetY = (height / 2 - engine.cameraY) * 0.4;
    const gridSize = 24;
    const startY = (cameraOffsetY % gridSize) - gridSize;

    // Grid lines
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.65)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    // Vertical grid lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    // Horizontal ruled lines
    for (let y = startY; y <= height + gridSize; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Red notebook margin line on left
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.75)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(46, 0);
    ctx.lineTo(46, height);
    ctx.stroke();
  }

  /** Zone 2: Atmosphere (1,000 - 3,000 pts) */
  private drawAtmosphereBackground(timestamp: number) {
    const { ctx, engine } = this;
    const { width, height } = engine;

    // Sky blue gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#A5B4FC'); // Twilight violet top
    skyGrad.addColorStop(0.35, '#BAE6FD'); // Soft sky blue
    skyGrad.addColorStop(1, '#E0F2FE'); // Pale sky bottom
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Drifting parallax clouds
    const t = timestamp * 0.001;
    const cameraScroll = (height / 2 - engine.cameraY) * 0.2;

    this.drawCloud(width * 0.2 + Math.sin(t * 0.5) * 15, ((180 + cameraScroll) % (height + 150)) - 50, 48);
    this.drawCloud(width * 0.8 + Math.cos(t * 0.4) * 20, ((380 + cameraScroll) % (height + 150)) - 50, 60);
    this.drawCloud(width * 0.35 + Math.sin(t * 0.3) * 25, ((620 + cameraScroll) % (height + 150)) - 50, 52);
  }

  private drawCloud(cx: number, cy: number, radius: number) {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.7, 0, Math.PI * 2);
    ctx.arc(cx + radius * 0.55, cy - radius * 0.1, radius * 0.5, 0, Math.PI * 2);
    ctx.arc(cx - radius * 0.55, cy, radius * 0.45, 0, Math.PI * 2);
    ctx.arc(cx + radius * 0.2, cy + radius * 0.15, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** Zone 3: Deep Space (3,000+ pts) */
  private drawSpaceBackground(timestamp: number) {
    const { ctx, engine } = this;
    const { width, height } = engine;

    // Deep cosmic space gradient
    const spaceGrad = ctx.createLinearGradient(0, 0, 0, height);
    spaceGrad.addColorStop(0, '#030712'); // Pitch black
    spaceGrad.addColorStop(0.4, '#0B0F2A'); // Midnight navy
    spaceGrad.addColorStop(1, '#1E1B4B'); // Deep nebula purple
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, width, height);

    // Glowing nebula dust cloud
    const nebulaGrad = ctx.createRadialGradient(width * 0.65, height * 0.35, 20, width * 0.65, height * 0.35, 180);
    nebulaGrad.addColorStop(0, 'rgba(168, 85, 247, 0.22)');
    nebulaGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.12)');
    nebulaGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, width, height);

    // Twinkling stars with subtle vertical parallax
    const cameraScroll = (height / 2 - engine.cameraY) * 0.1;
    const t = timestamp * 0.002;

    for (const star of this.stars) {
      const sy = (star.y + cameraScroll) % height;
      const actualY = sy < 0 ? sy + height : sy;
      const twinkle = (Math.sin(t * star.twinkleSpeed + star.x) + 1) * 0.5;
      const alpha = star.baseAlpha * (0.6 + twinkle * 0.4);

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(star.x, actualY, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing Moon
    const moonX = width - 65;
    const moonY = 85;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 18, moonX, moonY, 44);
    moonGlow.addColorStop(0, 'rgba(254, 243, 199, 0.3)');
    moonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 44, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 20, 0, Math.PI * 2);
    ctx.fill();

    // Subtle moon craters
    ctx.fillStyle = 'rgba(217, 119, 6, 0.18)';
    ctx.beginPath();
    ctx.arc(moonX - 5, moonY - 4, 4.5, 0, Math.PI * 2);
    ctx.arc(moonX + 6, moonY + 5, 3.2, 0, Math.PI * 2);
    ctx.arc(moonX + 7, moonY - 7, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderStartMarker() {
    const { ctx, engine } = this;
    const startY = engine.height - 40;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(100, 116, 139, 0.6)';
    ctx.fillText('▲ START LINE ▲', engine.width / 2, startY);

    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(30, startY + 8);
    ctx.lineTo(engine.width - 30, startY + 8);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================================
  // PLATFORM RENDERING (SOLID, MOVING, FRAGILE, SPRING)
  // ==========================================================================
  private renderPlatform(p: PlatformData) {
    const { ctx } = this;
    const halfW = p.width / 2;
    const halfH = p.height / 2;
    const left = p.x - halfW;
    const top = p.y - halfH;

    ctx.save();

    if (p.type === 'solid') {
      // Grass Top Platform (matching uploaded image asset)
      // Rounded base
      ctx.beginPath();
      ctx.roundRect(left, top, p.width, p.height, 8);
      ctx.fillStyle = '#92400E'; // Earth brown base
      ctx.fill();

      // Grass cap
      ctx.beginPath();
      ctx.roundRect(left, top, p.width, 7, [8, 8, 2, 2]);
      ctx.fillStyle = '#22C55E'; // Lush green grass
      ctx.fill();

      // Crisp outline
      ctx.strokeStyle = '#14532D';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Grass tuft highlights
      ctx.fillStyle = '#4ADE80';
      ctx.fillRect(left + 8, top + 1.5, 12, 2);
      ctx.fillRect(left + 30, top + 1.5, 16, 2);
      ctx.fillRect(left + 54, top + 1.5, 10, 2);

      // Spring if present
      if (p.hasSpring) {
        this.renderSpring(p.x, top, p.springCompressed || false);
      }
    } else if (p.type === 'moving') {
      // Futuristic Cyan Hover Platform (matching uploaded image asset)
      ctx.beginPath();
      ctx.roundRect(left, top, p.width, p.height, 8);
      ctx.fillStyle = '#06B6D4'; // Vibrant cyan
      ctx.fill();

      // Horizontal glowing core line
      ctx.strokeStyle = '#A5F3FC';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(left + 8, p.y);
      ctx.lineTo(left + p.width - 8, p.y);
      ctx.stroke();

      // Dark border
      ctx.strokeStyle = '#083344';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Bottom hover thrusters with flame glow
      const thrusterY = top + p.height;
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(left + 12, thrusterY - 2, 10, 4);
      ctx.fillRect(left + p.width - 22, thrusterY - 2, 10, 4);

      // Thruster blue glow jets
      ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.beginPath();
      ctx.moveTo(left + 14, thrusterY + 2);
      ctx.lineTo(left + 20, thrusterY + 2);
      ctx.lineTo(left + 17, thrusterY + 8);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(left + p.width - 20, thrusterY + 2);
      ctx.lineTo(left + p.width - 14, thrusterY + 2);
      ctx.lineTo(left + p.width - 17, thrusterY + 8);
      ctx.fill();
    } else if (p.type === 'fragile') {
      // Brown Cracked Fragile Platform (matching uploaded image asset)
      const alpha = p.broken ? Math.max(0, 1 - (p.breakProgress || 0)) : 1;
      ctx.globalAlpha = alpha;

      ctx.beginPath();
      ctx.roundRect(left, top, p.width, p.height, 6);
      ctx.fillStyle = '#B45309'; // Warm wood brown
      ctx.fill();

      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Fracture crack across the middle
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(left + p.width * 0.15, top);
      ctx.lineTo(left + p.width * 0.42, top + p.height * 0.7);
      ctx.lineTo(left + p.width * 0.58, top + p.height * 0.35);
      ctx.lineTo(left + p.width * 0.88, top + p.height);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderSpring(cx: number, topY: number, compressed: boolean) {
    const { ctx } = this;
    const h = compressed ? 5 : 12;
    const springY = topY - h;

    ctx.save();
    // Metal coil
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 7, topY);
    ctx.lineTo(cx + 7, topY - h * 0.33);
    ctx.lineTo(cx - 7, topY - h * 0.66);
    ctx.lineTo(cx + 7, springY);
    ctx.stroke();

    // Red cap plate
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.roundRect(cx - 9, springY - 3, 18, 4, 2);
    ctx.fill();
    ctx.restore();
  }

  // ==========================================================================
  // PLAYER RENDERING (ALIEN WITH CUSTOM SPRITE STATES)
  // ==========================================================================
  private renderPlayer(player: PlayerData, timestamp: number) {
    const { ctx } = this;
    const halfW = player.width / 2;
    const halfH = player.height / 2;

    ctx.save();
    ctx.translate(player.x, player.y);

    // Directional flip
    if (player.facingLeft) {
      ctx.scale(-1, 1);
    }

    // Squash & stretch based on vertical velocity
    let scaleX = 1;
    let scaleY = 1;
    if (player.vy < -300) {
      // Jumping up: stretch vertically
      scaleX = 0.88;
      scaleY = 1.14;
    } else if (player.vy > 350) {
      // Falling down fast: slight squat
      scaleX = 1.08;
      scaleY = 0.92;
    }
    ctx.scale(scaleX, scaleY);

    // 1. Green Alien Body (matching uploaded sprite image)
    ctx.fillStyle = '#6EE7B7'; // Vibrant alien green
    ctx.beginPath();
    ctx.roundRect(-halfW + 4, -halfH + 6, player.width - 8, player.height - 10, 18);
    ctx.fill();

    // Body dark green outline
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // 2. Cute belly patch
    ctx.fillStyle = '#A7F3D0';
    ctx.beginPath();
    ctx.roundRect(-halfW + 10, -halfH + 18, player.width - 20, player.height - 24, 10);
    ctx.fill();

    // 3. Cute antennas on top
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Left antenna
    ctx.moveTo(-7, -halfH + 7);
    ctx.quadraticCurveTo(-12, -halfH - 2, -15, -halfH);
    // Right antenna
    ctx.moveTo(7, -halfH + 7);
    ctx.quadraticCurveTo(12, -halfH - 2, 15, -halfH);
    ctx.stroke();

    // Antenna tips
    ctx.fillStyle = '#6EE7B7';
    ctx.beginPath();
    ctx.arc(-15, -halfH, 2.8, 0, Math.PI * 2);
    ctx.arc(15, -halfH, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#047857';
    ctx.stroke();

    // 4. Little stubby arms
    ctx.fillStyle = '#6EE7B7';
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 2;
    if (player.state === 'jumping') {
      // Happy raised arms
      ctx.beginPath();
      ctx.roundRect(halfW - 5, -halfH + 12, 8, 6, 3);
      ctx.fill();
      ctx.stroke();
    } else {
      // Resting arms
      ctx.beginPath();
      ctx.roundRect(halfW - 5, -halfH + 18, 7, 8, 3);
      ctx.fill();
      ctx.stroke();
    }

    // 5. Big cute eye
    const eyeX = 3;
    const eyeY = -4;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Pupil
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(eyeX + 1.2, eyeY, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Eye glint
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 2.2, eyeY - 1.2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 6. Mouth based on state
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    if (player.state === 'jumping') {
      // Happy open smile
      ctx.fillStyle = '#BE123C';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY + 9, 3.8, 0, Math.PI, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (player.state === 'falling') {
      // Surprised 'o' mouth
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY + 9, 2.5, 3.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Smirk
      ctx.beginPath();
      ctx.arc(eyeX, eyeY + 7, 4, 0.2, Math.PI * 0.8, false);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================================================
  // PARTICLES
  // ==========================================================================
  private renderParticles() {
    const { ctx, engine } = this;
    for (const p of engine.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ==========================================================================
  // HUD (TOP SCORE & ZONE BADGE)
  // ==========================================================================
  private renderHUD() {
    const { ctx, engine } = this;
    const { score, currentZone } = engine.stats;

    // Score at top
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '900 34px Montserrat, system-ui, sans-serif';

    // Choose legible text color depending on zone
    if (currentZone === 'space') {
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = '#1E293B';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
      ctx.shadowBlur = 4;
    }

    ctx.fillText(`${score}`, engine.width / 2, 48);

    // Altitude Zone Indicator
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.letterSpacing = '1px';
    const zoneName = currentZone === 'notebook' ? 'NOTEBOOK (0 - 1,000m)' : currentZone === 'atmosphere' ? 'ATMOSPHERE (1,000 - 3,000m)' : 'DEEP SPACE (3,000m+)';
    ctx.fillText(zoneName, engine.width / 2, 68);

    ctx.restore();
  }

  // ==========================================================================
  // DEBUG WORLD & HUD
  // ==========================================================================
  private renderDebugWorld() {
    const { ctx, engine } = this;
    const { player, platforms } = engine;

    // Player bounding box (red)
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);

    // Player foot collision sensor (yellow)
    ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.fillRect(player.x - player.width / 2 + 6, player.y + player.height / 2 - 8, player.width - 12, 8);

    // Platform bounding boxes (green / cyan / orange)
    for (const p of platforms) {
      ctx.strokeStyle = p.type === 'solid' ? '#22C55E' : p.type === 'moving' ? '#06B6D4' : '#F97316';
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height);

      // Top edge trigger
      ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
      ctx.fillRect(p.x - p.width / 2, p.y - p.height / 2, p.width, 4);
    }

    // Camera follow threshold line (dashed cyan)
    const thresholdWorldY = engine.cameraY - engine.height * 0.16;
    ctx.strokeStyle = '#06B6D4';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, thresholdWorldY);
    ctx.lineTo(engine.width, thresholdWorldY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private renderDebugHUD() {
    const { ctx, engine } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(8, 80, 160, 115);

    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 80, 160, 115);

    ctx.fillStyle = '#38BDF8';
    ctx.font = '10px monospace';
    ctx.fillText(`FPS: ${engine.stats.fps}`, 16, 96);
    ctx.fillText(`Y-Vel: ${Math.round(engine.player.vy)} px/s`, 16, 112);
    ctx.fillText(`CamY: ${Math.round(engine.cameraY)}`, 16, 128);
    ctx.fillText(`Active Plats: ${engine.platforms.length}`, 16, 144);
    ctx.fillText(`GC Destroyed: ${engine.stats.platformsDestroyed}`, 16, 160);
    ctx.fillText(`Total Spawned: ${engine.stats.platformsSpawned}`, 16, 176);
    ctx.restore();
  }
}
