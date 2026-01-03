import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Colors, Themes } from '../../theme/colors';

interface NeonCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const NeonCard: React.FC<NeonCardProps> = ({ children, style }) => {
  const themeVariant = useSettingsStore((state) => state.themeVariant);
  const theme = Themes[themeVariant];

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 500 }}
      style={[styles.container, style]}
    >
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']}
        style={styles.gradient}
      >
        <View style={[styles.border, { borderColor: theme.primary }]} />
        <View style={styles.content}>{children}</View>
      </LinearGradient>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    marginVertical: 8,
  },
  gradient: {
    padding: 16,
    width: '100%',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 12,
    opacity: 0.3,
  },
  content: {
    zIndex: 1,
  },
});
