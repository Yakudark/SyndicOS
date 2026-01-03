import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/theme/colors';

const PlaceholderScreen = ({ title }: { title: string }) => (
  <SafeAreaView style={styles.safe}>
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>MODULE EN CONSTRUCTION</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 24,
    color: Colors.cyan,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textMuted,
    fontFamily: 'Orbitron',
  }
});

export default PlaceholderScreen;
