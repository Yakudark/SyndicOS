import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CyberButton } from '../../src/components/ui/CyberButton';
import { NeonCard } from '../../src/components/ui/NeonCard';
import { meetingsRepo } from '../../src/repositories/meetingsRepo';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../src/theme/colors';

export default function NewMeetingScreen() {
  const themeVariant = useSettingsStore(state => state.themeVariant);
  const theme = Themes[themeVariant];
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');

  const handleSave = async () => {
    if (!title) return Alert.alert('Erreur', 'Titre obligatoire');
    
    try {
        const start = dayjs(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm').toDate();
        const end = dayjs(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm').toDate();

        await meetingsRepo.create({
            title,
            description,
            location,
            startAt: start,
            endAt: end
        });

        router.back();
    } catch (e) {
        Alert.alert('Erreur', 'Format de date/heure invalide');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <Text style={[styles.title, { color: theme.primary }]}>NEW_PROTOCOL</Text>
        </View>

        <NeonCard>
          <Text style={styles.label}>TITRE DE LA RÉUNION</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.primary, color: Colors.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Assemblée Générale"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.primary, color: Colors.text, height: 80 }]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="..."
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.label}>LIEU</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.primary, color: Colors.text }]}
            value={location}
            onChangeText={setLocation}
            placeholder="Salle 404 / Matrix"
            placeholderTextColor={Colors.textMuted}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>DATE (YYYY-MM-DD)</Text>
                <TextInput
                    style={[styles.input, { borderColor: theme.primary, color: Colors.text }]}
                    value={date}
                    onChangeText={setDate}
                />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>DEBUT (HH:MM)</Text>
                <TextInput
                    style={[styles.input, { borderColor: theme.primary, color: Colors.text }]}
                    value={startTime}
                    onChangeText={setStartTime}
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.label}>FIN (HH:MM)</Text>
                <TextInput
                    style={[styles.input, { borderColor: theme.primary, color: Colors.text }]}
                    value={endTime}
                    onChangeText={setEndTime}
                />
            </View>
          </View>
        </NeonCard>

        <CyberButton title="INITIALISER" onPress={handleSave} />
        <CyberButton title="ANNULER" variant="outline" onPress={() => router.back()} />
        
        <View style={{ height: 40 }} />
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
  row: {
    flexDirection: 'row',
  }
});
