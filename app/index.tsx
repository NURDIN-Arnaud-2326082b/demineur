import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the minesweeper screen by default
  return <Redirect href="/(tabs)/minesweeper" />;
}
