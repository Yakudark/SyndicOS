import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CyberButton } from '../../src/components/ui/CyberButton';
import { NeonCard } from '../../src/components/ui/NeonCard';
import { settingsRepo } from '../../src/repositories/settingsRepo';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../src/theme/colors';

export default function SettingsScreen() {
  const { displayName, monthlyQuotaMinutes, themeVariant, setDisplayName, setMonthlyQuota, setThemeVariant } = useSettingsStore();
  const theme = Themes[themeVariant];
  
  const [nameInput, setNameInput] = useState(displayName);
  const [quotaInput, setQuotaInput] = useState((monthlyQuotaMinutes / 60).toString());

  const handleSave = async () => {
    const quotaMins = parseInt(quotaInput) * 60;
    if (isNaN(quotaMins)) return Alert.alert('Erreur', 'Quota invalide');
    
    await settingsRepo.update({ 
      displayName: nameInput, 
      monthlyQuotaMinutes: quotaMins,
      themeVariant: themeVariant 
    });
    
    setDisplayName(nameInput);
    setMonthlyQuota(quotaMins);
    Alert.alert('Succès', 'Paramètres enregistrés');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset complet',
      'Voulez-vous vraiment supprimer toutes les données locales ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            await settingsRepo.resetAll();
            Alert.alert('Reset terminé');
          }
        }
      ]
    );
  };

  const ThemeOption = ({ variant, color }: { variant: any, color: string }) => (
    <TouchableOpacity 
      style={[
        styles.themeBox, 
        { borderColor: color },
        themeVariant === variant && { backgroundColor: color + '20' }
      ]}
      onPress={() => setThemeVariant(variant)}
    >
      <View style={[styles.themeCircle, { backgroundColor: color }]} />
      <Text style={[styles.themeLabel, { color }]}>{variant.toUpperCase()}</Text>
      {themeVariant === variant && (
        <MaterialCommunityIcons name="check-circle" size={20} color={color} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <Text style={[styles.title, { color: theme.primary }]}>CONFIG_SYS</Text>
        </View>

        <NeonCard>
          <Text style={styles.sectionTitle}>PROFIL LOCAL</Text>
          
          <Text style={styles.label}>NOM D'AGENT</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.primary, color: Colors.text }]}
            value={nameInput}
            onChangeText={setNameInput}
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.label}>QUOTA MENSUEL (HEURES)</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.primary, color: Colors.text }]}
            value={quotaInput}
            onChangeText={setQuotaInput}
            keyboardType="numeric"
            placeholderTextColor={Colors.textMuted}
          />
        </NeonCard>

        <NeonCard>
          <Text style={styles.sectionTitle}>INTERFACE VISUELLE</Text>
          <View style={styles.themeGrid}>
            <ThemeOption variant="cyan" color={Colors.cyan} />
            <ThemeOption variant="pink" color={Colors.pink} />
            <ThemeOption variant="purple" color={Colors.purple} />
          </View>
        </NeonCard>

        <CyberButton title="SAUVEGARDER" onPress={handleSave} />
        
        <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>ZONE DE DANGER</Text>
            <CyberButton 
                title="RESET DATA" 
                variant="outline" 
                onPress={handleReset} 
                style={{ borderColor: Colors.red }}
                textStyle={{ color: Colors.red }}
            />
        </View>

        <View style={styles.footer}>
            <Text style={styles.versionLabel}>SYNDIC_OS V1.0.0</Text>
            <Text style={styles.madeBy}>ENCRYPTED PROTOCOL ACTIVE</Text>
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
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 24,
    letterSpacing: 2,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    marginBottom: 20,
  },
  label: {
    color: Colors.textMuted,
    fontFamily: 'Orbitron',
    fontSize: 10,
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Orbitron',
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  themeGrid: {
    gap: 12,
  },
  themeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  themeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  themeLabel: {
    flex: 1,
    fontFamily: 'Orbitron-Bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  dangerZone: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,0,0,0.2)',
    paddingTop: 20,
  },
  dangerTitle: {
    color: Colors.red,
    fontFamily: 'Orbitron-Bold',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    opacity: 0.3,
  },
  versionLabel: {
    color: Colors.text,
    fontFamily: 'Orbitron',
    fontSize: 10,
  },
  madeBy: {
    color: Colors.text,
    fontFamily: 'Orbitron',
    fontSize: 8,
    marginTop: 4,
  }
});
