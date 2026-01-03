import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../src/theme/colors';

export default function TabLayout() {
  const themeVariant = useSettingsStore(state => state.themeVariant);
  const theme = Themes[themeVariant];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: 'rgba(10, 10, 12, 0.95)',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView intensity={30} style={StyleSheet.absoluteFill} tint="dark" />
        ),
        tabBarLabelStyle: {
          fontFamily: 'Orbitron',
          fontSize: 10,
          paddingBottom: 5,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'DASHBOARD',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: 'PLANNING',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-month-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="gestion"
        options={{
          title: 'GESTION',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="briefcase-variant-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
           href: null, // Hide explore tab if we don't use it
        }}
      />
    </Tabs>
  );
}
