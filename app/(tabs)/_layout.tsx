import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import {Colors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Tabs.Screen
        name="difficulty-select"
        options={{
          title: 'Niveaux',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistiques',
          tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} />,
        }}
      />
      {/* Suppression de l'onglet démineur */}
      <Tabs.Screen
        name="minesweeper"
        options={{
          href: null, // Cela cache l'onglet mais permet toujours d'accéder à la page via navigation
          title: 'Démineur',
        }}
      />
    </Tabs>
  );
}