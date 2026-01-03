import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeonCard } from '../../src/components/ui/NeonCard';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../src/theme/colors';

const TOOLS = [
  {
    id: 'documents',
    title: 'DOCUMENTS',
    icon: 'file-document-outline',
    description: 'PV, Contrats, Factures',
    route: '/gestion/documents',
  },
  {
    id: 'directory',
    title: 'RÉPERTOIRE',
    icon: 'card-account-details-outline',
    description: 'Copros, Fournisseurs',
    route: '/gestion/directory',
  },
  {
    id: 'tasks',
    title: 'TÂCHES',
    icon: 'checkbox-marked-circle-outline',
    description: 'À faire, Rappels',
    route: '/gestion/tasks',
  },
  {
    id: 'finances',
    title: 'FINANCES',
    icon: 'finance',
    description: 'Budget, Dépenses',
    route: '/gestion/finances',
  },
  {
    id: 'notes',
    title: 'NOTES',
    icon: 'notebook-outline',
    description: 'Idées, Brouillons',
    route: '/gestion/notes',
  },
];

export default function GestionScreen() {
  const themeVariant = useSettingsStore(state => state.themeVariant);
  const theme = Themes[themeVariant];
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.primary }]}>CENTRE_DE_CDE</Text>
          <Text style={styles.subtitle}>MODULES DE GESTION</Text>
        </View>

        <View style={styles.grid}>
          {TOOLS.map((tool) => (
            <TouchableOpacity 
              key={tool.id} 
              style={styles.cardContainer}
              onPress={() => router.push(tool.route as any)}
            >
              <NeonCard style={styles.card}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons 
                    name={tool.icon as any} 
                    size={32} 
                    color={theme.primary} 
                  />
                </View>
                <Text style={styles.cardTitle}>{tool.title}</Text>
                <Text style={styles.cardDesc}>{tool.description}</Text>
              </NeonCard>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.purple,
    paddingLeft: 12,
  },
  title: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 24,
    letterSpacing: 2,
  },
  subtitle: {
    color: Colors.textMuted,
    fontFamily: 'Orbitron',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardContainer: {
    width: '48%',
    marginBottom: 12,
  },
  card: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  iconContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 50,
  },
  cardTitle: {
    color: Colors.text,
    fontFamily: 'Orbitron-Bold',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDesc: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  }
});
