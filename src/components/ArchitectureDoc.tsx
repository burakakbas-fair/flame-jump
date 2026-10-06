import React from 'react';
import { 
  Layers, 
  Cpu, 
  Camera, 
  Trash2, 
  Zap, 
  ShieldCheck, 
  Activity,
  Code2,
  CheckCircle2
} from 'lucide-react';

export const ArchitectureDoc: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-8 bg-slate-950 text-slate-200">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
          <Layers className="text-emerald-400" size={26} />
          Flame Engine 2D Platformer Architecture
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Complete structural blueprint for high-performance 60 FPS endless vertical platformers in Flutter using Flame 1.18+.
        </p>
      </div>

      {/* Grid of Key Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Flame Component Hierarchy */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm mb-3">
            <Cpu size={18} />
            <span>Component Hierarchy</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Built using Flame's modern <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">FlameGame</code> and <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">World</code> architecture. Separates game simulation from viewport rendering.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li><strong className="text-slate-200">Game:</strong> <code className="text-slate-300">MyGame</code> coordinates tick loop</li>
            <li><strong className="text-slate-200">World:</strong> Contains Player, Platforms, Background</li>
            <li><strong className="text-slate-200">Viewport:</strong> FixedResolution (420 × 740)</li>
            <li><strong className="text-slate-200">Overlays:</strong> Flutter widgets for Menu & Game Over</li>
          </ul>
        </div>

        {/* Card 2: One-Way Collision System */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm mb-3">
            <ShieldCheck size={18} />
            <span>One-Way Platform Collisions</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Jump impulse only triggers when falling downward onto the top edge of a platform.
          </p>
          <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-cyan-300 border border-slate-800">
            <div>if (velocity.y &gt; 0) {'{'}</div>
            <div className="pl-3">if (playerBottom &gt;= platformTop &&</div>
            <div className="pl-6">(playerBottom - platformTop) &lt;= 24) {'{'}</div>
            <div className="pl-6">platform.onSteppedOn(player);</div>
            <div className="pl-3">{'}'}</div>
            <div>{'}'}</div>
          </div>
        </div>

        {/* Card 3: Unidirectional Camera */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm mb-3">
            <Camera size={18} />
            <span>Unidirectional Camera</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            The camera viewport moves upwards ONLY when the player climbs past 16% of the screen height. The camera never pans downward.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li><strong className="text-slate-200">Ascent:</strong> Smooth lerp follows player up</li>
            <li><strong className="text-slate-200">Descent:</strong> Camera position locked</li>
            <li><strong className="text-slate-200">Game Over:</strong> Triggers when player falls past viewport bottom</li>
          </ul>
        </div>

        {/* Card 4: Garbage Collection */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm mb-3">
            <Trash2 size={18} />
            <span>Garbage Collection at 60 FPS</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Prevents memory leaks and CPU degradation by automatically detaching offscreen entities.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Spawns procedural platforms <strong className="text-slate-200">200px ahead</strong> of top view</li>
            <li>Destroys platforms <strong className="text-slate-200">50px below</strong> bottom view</li>
            <li>Calls <code className="text-slate-300">removeFromParent()</code> for immediate deallocation</li>
          </ul>
        </div>

        {/* Card 5: Altitude Background Progression */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2.5 text-purple-400 font-bold text-sm mb-3">
            <Activity size={18} />
            <span>3-Zone Altitude Progression</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Height-based procedural parallax rendering with smooth cross-fading:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5">
            <li className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-200" />
              <span><strong>0 - 1,000 pts:</strong> Notebook Grid Paper + Start line</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span><strong>1,000 - 3,000 pts:</strong> Light Blue Sky + Drifting Clouds</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-900" />
              <span><strong>3,000+ pts:</strong> Deep Space + Starfield + Moon</span>
            </li>
          </ul>
        </div>

        {/* Card 6: Platform Types & Variants */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm mb-3">
            <Zap size={18} />
            <span>Platform Polymorphism</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Inherits from <code className="text-slate-300 bg-slate-950 px-1 py-0.5 rounded">BasePlatform</code> with specialized behaviors:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li><strong className="text-emerald-400">SolidPlatform:</strong> Standard bounce (-620 px/s)</li>
            <li><strong className="text-cyan-400">MovingPlatform:</strong> Horizontal patrol bounce</li>
            <li><strong className="text-amber-500">FragilePlatform:</strong> Fractures, NO jump applied</li>
            <li><strong className="text-rose-400">SpringPlatform:</strong> Super jump (-950 px/s)</li>
          </ul>
        </div>
      </div>

      {/* Flame Lifecycle Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Code2 size={18} className="text-emerald-400" />
          Flame Game Loop & Component Lifecycle
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div className="text-emerald-400 font-bold mb-1">1. onLoad() [Async Setup]</div>
            <p className="text-slate-400 leading-relaxed">
              Called once when the component enters the component tree. Pre-loads sprites, initializes hitboxes with <code className="text-slate-300">add(RectangleHitbox())</code>, and configures viewports.
            </p>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div className="text-cyan-400 font-bold mb-1">2. update(double dt) [Tick Loop]</div>
            <p className="text-slate-400 leading-relaxed">
              Called every frame with delta time <code className="text-slate-300">dt</code>. Updates gravity (<code className="text-slate-300">vy += g * dt</code>), calculates screen wrapping, updates horizontal patrols, and adjusts camera position.
            </p>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div className="text-purple-400 font-bold mb-1">3. render(Canvas canvas)</div>
            <p className="text-slate-400 leading-relaxed">
              Draws the component to the Skia/Impeller Canvas. Handles sprite animation rendering, particle alpha blending, and background parallax.
            </p>
          </div>
        </div>
      </div>

      {/* Checklist for Integration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-bold text-white mb-3">Flame 1.18+ Integration Checklist</h3>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>Use <code className="text-slate-200">with HasCollisionDetection</code> on <code className="text-slate-200">MyGame</code> class to activate Flame's spatial hash grid collision engine.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>Mix in <code className="text-slate-200">CollisionCallbacks</code> on <code className="text-slate-200">PlayerComponent</code> to receive <code className="text-slate-200">onCollision(...)</code> events.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>Mix in <code className="text-slate-200">DragCallbacks</code> and <code className="text-slate-200">TapCallbacks</code> on <code className="text-slate-200">MyGame</code> for touch handling.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>Wrap in <code className="text-slate-200">GameWidget(overlayBuilderMap: ...)</code> to overlay rich Flutter UI widgets seamlessly.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
