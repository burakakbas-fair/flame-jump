export interface FlutterFile {
  path: string;
  filename: string;
  language: string;
  description: string;
  category: 'core' | 'game' | 'components' | 'managers' | 'config';
  code: string;
}

export const FLUTTER_FILES: FlutterFile[] = [
  {
    path: 'pubspec.yaml',
    filename: 'pubspec.yaml',
    language: 'yaml',
    category: 'config',
    description: 'Flutter dependencies including Flame engine, sensors_plus for tilt controls, and audioplayers.',
    code: `name: flame_jump
description: A 2D endless vertical platformer game built with Flutter and Flame Engine.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'
  flutter: '>=3.19.0'

dependencies:
  flutter:
    sdk: flutter

  # Flame Game Engine (Core, Components, Collisions, Parallax)
  flame: ^1.18.0
  flame_audio: ^2.1.6

  # Device Sensors for tilt/accelerometer controls
  sensors_plus: ^5.0.1

  # State management & persistent high scores
  shared_preferences: ^2.2.3

  # UI icons & styling
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true

  # Asset bundle configuration for sprites, backgrounds, and audio
  assets:
    # --------------------------------------------------------------------------
    # TODO: Place your extracted visual assets in these directories
    # --------------------------------------------------------------------------
    - assets/images/
    - assets/images/spritesheet.png       # Alien character, platforms, items
    - assets/images/bg_grid.png           # Zone 1: Notebook Grid Paper (0-1000m)
    - assets/images/bg_atmosphere.png     # Zone 2: Light Blue Sky Clouds (1000-3000m)
    - assets/images/bg_space.png          # Zone 3: Deep Space Stars (3000m+)
    - assets/audio/jump.wav
    - assets/audio/spring.wav
    - assets/audio/break.wav
    - assets/audio/gameover.wav
`
  },
  {
    path: 'lib/main.dart',
    filename: 'main.dart',
    language: 'dart',
    category: 'core',
    description: 'Flutter entry point, screen orientation lock, and GameWidget with Flutter UI overlays for Menu and GameOver.',
    code: `import 'package:flame/flame.dart';
import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'game/my_game.dart';

void main() async {
  // Ensure Flutter engine bindings are initialized
  WidgetsFlutterBinding.ensureInitialized();

  // Lock the game in portrait mode (standard for vertical endless platformers)
  await Flame.device.setPortrait();
  await Flame.device.fullScreen();

  runApp(const FlameJumpApp());
}

class FlameJumpApp extends StatelessWidget {
  const FlameJumpApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flame Jump',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'Montserrat',
        brightness: Brightness.dark,
      ),
      home: const GameScreen(),
    );
  }
}

class GameScreen extends StatefulWidget {
  const GameScreen({super.key});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  // Instance of our custom FlameGame
  late final MyGame _game;

  @override
  void initState() {
    super.initState();
    _game = MyGame();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Center(
          child: AspectRatio(
            // Keep mobile aspect ratio (9:16) on wider screens / tablets / desktop
            aspectRatio: 9 / 16,
            child: GameWidget<MyGame>(
              game: _game,
              // Flutter overlays mapped to Flame game states
              overlayBuilderMap: {
                'MainMenu': (context, game) => MainMenuOverlay(game: game),
                'GameOver': (context, game) => GameOverOverlay(game: game),
                'PauseMenu': (context, game) => PauseMenuOverlay(game: game),
              },
              initialActiveOverlays: const ['MainMenu'],
            ),
          ),
        ),
      ),
    );
  }
}

// ============================================================================
// MAIN MENU OVERLAY
// ============================================================================
class MainMenuOverlay extends StatelessWidget {
  final MyGame game;
  const MainMenuOverlay({super.key, required this.game});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.65),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'FLAME JUMP',
                style: TextStyle(
                  fontSize: 42,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2,
                  color: Color(0xFF22C55E),
                  shadows: [
                    Shadow(color: Colors.black, blurRadius: 12, offset: Offset(0, 4)),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Endless Vertical Platformer',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white70,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(height: 36),
              // Play Button
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF22C55E),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 6,
                ),
                onPressed: () {
                  game.startGame();
                },
                icon: const Icon(Icons.play_arrow_rounded, size: 32),
                label: const Text(
                  'TAP TO PLAY',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Tilt device or drag horizontally to jump higher!',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Colors.white54),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ============================================================================
// GAME OVER OVERLAY
// ============================================================================
class GameOverOverlay extends StatelessWidget {
  final MyGame game;
  const GameOverOverlay({super.key, required this.game});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.78),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'GAME OVER',
                style: TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFFEF4444),
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: Colors.white12),
                ),
                child: Column(
                  children: [
                    const Text('SCORE', style: TextStyle(color: Colors.white54, fontSize: 13)),
                    Text(
                      '\${game.score}',
                      style: const TextStyle(fontSize: 44, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const Divider(color: Colors.white12, height: 24),
                    const Text('HIGH SCORE', style: TextStyle(color: Colors.white54, fontSize: 13)),
                    Text(
                      '\${game.highScore}',
                      style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: Color(0xFFFBBF24)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF3B82F6),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 36, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: () {
                  game.restartGame();
                },
                icon: const Icon(Icons.refresh_rounded, size: 28),
                label: const Text('PLAY AGAIN', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ============================================================================
// PAUSE MENU OVERLAY
// ============================================================================
class PauseMenuOverlay extends StatelessWidget {
  final MyGame game;
  const PauseMenuOverlay({super.key, required this.game});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.6),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'PAUSED',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => game.resumeGame(),
              child: const Text('RESUME'),
            ),
          ],
        ),
      ),
    );
  }
}
`
  },
  {
    path: 'lib/game/my_game.dart',
    filename: 'my_game.dart',
    language: 'dart',
    category: 'game',
    description: 'The core FlameGame class: World setup, CameraComponent, collision detection, game states, and HUD score rendering.',
    code: `import 'dart:math';
import 'package:flame/camera.dart';
import 'package:flame/components.dart';
import 'package:flame/events.dart';
import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import 'package:sensors_plus/sensors_plus.dart';
import '../components/background.dart';
import '../components/player.dart';
import '../managers/level_manager.dart';

enum GameState { menu, playing, paused, gameOver }

/// The primary FlameGame class coordinating all subsystems:
/// - Physics & Collision Detection (HasCollisionDetection)
/// - Input events (DragCallbacks, TapCallbacks)
/// - Unidirectional upward camera
/// - Dynamic Level Generation & Garbage Collection
/// - Score calculation based on max altitude
class MyGame extends FlameGame
    with HasCollisionDetection, DragCallbacks, TapCallbacks {
  
  // Logical game resolution (virtual viewport)
  static const double gameWidth = 420.0;
  static const double gameHeight = 740.0;

  // Game components
  late final PlayerComponent player;
  late final DynamicBackground background;
  late final LevelManager levelManager;

  // Game States
  GameState state = GameState.menu;

  // Scoring
  int score = 0;
  int highScore = 0;
  double _lowestPlayerY = 0.0; // In Flame coordinate space, upward movement is negative Y

  // Accelerometer subscription for tilt controls
  AccelerometerEvent? _latestSensorEvent;

  // Text Component for HUD Score
  late final TextComponent scoreText;

  @override
  Color backgroundColor() => const Color(0xFF0F172A);

  @override
  Future<void> onLoad() async {
    await super.onLoad();

    // 1. Configure the virtual resolution viewport
    camera.viewport = FixedResolutionViewport(resolution: Vector2(gameWidth, gameHeight));

    // 2. Add dynamic height-based background to the world
    background = DynamicBackground();
    await world.add(background);

    // 3. Initialize Level Manager (spawner + garbage collector)
    levelManager = LevelManager();
    await world.add(levelManager);

    // 4. Initialize Player component
    player = PlayerComponent();
    await world.add(player);

    // 5. Add HUD score overlay at the top
    scoreText = TextComponent(
      text: '0',
      position: Vector2(gameWidth / 2, 40),
      anchor: Anchor.center,
      textRenderer: TextPaint(
        style: const TextStyle(
          color: Color(0xFF1E293B),
          fontSize: 32,
          fontWeight: FontWeight.w900,
          fontFamily: 'Montserrat',
        ),
      ),
    );
    // Add to camera viewport so it stays fixed on the screen
    camera.viewport.add(scoreText);

    // 6. Listen to accelerometer for mobile tilt
    _initAccelerometer();

    // Reset to initial state
    _setupInitialGame();
  }

  void _initAccelerometer() {
    try {
      accelerometerEventStream().listen((event) {
        _latestSensorEvent = event;
      });
    } catch (_) {
      // Sensormanager fallback (e.g., when running on desktop/web without gyro)
    }
  }

  /// Sets up platforms and player for a fresh round
  void _setupInitialGame() {
    score = 0;
    _lowestPlayerY = gameHeight - 120;
    scoreText.text = '0';

    // Position player near bottom center
    player.position = Vector2(gameWidth / 2, gameHeight - 150);
    player.resetVelocity();

    // Center camera on starting view
    camera.moveTo(Vector2(gameWidth / 2, gameHeight / 2));

    // Build the initial platform staircase
    levelManager.reset();
  }

  /// Start playing from Main Menu
  void startGame() {
    state = GameState.playing;
    overlays.remove('MainMenu');
    _setupInitialGame();
  }

  /// Restart round after Game Over
  void restartGame() {
    overlays.remove('GameOver');
    state = GameState.playing;
    _setupInitialGame();
  }

  /// Resume from paused state
  void resumeGame() {
    state = GameState.playing;
    overlays.remove('PauseMenu');
  }

  /// Pause game
  void pauseGame() {
    state = GameState.paused;
    overlays.add('PauseMenu');
  }

  /// Game over sequence
  void onGameOver() {
    if (state == GameState.gameOver) return;
    state = GameState.gameOver;

    if (score > highScore) {
      highScore = score;
    }

    // Show Flutter Game Over Overlay
    overlays.add('GameOver');

    // ------------------------------------------------------------------------
    // TODO: Trigger sound effect:
    // FlameAudio.play('gameover.wav');
    // ------------------------------------------------------------------------
  }

  @override
  void update(double dt) {
    if (state != GameState.playing) {
      return;
    }

    super.update(dt);

    // Accelerometer tilt input handling
    if (_latestSensorEvent != null) {
      // event.x is negative when tilted right on Android/iOS
      final tilt = -_latestSensorEvent!.x;
      player.applyTiltInput(tilt);
    }

    // ------------------------------------------------------------------------
    // UNIDIRECTIONAL CAMERA LOGIC:
    // The camera ONLY moves UP (negative Y in Flame coords). It NEVER moves down.
    // ------------------------------------------------------------------------
    final playerY = player.position.y;
    final cameraCenterY = camera.viewfinder.position.y;
    final topThreshold = cameraCenterY - (gameHeight * 0.15); // Trigger camera follow when above mid

    if (playerY < topThreshold) {
      final diff = topThreshold - playerY;
      camera.viewfinder.position.y -= diff;
    }

    // ------------------------------------------------------------------------
    // SCORE CALCULATION:
    // Altitude-based: increases as player reaches new heights (lower Y value)
    // ------------------------------------------------------------------------
    if (playerY < _lowestPlayerY) {
      _lowestPlayerY = playerY;
      score = ((gameHeight - 150 - _lowestPlayerY) * 1.5).toInt();
      if (score < 0) score = 0;
      scoreText.text = '\$score';

      // Update background theme transition based on score
      background.updateScoreAltitude(score);
    }

    // ------------------------------------------------------------------------
    // GAME OVER CONDITION:
    // If player falls below the bottom edge of the camera view
    // ------------------------------------------------------------------------
    final cameraBottomEdge = camera.viewfinder.position.y + (gameHeight / 2);
    if (player.position.y > cameraBottomEdge + 60) {
      onGameOver();
    }
  }

  // --------------------------------------------------------------------------
  // TOUCH / DRAG CONTROLS
  // --------------------------------------------------------------------------
  @override
  void onDragUpdate(DragUpdateEvent event) {
    if (state == GameState.playing) {
      // Move player horizontally with drag
      player.applyHorizontalDrag(event.localDelta.x);
    }
  }

  @override
  void onTapDown(TapDownEvent event) {
    if (state == GameState.playing) {
      // Tap on left half to move left, right half to move right
      final tapX = event.localPosition.x;
      if (tapX < gameWidth / 2) {
        player.applyTapDirection(-1.0);
      } else {
        player.applyTapDirection(1.0);
      }
    }
  }
}
`
  },
  {
    path: 'lib/components/player.dart',
    filename: 'player.dart',
    language: 'dart',
    category: 'components',
    description: 'Player component with gravity, screen wrapping, horizontal inertia, jumping animation states, and one-way collision logic.',
    code: `import 'package:flame/collisions.dart';
import 'package:flame/components.dart';
import 'package:flutter/material.dart';
import '../game/my_game.dart';
import 'platform.dart';

enum PlayerVisualState { idle, jump, surprised, dizzy }

/// Player Component:
/// Handles gravity, horizontal velocity, screen wrapping, and one-way collision.
class PlayerComponent extends PositionComponent
    with HasGameReference<MyGame>, CollisionCallbacks {
  
  // Physical Constants
  static const double gravity = 980.0;           // Downward acceleration (px/s^2)
  static const double jumpVelocity = -620.0;     // Normal jump upward impulse (px/s)
  static const double springJumpVelocity = -950.0; // Bonus spring jump impulse (px/s)
  static const double maxFallSpeed = 900.0;       // Terminal velocity
  static const double horizontalSpeed = 420.0;   // Left/Right responsiveness
  static const double dragDamping = 0.88;         // Horizontal friction

  // Dynamic Movement Vectors
  Vector2 velocity = Vector2.zero();
  bool isFacingLeft = false;

  // Player hitbox for collision checks
  late final RectangleHitbox playerHitbox;

  // Visual state
  PlayerVisualState visualState = PlayerVisualState.idle;

  // --------------------------------------------------------------------------
  // TODO: Add your SpriteAnimationComponent or SpriteComponent here:
  // late final SpriteAnimation idleAnimation;
  // late final Sprite jumpSprite;
  // --------------------------------------------------------------------------

  PlayerComponent()
      : super(
          size: Vector2(44, 48),
          anchor: Anchor.center,
        );

  @override
  Future<void> onLoad() async {
    await super.onLoad();

    // ------------------------------------------------------------------------
    // COLLISION HITBOX:
    // Sized slightly smaller than the sprite at the player's feet for fair jumps.
    // ------------------------------------------------------------------------
    playerHitbox = RectangleHitbox(
      position: Vector2(6, 32),
      size: Vector2(size.x - 12, 16),
    );
    add(playerHitbox);

    // ------------------------------------------------------------------------
    // TODO: Load custom sprites/animations from uploaded spritesheet:
    // final spriteSheet = await game.images.load('spritesheet.png');
    // ...
    // ------------------------------------------------------------------------
  }

  void resetVelocity() {
    velocity.setZero();
    visualState = PlayerVisualState.idle;
  }

  /// Called from touch drag
  void applyHorizontalDrag(double deltaX) {
    velocity.x += deltaX * 18.0;
    if (velocity.x > horizontalSpeed) velocity.x = horizontalSpeed;
    if (velocity.x < -horizontalSpeed) velocity.x = -horizontalSpeed;
    if (velocity.x != 0) {
      isFacingLeft = velocity.x < 0;
    }
  }

  /// Called from screen tap
  void applyTapDirection(double dir) {
    velocity.x = dir * horizontalSpeed;
    isFacingLeft = dir < 0;
  }

  /// Called from device accelerometer
  void applyTiltInput(double tiltFactor) {
    velocity.x = tiltFactor * 90.0;
    if (velocity.x != 0) {
      isFacingLeft = velocity.x < 0;
    }
  }

  @override
  void update(double dt) {
    super.update(dt);

    // 1. Apply Gravity (downward velocity increases)
    velocity.y += gravity * dt;
    if (velocity.y > maxFallSpeed) {
      velocity.y = maxFallSpeed;
    }

    // 2. Apply Horizontal Friction/Damping
    velocity.x *= dragDamping;

    // 3. Update Position
    position += velocity * dt;

    // 4. Update Visual State based on vertical movement
    if (velocity.y < -200) {
      visualState = PlayerVisualState.jump;
    } else if (velocity.y < 0) {
      visualState = PlayerVisualState.idle;
    } else if (velocity.y > 400) {
      visualState = PlayerVisualState.dizzy;
    } else {
      visualState = PlayerVisualState.surprised;
    }

    // ------------------------------------------------------------------------
    // SCREEN WRAPPING:
    // If the player goes off the left edge, appear on the right edge, & vice versa
    // ------------------------------------------------------------------------
    final halfWidth = size.x / 2;
    if (position.x < -halfWidth) {
      position.x = MyGame.gameWidth + halfWidth;
    } else if (position.x > MyGame.gameWidth + halfWidth) {
      position.x = -halfWidth;
    }
  }

  // --------------------------------------------------------------------------
  // COLLISION DETECTION & ONE-WAY PLATFORM LOGIC:
  // JUMP TRIGGERS ONLY IF:
  // 1. Player is falling downwards (velocity.y > 0)
  // 2. Collision is with a platform top
  // --------------------------------------------------------------------------
  @override
  void onCollision(Set<Vector2> intersectionPoints, PositionComponent other) {
    super.onCollision(intersectionPoints, other);

    if (other is BasePlatform) {
      // Only jump when falling downward!
      if (velocity.y > 0) {
        final playerBottom = position.y + size.y / 2;
        final platformTop = other.position.y - other.size.y / 2;

        // Ensure collision occurs from above (one-way platform mechanic)
        if (playerBottom >= platformTop && (playerBottom - platformTop) <= 24.0) {
          other.onSteppedOn(this);
        }
      }
    }
  }

  /// Triggers standard jump
  void bounce([double force = jumpVelocity]) {
    velocity.y = force;
    // ------------------------------------------------------------------------
    // TODO: Play jump audio:
    // FlameAudio.play('jump.wav');
    // ------------------------------------------------------------------------
  }

  /// Fallback vector canvas rendering (Used until custom sprite images are supplied)
  @override
  void render(Canvas canvas) {
    super.render(canvas);

    // Draw Alien Character (faithfully matching the uploaded green alien sprite)
    canvas.save();
    if (isFacingLeft) {
      canvas.scale(-1, 1);
      canvas.translate(-size.x, 0);
    }

    final paintBody = Paint()..color = const Color(0xFF6EE7B7);
    final paintBelly = Paint()..color = const Color(0xFFA7F3D0);
    final paintOutline = Paint()
      ..color = const Color(0xFF047857)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;

    // Body capsule
    final bodyRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(4, 8, size.x - 8, size.y - 12),
      const Radius.circular(20),
    );
    canvas.drawRRect(bodyRect, paintBody);
    canvas.drawRRect(bodyRect, paintOutline);

    // Belly patch
    final bellyRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(10, 22, size.x - 20, size.y - 28),
      const Radius.circular(12),
    );
    canvas.drawRRect(bellyRect, paintBelly);

    // Antenna
    final pathAntenna = Path()
      ..moveTo(size.x * 0.35, 8)
      ..quadraticBezierTo(size.x * 0.25, 0, size.x * 0.2, 2)
      ..moveTo(size.x * 0.65, 8)
      ..quadraticBezierTo(size.x * 0.75, 0, size.x * 0.8, 2);
    canvas.drawPath(pathAntenna, paintOutline);

    // Cute single large eye
    final eyeCenter = Offset(size.x * 0.58, 20);
    canvas.drawCircle(eyeCenter, 6.5, Paint()..color = Colors.white);
    canvas.drawCircle(eyeCenter, 6.5, paintOutline);
    canvas.drawCircle(eyeCenter + const Offset(1, 0), 3.0, Paint()..color = const Color(0xFF0F172A));
    canvas.drawCircle(eyeCenter + const Offset(2, -1.5), 1.2, Paint()..color = Colors.white);

    // Cute mouth
    final mouthPaint = Paint()
      ..color = const Color(0xFF047857)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round;

    if (visualState == PlayerVisualState.jump) {
      // Big open happy mouth
      final mouthRect = Rect.fromCenter(center: Offset(size.x * 0.58, 30), width: 7, height: 6);
      canvas.drawArc(mouthRect, 0, 3.14, false, mouthPaint);
    } else {
      // Smirk
      canvas.drawLine(Offset(size.x * 0.55, 30), Offset(size.x * 0.68, 30), mouthPaint);
    }

    canvas.restore();
  }
}
`
  },
  {
    path: 'lib/components/platform.dart',
    filename: 'platform.dart',
    language: 'dart',
    category: 'components',
    description: 'Platform hierarchy: BasePlatform, SolidPlatform, MovingPlatform (left-to-right bounce), and FragilePlatform (breaks upon impact).',
    code: `import 'dart:math';
import 'package:flame/collisions.dart';
import 'package:flame/components.dart';
import 'package:flutter/material.dart';
import '../game/my_game.dart';
import 'player.dart';

enum PlatformType { solid, moving, fragile }

/// Abstract base class for all platform variants
abstract class BasePlatform extends PositionComponent
    with HasGameReference<MyGame>, CollisionCallbacks {
  
  final PlatformType type;
  bool isDestroyed = false;

  BasePlatform({
    required this.type,
    required Vector2 position,
    Vector2? size,
  }) : super(
          position: position,
          size: size ?? Vector2(75, 18),
          anchor: Anchor.center,
        );

  @override
  Future<void> onLoad() async {
    await super.onLoad();

    // Top collision hitbox
    add(RectangleHitbox(
      position: Vector2(0, 0),
      size: Vector2(size.x, 8),
    ));
  }

  /// Triggered when the player falls onto the platform
  void onSteppedOn(PlayerComponent player);
}

// ============================================================================
// 1. SOLID PLATFORM (Normal jump)
// ============================================================================
class SolidPlatform extends BasePlatform {
  final bool hasSpring;

  SolidPlatform({
    required super.position,
    this.hasSpring = false,
  }) : super(type: PlatformType.solid);

  @override
  void onSteppedOn(PlayerComponent player) {
    if (hasSpring) {
      player.bounce(PlayerComponent.springJumpVelocity);
      // ----------------------------------------------------------------------
      // TODO: Play spring audio
      // FlameAudio.play('spring.wav');
      // ----------------------------------------------------------------------
    } else {
      player.bounce(PlayerComponent.jumpVelocity);
      // ----------------------------------------------------------------------
      // TODO: Play jump audio
      // FlameAudio.play('jump.wav');
      // ----------------------------------------------------------------------
    }
  }

  @override
  void render(Canvas canvas) {
    super.render(canvas);

    // ------------------------------------------------------------------------
    // TODO: Render with custom sprite:
    // sprite.render(canvas, size: size);
    // ------------------------------------------------------------------------

    // Grass Top Platform (matching uploaded image asset)
    final rrect = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, size.x, size.y),
      const Radius.circular(8),
    );

    // Brown earth base
    canvas.drawRRect(rrect, Paint()..color = const Color(0xFF92400E));

    // Green grass top cap
    final grassRRect = RRect.fromRectAndCorners(
      Rect.fromLTWH(0, 0, size.x, 7),
      topLeft: const Radius.circular(8),
      topRight: const Radius.circular(8),
    );
    canvas.drawRRect(grassRRect, Paint()..color = const Color(0xFF22C55E));

    // Outline
    canvas.drawRRect(
      rrect,
      Paint()
        ..color = const Color(0xFF14532D)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5,
    );

    // Optional Spring on top
    if (hasSpring) {
      final springPaint = Paint()..color = const Color(0xFF94A3B8);
      canvas.drawRect(Rect.fromLTWH(size.x / 2 - 6, -10, 12, 10), springPaint);
      canvas.drawCircle(Offset(size.x / 2, -10), 4, Paint()..color = const Color(0xFFEF4444));
    }
  }
}

// ============================================================================
// 2. MOVING PLATFORM (Horizontal patrol left and right)
// ============================================================================
class MovingPlatform extends BasePlatform {
  double moveSpeed = 120.0;
  int direction = 1; // 1 for right, -1 for left

  MovingPlatform({
    required super.position,
  }) : super(type: PlatformType.moving);

  @override
  void onSteppedOn(PlayerComponent player) {
    player.bounce(PlayerComponent.jumpVelocity);
  }

  @override
  void update(double dt) {
    super.update(dt);

    // Move horizontally
    position.x += direction * moveSpeed * dt;

    // Bounce off screen boundaries
    final halfWidth = size.x / 2;
    if (position.x <= halfWidth) {
      position.x = halfWidth;
      direction = 1;
    } else if (position.x >= MyGame.gameWidth - halfWidth) {
      position.x = MyGame.gameWidth - halfWidth;
      direction = -1;
    }
  }

  @override
  void render(Canvas canvas) {
    super.render(canvas);

    // Blue Futuristic Hover Platform (matching uploaded image asset)
    final rrect = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, size.x, size.y),
      const Radius.circular(9),
    );

    // Cyan base
    canvas.drawRRect(rrect, Paint()..color = const Color(0xFF06B6D4));

    // Glow accent line
    canvas.drawLine(
      Offset(8, size.y / 2),
      Offset(size.x - 8, size.y / 2),
      Paint()
        ..color = const Color(0xFF67E8F9)
        ..strokeWidth = 2.5,
    );

    // Outline
    canvas.drawRRect(
      rrect,
      Paint()
        ..color = const Color(0xFF083344)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5,
    );

    // Bottom thrusters
    final thrusterPaint = Paint()..color = const Color(0xFF38BDF8);
    canvas.drawCircle(Offset(size.x * 0.25, size.y + 3), 3, thrusterPaint);
    canvas.drawCircle(Offset(size.x * 0.75, size.y + 3), 3, thrusterPaint);
  }
}

// ============================================================================
// 3. FRAGILE PLATFORM (Breaks and disappears on step, NO jump)
// ============================================================================
class FragilePlatform extends BasePlatform {
  bool isBreaking = false;
  double breakProgress = 0.0;

  FragilePlatform({
    required super.position,
  }) : super(type: PlatformType.fragile);

  @override
  void onSteppedOn(PlayerComponent player) {
    if (isBreaking) return;
    isBreaking = true;

    // NO jump applied! Player falls through as the platform breaks!
    // ------------------------------------------------------------------------
    // TODO: Play breaking audio
    // FlameAudio.play('break.wav');
    // ------------------------------------------------------------------------
  }

  @override
  void update(double dt) {
    super.update(dt);

    if (isBreaking) {
      breakProgress += dt * 3.5;
      if (breakProgress >= 1.0) {
        // Remove from world when animation finishes
        removeFromParent();
        isDestroyed = true;
      }
    }
  }

  @override
  void render(Canvas canvas) {
    super.render(canvas);

    // Brown Cracked Platform (matching uploaded image asset)
    final paintBase = Paint()..color = Color.lerp(
      const Color(0xFFB45309),
      const Color(0xFF78350F).withOpacity(0.2),
      breakProgress,
    )!;

    final rrect = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, size.x, size.y),
      const Radius.circular(6),
    );
    canvas.drawRRect(rrect, paintBase);

    // Prominent jagged fracture line across the middle
    final crackPaint = Paint()
      ..color = const Color(0xFF451A03)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    final crackPath = Path()
      ..moveTo(size.x * 0.1, 0)
      ..lineTo(size.x * 0.45, size.y * 0.6)
      ..lineTo(size.x * 0.55, size.y * 0.4)
      ..lineTo(size.x * 0.9, size.y);

    canvas.drawPath(crackPath, crackPaint);
  }
}
`
  },
  {
    path: 'lib/components/background.dart',
    filename: 'background.dart',
    language: 'dart',
    category: 'components',
    description: 'Dynamic height-based background with 3 zones: Notebook Grid (0-1000m), Atmosphere (1000-3000m), and Deep Space (3000m+).',
    code: `import 'dart:math';
import 'package:flame/components.dart';
import 'package:flutter/material.dart';
import '../game/my_game.dart';

enum BackgroundZone { notebook, atmosphere, space }

/// Dynamic Vertical Parallax & Height-Based Background Component.
/// Smoothly transitions between:
/// 1. Zone 1 - Ground/Start (0 - 1,000 pts): Notebook Grid Paper texture with "START" marker
/// 2. Zone 2 - Atmosphere (1,000 - 3,000 pts): Light Blue Sky with soft clouds
/// 3. Zone 3 - Deep Space (3,000+ pts): Deep Purple & Dark Blue Space with twinkling stars
class DynamicBackground extends PositionComponent with HasGameReference<MyGame> {
  
  // Height milestones
  static const int zone1MaxScore = 1000;
  static const int zone2MaxScore = 3000;

  // Active zone tracking
  BackgroundZone currentZone = BackgroundZone.notebook;
  double transitionProgress = 0.0; // 0.0 to 1.0 cross-fade between zones

  // Procedural Star data for Space zone
  final List<Offset> _stars = [];
  final Random _rnd = Random();

  DynamicBackground() : super(priority: -100); // Always behind all gameplay elements

  @override
  Future<void> onLoad() async {
    await super.onLoad();
    size = Vector2(MyGame.gameWidth, MyGame.gameHeight);

    // Pre-generate star positions
    for (int i = 0; i < 65; i++) {
      _stars.add(Offset(_rnd.nextDouble() * MyGame.gameWidth, _rnd.nextDouble() * MyGame.gameHeight));
    }

    // ------------------------------------------------------------------------
    // TODO: Replace procedural shaders with loaded ParallaxComponent:
    // final parallax = await game.loadParallaxComponent(
    //   [
    //     ParallaxImageData('bg_space.png'),
    //     ParallaxImageData('bg_atmosphere.png'),
    //     ParallaxImageData('bg_grid.png'),
    //   ],
    //   baseVelocity: Vector2(0, -20),
    // );
    // add(parallax);
    // ------------------------------------------------------------------------
  }

  /// Updates current altitude score from game loop
  void updateScoreAltitude(int score) {
    if (score < zone1MaxScore) {
      currentZone = BackgroundZone.notebook;
      transitionProgress = score / zone1MaxScore;
    } else if (score < zone2MaxScore) {
      currentZone = BackgroundZone.atmosphere;
      transitionProgress = (score - zone1MaxScore) / (zone2MaxScore - zone1MaxScore);
    } else {
      currentZone = BackgroundZone.space;
      transitionProgress = 1.0;
    }
  }

  @override
  void render(Canvas canvas) {
    super.render(canvas);

    // Render based on current altitude zone with cross-fade
    switch (currentZone) {
      case BackgroundZone.notebook:
        _renderNotebookZone(canvas);
        if (transitionProgress > 0.7) {
          // Cross-fade atmosphere over notebook near transition
          final alpha = ((transitionProgress - 0.7) / 0.3).clamp(0.0, 1.0);
          canvas.saveLayer(Rect.fromLTWH(0, 0, size.x, size.y), Paint()..color = Colors.white.withOpacity(alpha));
          _renderAtmosphereZone(canvas);
          canvas.restore();
        }
        break;

      case BackgroundZone.atmosphere:
        _renderAtmosphereZone(canvas);
        if (transitionProgress > 0.7) {
          // Cross-fade space over atmosphere near transition
          final alpha = ((transitionProgress - 0.7) / 0.3).clamp(0.0, 1.0);
          canvas.saveLayer(Rect.fromLTWH(0, 0, size.x, size.y), Paint()..color = Colors.white.withOpacity(alpha));
          _renderSpaceZone(canvas);
          canvas.restore();
        }
        break;

      case BackgroundZone.space:
        _renderSpaceZone(canvas);
        break;
    }
  }

  /// Zone 1: Notebook Grid Paper (0 - 1,000 pts)
  void _renderNotebookZone(Canvas canvas) {
    // Warm creamy paper background
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.x, size.y),
      Paint()..color = const Color(0xFFFAF7EE),
    );

    // Grid lines (subtle cyan/gray grid)
    final gridPaint = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..strokeWidth = 1.0;

    const double step = 24.0;
    for (double x = 0; x < size.x; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.y), gridPaint);
    }
    for (double y = 0; y < size.y; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.x, y), gridPaint);
    }

    // Left red notebook margin line
    final marginPaint = Paint()
      ..color = const Color(0xFFFCA5A5)
      ..strokeWidth = 1.8;
    canvas.drawLine(const Offset(48, 0), Offset(48, size.y), marginPaint);

    // "START" marker at base
    final textPainter = TextPainter(
      text: const TextSpan(
        text: '--- START ---',
        style: TextStyle(
          color: Color(0xFF94A3B8),
          fontSize: 14,
          fontWeight: FontWeight.bold,
          letterSpacing: 2,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    textPainter.paint(canvas, Offset(size.x / 2 - textPainter.width / 2, size.y - 60));
  }

  /// Zone 2: Atmosphere (1,000 - 3,000 pts)
  void _renderAtmosphereZone(Canvas canvas) {
    // Sky blue gradient
    final gradient = const LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [Color(0xFFC7D2FE), Color(0xFFBAE6FD), Color(0xFFE0F2FE)],
    ).createShader(Rect.fromLTWH(0, 0, size.x, size.y));

    canvas.drawRect(Rect.fromLTWH(0, 0, size.x, size.y), Paint()..shader = gradient);

    // Soft clouds
    final cloudPaint = Paint()..color = Colors.white.withOpacity(0.65);
    _drawCloud(canvas, Offset(60, 180), 40, cloudPaint);
    _drawCloud(canvas, Offset(size.x - 70, 360), 55, cloudPaint);
    _drawCloud(canvas, Offset(90, 520), 45, cloudPaint);
  }

  void _drawCloud(Canvas canvas, Offset pos, double radius, Paint paint) {
    canvas.drawCircle(pos, radius, paint);
    canvas.drawCircle(pos + Offset(radius * 0.6, 0), radius * 0.75, paint);
    canvas.drawCircle(pos - Offset(radius * 0.6, 0), radius * 0.7, paint);
  }

  /// Zone 3: Deep Space (3,000+ pts)
  void _renderSpaceZone(Canvas canvas) {
    // Dark deep space gradient
    final spaceGradient = const LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [Color(0xFF030712), Color(0xFF0B0F2A), Color(0xFF1E1B4B)],
    ).createShader(Rect.fromLTWH(0, 0, size.x, size.y));

    canvas.drawRect(Rect.fromLTWH(0, 0, size.x, size.y), Paint()..shader = spaceGradient);

    // Stars
    final starPaint = Paint()..color = Colors.white;
    for (final star in _stars) {
      canvas.drawCircle(star, 1.2, starPaint);
    }

    // Distant glowing moon / celestial sphere
    final moonCenter = Offset(size.x - 60, 90);
    canvas.drawCircle(moonCenter, 22, Paint()..color = const Color(0xFFFEF3C7));
    canvas.drawCircle(
      moonCenter,
      28,
      Paint()
        ..color = const Color(0xFFFEF3C7).withOpacity(0.18)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8),
    );
  }
}
`
  },
  {
    path: 'lib/managers/level_manager.dart',
    filename: 'level_manager.dart',
    language: 'dart',
    category: 'managers',
    description: 'Dynamic platform spawner above camera view and high-efficiency garbage collector for platforms falling below viewport.',
    code: `import 'dart:math';
import 'package:flame/components.dart';
import '../components/platform.dart';
import '../game/my_game.dart';

/// Level Manager:
/// 1. Procedurally spawns platforms above the top of the camera view
/// 2. Manages dynamic platform difficulty ratios (solid vs moving vs fragile)
/// 3. Garbage collects platforms falling below the camera view to maintain 60 FPS
class LevelManager extends Component with HasGameReference<MyGame> {
  
  final Random _rnd = Random();
  final List<BasePlatform> _activePlatforms = [];

  // Spawning intervals
  static const double minPlatformGap = 65.0;
  static const double maxPlatformGap = 115.0;
  double _highestSpawnY = 0.0;

  @override
  Future<void> onLoad() async {
    await super.onLoad();
    reset();
  }

  /// Clears existing platforms and generates initial ladder
  void reset() {
    for (final p in _activePlatforms) {
      p.removeFromParent();
    }
    _activePlatforms.clear();

    // Initial safe platform directly below player
    final startY = MyGame.gameHeight - 80;
    _spawnPlatform(Vector2(MyGame.gameWidth / 2, startY), PlatformType.solid);

    _highestSpawnY = startY;

    // Generate initial platforms up to the top of the screen + buffer
    while (_highestSpawnY > -MyGame.gameHeight) {
      _generateNextPlatform();
    }
  }

  void _generateNextPlatform() {
    final gap = minPlatformGap + _rnd.nextDouble() * (maxPlatformGap - minPlatformGap);
    _highestSpawnY -= gap;

    final xMargin = 55.0;
    final randomX = xMargin + _rnd.nextDouble() * (MyGame.gameWidth - (xMargin * 2));
    final position = Vector2(randomX, _highestSpawnY);

    // Determine platform type based on current score difficulty
    final type = _selectPlatformType(game.score);
    _spawnPlatform(position, type);
  }

  /// Progressively increases difficulty:
  /// - 0 - 1,000 pts: 85% Solid, 10% Moving, 5% Fragile
  /// - 1,000 - 3,000 pts: 60% Solid, 25% Moving, 15% Fragile
  /// - 3,000+ pts: 40% Solid, 40% Moving, 20% Fragile
  PlatformType _selectPlatformType(int score) {
    final roll = _rnd.nextDouble();

    if (score < 1000) {
      if (roll < 0.85) return PlatformType.solid;
      if (roll < 0.95) return PlatformType.moving;
      return PlatformType.fragile;
    } else if (score < 3000) {
      if (roll < 0.60) return PlatformType.solid;
      if (roll < 0.85) return PlatformType.moving;
      return PlatformType.fragile;
    } else {
      if (roll < 0.40) return PlatformType.solid;
      if (roll < 0.80) return PlatformType.moving;
      return PlatformType.fragile;
    }
  }

  void _spawnPlatform(Vector2 position, PlatformType type) {
    BasePlatform platform;

    switch (type) {
      case PlatformType.solid:
        // 10% chance to spawn a spring booster on solid platforms
        final hasSpring = _rnd.nextDouble() < 0.10;
        platform = SolidPlatform(position: position, hasSpring: hasSpring);
        break;

      case PlatformType.moving:
        platform = MovingPlatform(position: position);
        break;

      case PlatformType.fragile:
        platform = FragilePlatform(position: position);
        break;
    }

    _activePlatforms.add(platform);
    game.world.add(platform);
  }

  @override
  void update(double dt) {
    super.update(dt);

    if (game.state != GameState.playing) return;

    final cameraTopEdge = game.camera.viewfinder.position.y - (MyGame.gameHeight / 2);
    final cameraBottomEdge = game.camera.viewfinder.position.y + (MyGame.gameHeight / 2);

    // ------------------------------------------------------------------------
    // 1. DYNAMIC PROCEDURAL SPAWNER:
    // Spawn platforms above camera view ahead of player
    // ------------------------------------------------------------------------
    while (_highestSpawnY > cameraTopEdge - 200) {
      _generateNextPlatform();
    }

    // ------------------------------------------------------------------------
    // 2. GARBAGE COLLECTION:
    // Destroy platforms that fall below the bottom edge of camera view
    // ------------------------------------------------------------------------
    _activePlatforms.removeWhere((platform) {
      final isBelowScreen = platform.position.y > cameraBottomEdge + 50;
      if (isBelowScreen || platform.isDestroyed) {
        platform.removeFromParent();
        return true;
      }
      return false;
    });
  }
}
`
  },
  {
    path: 'lib/components/powerup.dart',
    filename: 'powerup.dart',
    language: 'dart',
    category: 'components',
    description: 'Bonus items: Spring, Propeller Hat, and Rocket Booster matching the uploaded sprite sheet.',
    code: `import 'package:flame/collisions.dart';
import 'package:flame/components.dart';
import 'package:flutter/material.dart';
import '../game/my_game.dart';
import 'player.dart';

enum PowerupType { spring, propellerHat, rocketBooster }

/// Bonus Collectible items matching the uploaded sprite sheet
class PowerupComponent extends PositionComponent
    with HasGameReference<MyGame>, CollisionCallbacks {
  
  final PowerupType type;

  PowerupComponent({
    required this.type,
    required Vector2 position,
  }) : super(
          position: position,
          size: Vector2(24, 24),
          anchor: Anchor.center,
        );

  @override
  Future<void> onLoad() async {
    await super.onLoad();
    add(RectangleHitbox());
  }

  @override
  void onCollision(Set<Vector2> intersectionPoints, PositionComponent other) {
    super.onCollision(intersectionPoints, other);

    if (other is PlayerComponent) {
      _applyEffect(other);
      removeFromParent();
    }
  }

  void _applyEffect(PlayerComponent player) {
    switch (type) {
      case PowerupType.spring:
        player.bounce(-950.0);
        break;
      case PowerupType.propellerHat:
        player.bounce(-1200.0);
        break;
      case PowerupType.rocketBooster:
        player.bounce(-1600.0);
        break;
    }
  }

  @override
  void render(Canvas canvas) {
    super.render(canvas);

    // ------------------------------------------------------------------------
    // TODO: Render custom sprite from uploaded image:
    // sprite.render(canvas, size: size);
    // ------------------------------------------------------------------------
    final paint = Paint()..color = const Color(0xFFFBBF24);
    canvas.drawCircle(Offset(size.x / 2, size.y / 2), size.x / 2, paint);
  }
}
`
  }
];
