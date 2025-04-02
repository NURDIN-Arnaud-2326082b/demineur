import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import MinesweeperBoard from '@/components/minesweeper/MinesweeperBoard';

export default function MinesweeperScreen() {
  // Récupérer les paramètres de difficulté et thème depuis la navigation
  const params = useLocalSearchParams<{
    difficulty: string,
    themeId: string
  }>();
  
  // Valider que la difficulté est une des valeurs acceptées
  const isValidDifficulty = (diff: string | undefined): diff is 'easy' | 'medium' | 'hard' | 'oneshot' => {
    return diff === 'easy' || diff === 'medium' || diff === 'hard' || diff === 'oneshot';
  };
  
  const difficulty = isValidDifficulty(params.difficulty) ? params.difficulty : 'easy';

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Démineur' }} />      
      <View style={styles.boardWrapper}>
        <MinesweeperBoard 
          initialDifficulty={difficulty}
          initialThemeId={params.themeId}
          onGameOver={() => console.log('Game Over')}
          onGameWin={() => console.log('You Win')}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  boardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
});