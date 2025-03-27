import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import MinesweeperBoard from '@/components/minesweeper/MinesweeperBoard';

export default function MinesweeperScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Démineur' }} />      
      <View style={styles.boardWrapper}>
        <MinesweeperBoard 
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
  title: {
    marginVertical: 20,
  },
  boardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
});