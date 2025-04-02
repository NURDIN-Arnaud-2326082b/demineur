import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useGameStats } from '@/hooks/useGameStats';

// Fonction d'aide pour formater le temps
const formatTime = (seconds: number | null): string => {
  if (seconds === null) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function StatsScreen() {
  const { stats, isLoading, loadStats, resetStats } = useGameStats();
  
  // Recharger les statistiques lorsque l'écran est affiché
  useEffect(() => {
    loadStats();
  }, []);
  
  // Calculer le taux de victoire
  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;

  // Fonction pour demander la confirmation avant de réinitialiser
  const confirmReset = () => {
    Alert.alert(
      "Réinitialiser les statistiques",
      "Êtes-vous sûr de vouloir réinitialiser toutes vos statistiques ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Réinitialiser", 
          onPress: () => resetStats(),
          style: 'destructive' 
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Statistiques' }} />
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Statistiques
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Vos performances au Démineur
        </ThemedText>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#0a7ea4" />
        ) : (
          <View style={styles.statsCard}>
            <ThemedText type="subtitle">Parties jouées: {stats.gamesPlayed}</ThemedText>
            <ThemedText>Parties gagnées: {stats.gamesWon}</ThemedText>
            <ThemedText>Taux de victoire: {winRate}%</ThemedText>
            <ThemedText>Meilleur temps (Facile): {formatTime(stats.bestTimeEasy)}</ThemedText>
            <ThemedText>Meilleur temps (Moyen): {formatTime(stats.bestTimeMedium)}</ThemedText>
            <ThemedText>Meilleur temps (Difficile): {formatTime(stats.bestTimeHard)}</ThemedText>
            {stats.lastGameDate && (
              <ThemedText style={{ marginTop: 10, fontStyle: 'italic' }}>
                Dernière partie: {new Date(stats.lastGameDate).toLocaleDateString()}
              </ThemedText>
            )}
          </View>
        )}
        
        {/* Bouton de réinitialisation avec style adapté pour Android */}
        <TouchableOpacity
          style={[
            styles.resetButton,
            Platform.OS === 'android' && styles.resetButtonAndroid
          ]}
          onPress={confirmReset}
        >
          <ThemedText style={styles.resetButtonText}>
            Réinitialiser les statistiques
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 30,
    fontSize: 16,
    opacity: 0.8,
  },
  statsCard: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    alignItems: 'flex-start',
    gap: 10,
    ...Platform.select({
      android: {
        elevation: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.03)'
      }
    })
  },
  resetButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#d9534f',
    borderRadius: 8,
    alignSelf: 'center',
  },
  resetButtonAndroid: {
    elevation: 2,
    paddingVertical: 10,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});