import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { THEMES } from '@/components/minesweeper/MinesweeperStyles';

// Définition des difficultés (copiée de MinesweeperBoard pour assurer la cohérence)
const DIFFICULTIES = {
  easy: { rows: 9, cols: 9, mines: 10, name: 'Facile' },
  medium: { rows: 16, cols: 16, mines: 40, name: 'Moyen' },
  hard: { rows: 30, cols: 16, mines: 99, name: 'Difficile' },
  oneshot: { rows: 5, cols: 5, mines: 24, name: 'One Shot' }, // Nouveau mode de jeu
};

export default function DifficultySelectScreen() {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);

  const navigateToGame = (difficulty: keyof typeof DIFFICULTIES) => {
    router.push({
      pathname: "/(tabs)/minesweeper",
      params: { 
        difficulty,
        themeId: selectedTheme.id
      }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Démineur', headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Démineur</ThemedText>
          <ThemedText style={styles.subtitle}>Choisissez votre niveau de difficulté</ThemedText>
        </View>
        
        <View style={styles.cards}>
          <TouchableOpacity 
            style={styles.difficultyCard} 
            onPress={() => navigateToGame('easy')}
          >
            <View style={[styles.cardHeader, { backgroundColor: selectedTheme.cellColor }]}>
              <ThemedText style={styles.cardTitle}>Facile</ThemedText>
            </View>
            <View style={styles.cardBody}>
              <ThemedText>Grille 9 × 9</ThemedText>
              <ThemedText>10 mines</ThemedText>
              <ThemedText style={styles.difficultyDescription}>
                Parfait pour les débutants ou une partie rapide.
              </ThemedText>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.difficultyCard} 
            onPress={() => navigateToGame('medium')}
          >
            <View style={[styles.cardHeader, { backgroundColor: selectedTheme.cellColor }]}>
              <ThemedText style={styles.cardTitle}>Moyen</ThemedText>
            </View>
            <View style={styles.cardBody}>
              <ThemedText>Grille 16 × 16</ThemedText>
              <ThemedText>40 mines</ThemedText>
              <ThemedText style={styles.difficultyDescription}>
                Pour les joueurs intermédiaires. Un bon défi.
              </ThemedText>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.difficultyCard} 
            onPress={() => navigateToGame('hard')}
          >
            <View style={[styles.cardHeader, { backgroundColor: selectedTheme.cellColor }]}>
              <ThemedText style={styles.cardTitle}>Difficile</ThemedText>
            </View>
            <View style={styles.cardBody}>
              <ThemedText>Grille 30 × 16</ThemedText>
              <ThemedText>99 mines</ThemedText>
              <ThemedText style={styles.difficultyDescription}>
                Pour les experts. Concentration et stratégie requises!
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.difficultyCard, styles.oneshotCard]} 
            onPress={() => navigateToGame('oneshot')}
          >
            <View style={[styles.cardHeader, { backgroundColor: '#FF3333' }]}>
              <ThemedText style={styles.cardTitle}>One Shot</ThemedText>
            </View>
            <View style={styles.cardBody}>
              <ThemedText>Grille 5 × 5</ThemedText>
              <ThemedText>Une seule case sans mine!</ThemedText>
              <ThemedText style={styles.difficultyDescription}>
                Mode extrême: 100% chance ou malchance!
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.themeSection}>
          <ThemedText type="subtitle" style={styles.themeTitle}>Choisir un thème</ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themesContainer}
          >
            {THEMES.map(theme => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCircle,
                  { backgroundColor: theme.cellColor },
                  selectedTheme.id === theme.id && styles.selectedThemeCircle
                ]}
                onPress={() => setSelectedTheme(theme)}
              >
                {selectedTheme.id === theme.id && (
                  <ThemedText style={styles.themeCheckmark}>✓</ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    marginBottom: 10,
    fontSize: 36,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.8,
    textAlign: 'center',
  },
  cards: {
    width: '100%',
    gap: 20,
  },
  difficultyCard: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    padding: 15,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cardBody: {
    padding: 15,
    alignItems: 'center',
  },
  difficultyDescription: {
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  themeSection: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  themeTitle: {
    marginBottom: 15,
  },
  themesContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  themeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThemeCircle: {
    borderColor: '#fff',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  themeCheckmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsButtonContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  statsButton: {
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  statsButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  oneshotCard: {
    borderColor: '#FF3333',
    borderWidth: 2,
  },
});
