// Game configuration - Khusus untuk Giselle!

export const GAME_CONFIG = {
  title: 'GISELLE TELAH BERGABUNG!',
  subtitle: 'Sebuah arcade game yang agak mencurigakan romantisnya.',
  playerName: 'Giselle',
  developerName: 'Player 1',

  // Syarat game selesai sebelum bos terbuka
  gamesRequiredForBoss: 4,

  // Syarat pencapaian sebelum ending rahasia
  achievementsRequiredForEnding: 5,

  // Daftar game & urutan bukanya
  games: [
    { id: 'memory', title: 'WHERE DID I PUT MY BRAIN?', subtitle: 'Tebak Kartu Memori', icon: '🧠', unlocked: true },
    { id: 'yaporcap', title: 'YAP OR CAP', subtitle: 'Kuis Fakta vs Fitnah', icon: '🗣️', unlocked: false, requiresGames: 1 },
    { id: 'catch', title: 'CATCH MY ATTENTION', subtitle: 'Tangkap Afeksi', icon: '💫', unlocked: false, requiresGames: 2 },
    { id: 'dodge', title: 'DODGE THE RED FLAGS', subtitle: 'Hindari Overthinking', icon: '🚩', unlocked: false, requiresGames: 2 },
    { id: 'devquiz', title: 'SEBERAPA KENAL KAMU SAMA AKU?', subtitle: 'Kuis Fakta Pacar', icon: '🔍', unlocked: false, requiresGames: 3 },
    { id: 'whack', title: 'WHACK-A-YAP', subtitle: 'Pukul Yapper 2 AM', icon: '🔨', unlocked: false, requiresGames: 3, bonus: true },
    { id: 'spin', title: 'WHEEL OF NONSENSE', subtitle: 'Roda Keberuntungan Halu', icon: '🎡', unlocked: false, requiresGames: 4, bonus: true },
    { id: 'boss', title: 'UJIAN AKHIR HUBUNGAN', subtitle: 'Bos Terakhir', icon: '👾', unlocked: false, requiresGames: 4, isBoss: true },
  ],

  // Warna Retro Arcade
  colors: {
    primary: '#6C63FF',
    secondary: '#FF6B9D',
    accent: '#FFD93D',
    background: '#0a0a2e',
    surface: '#1a1a4e',
    surfaceLight: '#2a2a6e',
    text: '#ffffff',
    textSecondary: '#b0b0d0',
    success: '#4ade80',
    error: '#f87171',
    pastelBlue: '#a5b4fc',
    pastelPink: '#f9a8d4',
    pastelLavender: '#c4b5fd',
    cream: '#fef3c7',
    navy: '#0f0f3d',
  },
};
