import React from 'react';
import { Image as ImageIcon, Sparkles, Code2, Scissors, Palette } from 'lucide-react';

export const SpriteMappingGuide: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-8 bg-slate-950 text-slate-200">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
          <Palette className="text-emerald-400" size={26} />
          Sprite Sheet Slicing & Asset Integration Guide
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Visual mapping and Flame Engine integration code for your uploaded sprite sheet and vertical background textures.
        </p>
      </div>

      {/* Overview of uploaded assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Image 1 - Sprite Sheet */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Scissors size={18} />
            <span>Image 1: Gameplay Sprite Sheet Breakdown</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your uploaded sprite sheet contains a complete character animation cycle, platform variants, powerup items, and UI widgets:
          </p>

          <div className="space-y-3 text-xs">
            {/* Character States */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="font-semibold text-emerald-300 mb-1">1. Green Alien Character (Row 1)</div>
              <ul className="text-slate-400 space-y-1 list-disc list-inside">
                <li><strong>Idle Sprite:</strong> Facing forward with single eye open</li>
                <li><strong>Jump Sprite:</strong> Arms raised in joy, happy open smile</li>
                <li><strong>Surprised Sprite:</strong> Body stretched upward, curious expression</li>
                <li><strong>Dizzy/Fall Sprite:</strong> Eyes closed/squinted, sad mouth (falling state)</li>
              </ul>
            </div>

            {/* Platform Types */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="font-semibold text-cyan-300 mb-1">2. Platform Variants (Row 2 & 3)</div>
              <ul className="text-slate-400 space-y-1 list-disc list-inside">
                <li><strong>Solid Platform:</strong> Lush green grass top with earth-toned bedrock</li>
                <li><strong>Moving Platform:</strong> Cyan sci-fi hover craft with dual rocket thruster nozzles</li>
                <li><strong>Fragile Platform:</strong> Cracked brown wood/stone slab that crumbles when stepped on</li>
              </ul>
            </div>

            {/* Powerups & Collectibles */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="font-semibold text-amber-300 mb-1">3. Powerups & Items (Row 3 & 4)</div>
              <ul className="text-slate-400 space-y-1 list-disc list-inside">
                <li><strong>Spring:</strong> Coiled silver metal spring with top impact pad</li>
                <li><strong>Propeller Hat:</strong> Rainbow striped hat for sustained vertical flight</li>
                <li><strong>Rocket Booster:</strong> Dual red rocket jetpack for super boost</li>
                <li><strong>Monsters:</strong> Purple winged bat & Orange horned slime monster</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Image 2 - Vertical Backgrounds */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <ImageIcon size={18} />
            <span>Image 2: Vertical Background Progression</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your uploaded backgrounds map directly to the 3 altitude zones implemented in <code className="text-slate-200">lib/components/background.dart</code>:
          </p>

          <div className="space-y-3 text-xs">
            {/* Zone 1 */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="font-semibold text-amber-300 mb-1">Zone 1: Ground / Notebook Grid (0 - 1,000 pts)</div>
              <p className="text-slate-400 leading-relaxed">
                Light cream notebook grid paper texture. Positioned at the base with a <code className="text-slate-300">START</code> marker. Sets the nostalgic sketchbook aesthetic.
              </p>
            </div>

            {/* Zone 2 */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="font-semibold text-sky-300 mb-1">Zone 2: Atmosphere / Sky (1,000 - 3,000 pts)</div>
              <p className="text-slate-400 leading-relaxed">
                Pale blue atmospheric sky gradient with soft drifting white clouds and mountain silhouettes at the base. Cross-fades seamlessly above 1,000 points.
              </p>
            </div>

            {/* Zone 3 */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="font-semibold text-indigo-300 mb-1">Zone 3: Deep Space (3,000+ pts)</div>
              <p className="text-slate-400 leading-relaxed">
                Cosmic starfield with deep purple & dark blue nebula gradients, glistening constellations, and a glowing moon. The ultimate high-altitude zone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippet: Loading Sprite Sheet in Flame */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Code2 size={18} className="text-emerald-400" />
          Dart / Flame Code: Slicing the Uploaded Sprite Sheet
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Drop this snippet into <code className="text-slate-200">lib/components/player.dart</code> or a dedicated <code className="text-slate-200">lib/utils/sprite_manager.dart</code> to load the exact sprites from your image:
        </p>

        <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800 leading-relaxed">
          <pre>{`import 'package:flame/components.dart';
import 'package:flame/game.dart';
import 'package:flame/sprite.dart';

class GameSpriteSheet {
  late final SpriteSheet sheet;

  // Player sprites
  late final Sprite playerIdle;
  late final Sprite playerJump;
  late final Sprite playerSurprised;
  late final Sprite playerDizzy;

  // Platform sprites
  late final Sprite solidPlatform;
  late final Sprite movingPlatform;
  late final Sprite fragilePlatform;

  // Item sprites
  late final Sprite spring;
  late final Sprite propellerHat;
  late final Sprite rocketBooster;

  Future<void> load(FlameGame game) async {
    // 1. Load the full sprite sheet image
    final image = await game.images.load('spritesheet.png');

    // 2. Define grid slice (e.g. 64x64 or custom sub-rectangles)
    // Custom sub-rectangles allow exact pixel-perfect sprite extraction:
    playerIdle = Sprite(image, srcPosition: Vector2(10, 10), srcSize: Vector2(58, 64));
    playerJump = Sprite(image, srcPosition: Vector2(80, 10), srcSize: Vector2(58, 64));
    playerSurprised = Sprite(image, srcPosition: Vector2(150, 10), srcSize: Vector2(58, 64));
    playerDizzy = Sprite(image, srcPosition: Vector2(220, 10), srcSize: Vector2(58, 64));

    // Platform slices
    solidPlatform = Sprite(image, srcPosition: Vector2(70, 75), srcSize: Vector2(72, 34));
    movingPlatform = Sprite(image, srcPosition: Vector2(150, 75), srcSize: Vector2(76, 32));
    fragilePlatform = Sprite(image, srcPosition: Vector2(240, 75), srcSize: Vector2(74, 32));

    // Powerup items
    spring = Sprite(image, srcPosition: Vector2(12, 175), srcSize: Vector2(32, 32));
    propellerHat = Sprite(image, srcPosition: Vector2(75, 175), srcSize: Vector2(36, 28));
    rocketBooster = Sprite(image, srcPosition: Vector2(130, 240), srcSize: Vector2(36, 36));
  }
}`}</pre>
        </div>
      </div>
    </div>
  );
};
