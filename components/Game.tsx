
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GamePhase, GameSettings, Obstacle, Bullet, Particle } from '../types';
import { TRANSLATIONS, ATMOSPHERE_HEIGHT, GRAVITY, THRUST } from '../constants';
import { audioService } from '../services/audioService';

interface GameProps {
  settings: GameSettings;
  onGameOver: (score: number) => void;
  onExit: () => void;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  phase: number;
  blinkSpeed: number;
}

const Game: React.FC<GameProps> = ({ settings, onGameOver, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = TRANSLATIONS[settings.language];
  
  // Game State Refs (to avoid re-renders in the game loop)
  const stateRef = useRef({
    phase: GamePhase.LAUNCH,
    rocketX: 0,
    rocketY: 0,
    rocketVY: 0,
    rocketVX: 0,
    altitude: 0,
    health: 100,
    score: 0,
    countdown: 0,
    launchHoldTime: 0,
    spaceSpeed: 1,
    obstacles: [] as Obstacle[],
    bullets: [] as Bullet[],
    particles: [] as Particle[],
    lastScoreTime: 0,
    keys: new Set<string>(),
    stars: [] as Star[],
    frame: 0,
  });

  const [uiState, setUiState] = useState({
    health: 100,
    score: 0,
    altitude: 0,
    phase: GamePhase.LAUNCH,
    countdown: 0,
    spaceSpeed: 1
  });

  // Initialize Stars for space
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random(),
        phase: Math.random() * Math.PI * 2,
        blinkSpeed: 0.02 + Math.random() * 0.08
      });
    }
    stateRef.current.stars = stars;
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    stateRef.current.keys.add(e.code);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    stateRef.current.keys.delete(e.code);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const spawnObstacle = (width: number) => {
    const weights = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    const weight = weights[Math.floor(Math.random() * weights.length)];
    const types: Obstacle['type'][] = ['rock', 'meteor', 'asteroid'];
    
    stateRef.current.obstacles.push({
      id: Math.random().toString(36),
      x: Math.random() * (width - 40) + 20,
      y: -50,
      size: 20 + weight * 0.8,
      weight,
      type: types[Math.floor(Math.random() * types.length)],
      speed: 2 + Math.random() * 2 + (stateRef.current.spaceSpeed * 0.5)
    });
  };

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      stateRef.current.particles.push({
        id: Math.random().toString(36),
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color,
        size: Math.random() * 8 + 4
      });
    }
  };

  const update = (ctx: CanvasRenderingContext2D, width: number, height: number, deltaTime: number) => {
    const s = stateRef.current;
    const keys = s.keys;

    // Phase Transitions
    if (s.phase === GamePhase.LAUNCH) {
      if (keys.has('ArrowUp')) {
        s.launchHoldTime += deltaTime;
        const newCountdown = Math.floor(s.launchHoldTime / 1000);
        if (newCountdown !== s.countdown && newCountdown <= 5 && settings.soundEffects.countdown) {
          audioService.playCountdown();
        }
        s.countdown = newCountdown;
        if (s.countdown >= 5) {
          s.phase = GamePhase.ATMOSPHERE;
          s.rocketVY = -THRUST;
          if (settings.soundEffects.turbine) audioService.playLaunch();
        }
      } else {
        s.launchHoldTime = 0;
        s.countdown = 0;
      }
      s.rocketX = width / 2;
      s.rocketY = height - 100;
    }

    if (s.phase === GamePhase.ATMOSPHERE) {
      if (keys.has('ArrowUp')) {
        s.rocketVY -= THRUST;
        // Particle trail
        if (s.frame % 3 === 0) {
          s.particles.push({
            id: Math.random().toString(36),
            x: s.rocketX,
            y: s.rocketY + 40,
            vx: (Math.random() - 0.5) * 2,
            vy: 2 + Math.random() * 3,
            life: 0.6,
            color: 'rgba(255, 165, 0, 0.8)',
            size: 5
          });
        }
      }
      s.rocketVY += GRAVITY;
      s.rocketY += s.rocketVY;
      s.altitude = Math.max(0, (height - 100 - s.rocketY) * 2);

      if (s.rocketY > height - 100) {
        // Explode and game over
        createExplosion(s.rocketX, s.rocketY, '#FF4500');
        if (settings.soundEffects.jet) audioService.playExplosion();
        s.phase = GamePhase.GAMEOVER;
        onGameOver(s.score);
      }

      if (s.altitude >= ATMOSPHERE_HEIGHT) {
        s.phase = GamePhase.SPACE;
        s.rocketY = height - 150;
        s.rocketVY = 0;
      }
    }

    if (s.phase === GamePhase.SPACE) {
      // Horizontal move
      if (keys.has('ArrowLeft')) s.rocketX -= 6;
      if (keys.has('ArrowRight')) s.rocketX += 6;
      s.rocketX = Math.max(40, Math.min(width - 40, s.rocketX));

      // Speed control
      if (keys.has('ArrowUp') && s.frame % 10 === 0) s.spaceSpeed = Math.min(5, s.spaceSpeed + 1);
      if (keys.has('ArrowDown') && s.frame % 10 === 0) s.spaceSpeed = Math.max(1, s.spaceSpeed - 1);

      // Stars movement simulation in space
      s.stars.forEach(star => {
        star.y += (s.spaceSpeed * 2);
        if (star.y > height) {
          star.y = -20;
          star.x = Math.random() * width;
        }
      });

      // Score over time
      const now = Date.now();
      if (now - s.lastScoreTime > 1000) {
        s.score += s.spaceSpeed;
        s.lastScoreTime = now;
      }

      // Shooting - Frequency increased (every 6 frames instead of 15)
      if (settings.shooting && (keys.has('Space') || keys.has('KeyS')) && s.frame % 6 === 0) {
        s.bullets.push({ id: Math.random().toString(36), x: s.rocketX, y: s.rocketY - 20 });
        if (settings.soundEffects.jet) audioService.playShoot();
      }

      // Spawn Obstacles
      if (s.frame % Math.max(20, 60 - s.spaceSpeed * 5) === 0) {
        spawnObstacle(width);
      }

      // Update bullets
      s.bullets = s.bullets.filter(b => {
        b.y -= 10;
        return b.y > -20;
      });

      // Update obstacles
      s.obstacles = s.obstacles.filter(o => {
        o.y += o.speed + (s.spaceSpeed * 1.5);
        
        // Bullet collision
        const bulletHit = s.bullets.find(b => {
          const dist = Math.sqrt((b.x - o.x)**2 + (b.y - o.y)**2);
          return dist < o.size;
        });

        if (bulletHit) {
          s.score += o.weight;
          s.bullets = s.bullets.filter(b => b.id !== bulletHit.id);
          createExplosion(o.x, o.y, '#AAAAAA');
          if (settings.soundEffects.jet) audioService.playSmallExplosion();
          return false;
        }

        // Rocket collision
        if (settings.obstacleCollision) {
          const dist = Math.sqrt((s.rocketX - o.x)**2 + (s.rocketY - o.y)**2);
          if (dist < o.size + 20) {
            s.health -= (o.weight * 0.2);
            createExplosion(o.x, o.y, '#FF0000');
            
            if (s.health <= 0) {
              s.health = 0;
              createExplosion(s.rocketX, s.rocketY, '#FF4500');
              if (settings.soundEffects.jet) audioService.playExplosion();
              s.phase = GamePhase.GAMEOVER;
              onGameOver(s.score);
            } else {
              if (settings.soundEffects.jet) audioService.playCollision();
            }
            return false;
          }
        }

        return o.y < height + 50;
      });
    }

    // Common updates
    s.particles = s.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      return p.life > 0;
    });

    s.frame++;
    
    // Sync UI every few frames
    if (s.frame % 5 === 0) {
      setUiState({
        health: Math.floor(s.health),
        score: s.score,
        altitude: Math.floor(s.altitude),
        phase: s.phase,
        countdown: s.countdown,
        spaceSpeed: s.spaceSpeed
      });
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const s = stateRef.current;
    ctx.clearRect(0, 0, width, height);

    // Background
    if (s.phase === GamePhase.SPACE || (s.phase === GamePhase.ATMOSPHERE && s.altitude > 1500)) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      // Blinking Stars
      s.stars.forEach(star => {
        const blink = 0.4 + Math.sin(s.frame * star.blinkSpeed + star.phase) * 0.6;
        const starAlpha = Math.max(0.1, star.opacity * blink);
        
        if (s.spaceSpeed === 5 && s.phase === GamePhase.SPACE) {
          // Speed streak (risco)
          ctx.strokeStyle = `rgba(255, 255, 255, ${starAlpha})`;
          ctx.lineWidth = star.size * 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(star.x, star.y + 15 + star.size * 5);
          ctx.stroke();
        } else {
          // Normal star (ponto)
          ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else {
      // Sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1E90FF');
      gradient.addColorStop(1, '#87CEEB');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Ground
      if (s.phase === GamePhase.LAUNCH || s.altitude < 200) {
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, height - 20, width, 20);
        // Launch pad
        ctx.fillStyle = '#708090';
        ctx.fillRect(width / 2 - 50, height - 30, 100, 10);
      }
    }

    // Particles
    s.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Obstacles
    s.obstacles.forEach(o => {
      ctx.fillStyle = o.type === 'rock' ? '#8B4513' : o.type === 'meteor' ? '#FF4500' : '#4B0082';
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.size, 0, Math.PI * 2);
      ctx.fill();
      // Detail
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.stroke();
    });

    // Bullets
    s.bullets.forEach(b => {
      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(b.x - 2, b.y - 10, 4, 15);
    });

    // Rocket (Simple Cartoonish)
    if (s.phase !== GamePhase.GAMEOVER) {
      const rx = s.rocketX;
      const ry = s.rocketY;
      
      // Body
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.moveTo(rx, ry - 40);
      ctx.lineTo(rx - 15, ry + 10);
      ctx.lineTo(rx + 15, ry + 10);
      ctx.fill();
      
      // Window
      ctx.fillStyle = '#ADD8E6';
      ctx.beginPath();
      ctx.arc(rx, ry - 10, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Fins
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(rx - 20, ry + 5, 10, 15);
      ctx.fillRect(rx + 10, ry + 5, 10, 15);
    }

    // Countdown Display
    if (s.phase === GamePhase.LAUNCH && s.countdown > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 80px Fredoka One';
      ctx.textAlign = 'center';
      ctx.fillText(s.countdown.toString(), width / 2, height / 2);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    audioService.init();
    audioService.setVolume(settings.volume);

    let lastTime = performance.now();
    let animationId: number;

    const loop = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      update(ctx, canvas.width, canvas.height, deltaTime);
      draw(ctx, canvas.width, canvas.height);

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
      {/* UI Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-20">
        <div className="flex flex-col gap-2">
          <div className="bg-black/50 text-white px-4 py-2 rounded-2xl font-fredoka flex items-center gap-2 border-2 border-yellow-400">
            <span className="text-yellow-400"><i className="fas fa-trophy"></i></span>
            <span>{t.score}: {uiState.score}</span>
          </div>
          <div className="bg-black/50 text-white px-4 py-2 rounded-2xl font-fredoka flex items-center gap-2 border-2 border-blue-400">
            <span className="text-blue-400"><i className="fas fa-mountain"></i></span>
            <span>{uiState.phase === GamePhase.SPACE ? 'SPACE' : `ALT: ${uiState.altitude}m`}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="bg-black/50 text-white px-4 py-2 rounded-2xl font-fredoka min-w-[150px] border-2 border-red-500">
             <div className="flex justify-between items-center mb-1">
               <span className="text-sm">{t.health}</span>
               <span className="text-sm">{uiState.health}%</span>
             </div>
             <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-red-500 transition-all duration-300" 
                 style={{ width: `${uiState.health}%` }}
               />
             </div>
          </div>
          {uiState.phase === GamePhase.SPACE && (
            <div className={`bg-black/50 text-white px-4 py-2 rounded-2xl font-fredoka border-2 ${uiState.spaceSpeed === 5 ? 'border-yellow-400 animate-pulse' : 'border-green-500'}`}>
              SPEED: {uiState.spaceSpeed}
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas */}
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="max-w-full max-h-full aspect-[4/3] bg-sky-300 rounded-lg shadow-2xl border-4 border-white/20"
      />

      {/* Control Prompts */}
      {uiState.phase === GamePhase.LAUNCH && uiState.countdown === 0 && (
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 text-center pointer-events-none animate-bounce">
          <div className="bg-white/90 px-6 py-3 rounded-3xl text-2xl font-fredoka text-blue-600 shadow-xl border-4 border-blue-200">
            {t.launch}
          </div>
        </div>
      )}

      {/* Exit Button */}
      <button 
        onClick={onExit}
        className="absolute bottom-4 right-4 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-all active:scale-95 pointer-events-auto"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Game;
