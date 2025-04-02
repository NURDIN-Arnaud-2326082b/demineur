import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      android_ripple={{ color: 'rgba(128, 128, 128, 0.2)' }}
      onPressIn={(ev) => {
        // Support du retour haptique sur iOS et Android
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (Platform.OS === 'android') {
          try {
            // Utiliser une vibration plus légère sur Android
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              .catch(() => {/* Ignorer les erreurs de haptics sur Android */});
          } catch (error) {
            // Fallback silencieux
          }
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
