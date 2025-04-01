import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function StatsScreen() {
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
        
        {/* Ici, vous pourrez ajouter des graphiques, tableaux de scores, etc. */}
        <View style={styles.statsCard}>
          <ThemedText type="subtitle">Parties jouées: 0</ThemedText>
          <ThemedText>Parties gagnées: 0</ThemedText>
          <ThemedText>Taux de victoire: 0%</ThemedText>
          <ThemedText>Meilleur temps (Facile): --:--</ThemedText>
          <ThemedText>Meilleur temps (Moyen): --:--</ThemedText>
          <ThemedText>Meilleur temps (Difficile): --:--</ThemedText>
        </View>
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
  },
});