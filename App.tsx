import 'react-native-url-polyfill/auto';
import './src/i18n';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import MapScreen from './src/screens/MapScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';
import { colors } from './src/constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
      }}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ title: t('map.yourZone') }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: t('chat.generalChat') }} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('profile.title') }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  // TODO: Replace with real auth state from Supabase
  const isAuthenticated = false;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="Main" component={MainTabs} />
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
