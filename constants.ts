
import { Language } from './types';

export const TRANSLATIONS: Record<Language, any> = {
  en: {
    title: 'Rocket Kid Adventure',
    highScore: 'High Score',
    score: 'Score',
    health: 'Health',
    launch: 'Hold UP to Launch!',
    ready: 'Get Ready!',
    go: 'GO!',
    gameOver: 'Game Over!',
    restart: 'Restart Game',
    mainMenu: 'Main Menu',
    settings: 'Settings',
    language: 'Language',
    volume: 'Volume',
    sounds: 'Sound Effects',
    countdownSound: 'Countdown Sound',
    turbineSound: 'Turbine Sound',
    jetSound: 'Jet Sound',
    autoRestart: 'Auto Restart',
    obstacleCollision: 'Obstacle Collision',
    shooting: 'Shooting Enabled',
    play: 'Play',
    save: 'Save',
    back: 'Back'
  },
  pt: {
    title: 'Aventura do Foguete Kid',
    highScore: 'Recorde',
    score: 'Pontos',
    health: 'Saúde',
    launch: 'Segure CIMA para Lançar!',
    ready: 'Preparar!',
    go: 'VAI!',
    gameOver: 'Fim de Jogo!',
    restart: 'Reiniciar',
    mainMenu: 'Menu Principal',
    settings: 'Configurações',
    language: 'Idioma',
    volume: 'Volume',
    sounds: 'Efeitos Sonoros',
    countdownSound: 'Som de Contagem',
    turbineSound: 'Som de Turbina',
    jetSound: 'Som de Jato',
    autoRestart: 'Reinício Automático',
    obstacleCollision: 'Colisão de Obstáculos',
    shooting: 'Tiros Habilitados',
    play: 'Jogar',
    save: 'Salvar',
    back: 'Voltar'
  }
};

export const INITIAL_SETTINGS = {
  language: 'en' as Language,
  volume: 3,
  soundEffects: {
    countdown: true,
    turbine: true,
    jet: true,
  },
  autoRestart: false,
  obstacleCollision: true,
  shooting: true,
};

export const ATMOSPHERE_HEIGHT = 2000;
export const GRAVITY = 0.15;
export const THRUST = 0.4;
export const MAX_ALTITUDE_ATMOSPHERE = 1000;
