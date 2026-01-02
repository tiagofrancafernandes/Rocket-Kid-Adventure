
export enum GamePhase {
  MENU = 'MENU',
  LAUNCH = 'LAUNCH',
  ATMOSPHERE = 'ATMOSPHERE',
  SPACE = 'SPACE',
  GAMEOVER = 'GAMEOVER'
}

export type Language = 'en' | 'pt';

export interface GameSettings {
  language: Language;
  volume: number;
  soundEffects: {
    countdown: boolean;
    turbine: boolean;
    jet: boolean;
  };
  autoRestart: boolean;
  obstacleCollision: boolean;
  shooting: boolean;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  size: number;
  weight: number;
  type: 'rock' | 'meteor' | 'asteroid';
  speed: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}
