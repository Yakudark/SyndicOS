import { Orbitron_400Regular, Orbitron_700Bold } from '@expo-google-fonts/orbitron';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initializeDb } from '../src/db/client';
import { settingsRepo } from '../src/repositories/settingsRepo';
import { useSettingsStore } from '../src/stores/useSettingsStore';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const loadSettings = useSettingsStore(state => state.loadSettings);

  const [loaded] = useFonts({
    Orbitron: Orbitron_400Regular,
    'Orbitron-Bold': Orbitron_700Bold,
  });

  useEffect(() => {
    const init = async () => {
        try {
            await initializeDb();
            const settings = await settingsRepo.get();
            if (settings) {
                loadSettings({
                    displayName: settings.displayName || 'Agent',
                    monthlyQuotaMinutes: settings.monthlyQuotaMinutes || 2100,
                    themeVariant: (settings.themeVariant as any) || 'cyan',
                });
            }
        } catch (e) {
            console.error("DB Initialization failed", e);
        } finally {
            if (loaded) {
                await SplashScreen.hideAsync();
            }
        }
    };
    init();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="meeting/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="meeting/edit/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="meeting/[id]" options={{ presentation: 'card' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
