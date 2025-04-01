import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

// Types pour les statistiques
export type GameStats = {
  gamesPlayed: number;
  gamesWon: number;
  bestTimeEasy: number | null;
  bestTimeMedium: number | null;
  bestTimeHard: number | null;
  lastGameDate: string | null;
};

// Clé pour AsyncStorage
const STATS_STORAGE_KEY = 'minesweeper_stats';

// Stats par défaut
const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTimeEasy: null,
  bestTimeMedium: null,
  bestTimeHard: null,
  lastGameDate: null,
};

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les statistiques au démarrage
  useEffect(() => {
    loadStats();
  }, []);

  // Charger les statistiques depuis AsyncStorage
  const loadStats = async () => {
    try {
      setIsLoading(true);
      const storedStats = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder les statistiques dans AsyncStorage
  const saveStats = async (newStats: GameStats) => {
    try {
      await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des statistiques:', error);
    }
  };

  // Mettre à jour les statistiques après une partie
  const updateStats = async (won: boolean, difficulty: 'easy' | 'medium' | 'hard', time: number) => {
    const newStats = { ...stats };
    
    // Incrémenter le nombre de parties jouées
    newStats.gamesPlayed += 1;
    
    // Si victoire, mettre à jour le nombre de victoires et vérifier le meilleur temps
    if (won) {
      newStats.gamesWon += 1;
      
      // Mettre à jour le meilleur temps si c'est meilleur ou si c'est le premier
      if (difficulty === 'easy' && (newStats.bestTimeEasy === null || time < newStats.bestTimeEasy)) {
        newStats.bestTimeEasy = time;
      } else if (difficulty === 'medium' && (newStats.bestTimeMedium === null || time < newStats.bestTimeMedium)) {
        newStats.bestTimeMedium = time;
      } else if (difficulty === 'hard' && (newStats.bestTimeHard === null || time < newStats.bestTimeHard)) {
        newStats.bestTimeHard = time;
      }
    }
    
    // Mettre à jour la date de la dernière partie
    newStats.lastGameDate = new Date().toISOString();
    
    // Sauvegarder les nouvelles stats
    await saveStats(newStats);
    
    return newStats;
  };

  return {
    stats,
    isLoading,
    loadStats,
    updateStats,
  };
}
