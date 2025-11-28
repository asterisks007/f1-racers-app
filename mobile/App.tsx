import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from './src/navigation';
import { AppProvider } from './src/context/AppContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppTheme } from './src/theme';

function App(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = useAppTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <PaperProvider theme={theme}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={theme.colors.background}
          />
          <NavigationContainer />
        </PaperProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

export default App;
