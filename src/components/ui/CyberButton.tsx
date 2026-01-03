import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Themes } from '../../theme/colors';

interface CyberButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}

export const CyberButton: React.FC<CyberButtonProps> = ({ 
  title, 
  onPress, 
  style, 
  textStyle,
  variant = 'primary',
  icon
}) => {
  const themeVariant = useSettingsStore((state) => state.themeVariant);
  const theme = Themes[themeVariant];

  const colors = variant === 'primary' 
    ? [theme.primary, theme.secondary] 
    : variant === 'secondary'
    ? [theme.secondary, theme.primary]
    : ['transparent', 'transparent'];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.container, style]}>
      <LinearGradient
        colors={colors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient, 
          variant === 'outline' && { borderWidth: 1, borderColor: theme.primary }
        ]}
      >
        {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
        <Text style={[styles.text, textStyle, variant === 'outline' && { color: theme.primary }]}>
          {title.toUpperCase()}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    color: '#fff',
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    letterSpacing: 2,
  },
});
