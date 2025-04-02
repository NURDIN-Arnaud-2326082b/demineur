import React from 'react';
// Suppression de useEffect qui n'est pas utilisé
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="auto" />
      
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Image 
            source={require('@/assets/images/logodm.png')} 
            style={{ width: 200, height: 200, marginBottom: 20 }}
            resizeMode="contain"
          />
          <ThemedText type="title" style={styles.title}>Démineur</ThemedText>
          <ThemedText style={styles.subtitle}>Arrivez vous à trouver toutes les mines avant l'explosion ?</ThemedText>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => router.push('/(tabs)/difficulty-select')}
          >
            <ThemedText style={styles.playButtonText}>Jouer</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    lineHeight: 62, // Ajouté pour éviter la coupure du texte sur Android
    marginBottom: 16,
    textAlign: 'center',
    paddingVertical: 2, // Petit padding pour s'assurer que le texte a assez d'espace
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 27, // Ajouté pour éviter la coupure du texte sur Android
    textAlign: 'center',
    opacity: 0.8,
    marginHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  playButtonText: {
    color: 'white',
    fontSize: 22,
    lineHeight: 28, // Ajouté pour cohérence avec les autres textes
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
