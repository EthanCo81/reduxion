import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, TextInput } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

const TextWithDefaults = Text as typeof Text & {
  defaultProps?: { allowFontScaling?: boolean };
};
const TextInputWithDefaults = TextInput as typeof TextInput & {
  defaultProps?: { allowFontScaling?: boolean };
};

TextWithDefaults.defaultProps = TextWithDefaults.defaultProps ?? {};
TextWithDefaults.defaultProps.allowFontScaling = false;

TextInputWithDefaults.defaultProps = TextInputWithDefaults.defaultProps ?? {};
TextInputWithDefaults.defaultProps.allowFontScaling = false;

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="puzzle" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
