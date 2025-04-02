import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Platform, ToastAndroid } from 'react-native';

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
  const [storageAvailable, setStorageAvailable] = useState(true);

  // Vérifier la disponibilité du stockage
  useEffect(() => {
    checkStorageAvailability();
  }, []);

  // Charger les statistiques au démarrage
  useEffect(() => {
    if (storageAvailable) {
      loadStats();
    }
  }, [storageAvailable]);

  // Vérifier si le stockage est disponible
  const checkStorageAvailability = async () => {
    try {
      await AsyncStorage.setItem('test_storage', 'test');
      await AsyncStorage.removeItem('test_storage');
      setStorageAvailable(true);
    } catch (error) {
      console.error('Erreur: Stockage non disponible:', error);
      setStorageAvailable(false);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Impossible d\'accéder au stockage', ToastAndroid.LONG);
      }
    }
  };

  // Charger les statistiques depuis AsyncStorage
  const loadStats = async () => {
    if (!storageAvailable) return;
    
    try {
      setIsLoading(true);
      const storedStats = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      if (storedStats) {
        try {
          const parsedStats = JSON.parse(storedStats);
          setStats(parsedStats);
        } catch (parseError) {
          console.error('Erreur lors du parsing des statistiques:', parseError);
          // En cas d'erreur de parsing, on réinitialise les statistiques
          await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(DEFAULT_STATS));
          setStats(DEFAULT_STATS);
          
          if (Platform.OS === 'android') {
            ToastAndroid.show('Statistiques réinitialisées', ToastAndroid.SHORT);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Erreur lors du chargement des statistiques', ToastAndroid.SHORT);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder les statistiques dans AsyncStorage
  const saveStats = async (newStats: GameStats) => {
    if (!storageAvailable) return;
    
    try {
      await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des statistiques:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Erreur lors de la sauvegarde', ToastAndroid.SHORT);
      }
    }
  };

  // Mettre à jour les statistiques après une partie
  const updateStats = async (won: boolean, difficulty: 'easy' | 'medium' | 'hard', time: number) => {
    if (!storageAvailable) return stats;
    
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

  // Réinitialiser les statistiques (utile pour les tests)
  const resetStats = async () => {
    if (!storageAvailable) return;
    
    try {
      await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(DEFAULT_STATS));
      setStats(DEFAULT_STATS);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Statistiques réinitialisées', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des statistiques:', error);
    }
  };

  return {
    stats,
    isLoading,
    loadStats,
    updateStats,
    resetStats,
    storageAvailable
  };
}
