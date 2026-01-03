import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Colors, Themes } from '../../theme/colors';

interface StatChipProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
}

export const StatChip: React.FC<StatChipProps> = ({ label, value, subValue, icon }) => {
  const themeVariant = useSettingsStore((state) => state.themeVariant);
  const theme = Themes[themeVariant];

  return (
    <View style={styles.container}>
      <View style={[styles.glow, { backgroundColor: theme.primary }]} />
      <View style={styles.content}>
        <View style={styles.header}>
            <Text style={styles.label}>{label.toUpperCase()}</Text>
            {icon}
        </View>
        <Text style={[styles.value, { color: theme.primary }]}>{value}</Text>
        {subValue && <Text style={styles.subValue}>{subValue}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    minWidth: 100,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  glow: {
    position: 'absolute',
    top: -2,
    left: 12,
    right: 12,
    height: 2,
    opacity: 0.5,
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  content: {
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: Colors.textMuted,
    fontFamily: 'Orbitron',
    fontSize: 10,
    letterSpacing: 1,
  },
  value: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 18,
  },
  subValue: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
