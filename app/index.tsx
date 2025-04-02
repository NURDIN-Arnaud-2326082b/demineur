import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the welcome screen
  return <Redirect href="/welcome" />;
}
