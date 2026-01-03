import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CyberButton } from '../../../src/components/ui/CyberButton';
import { NeonCard } from '../../../src/components/ui/NeonCard';
import { meetingsRepo } from '../../../src/repositories/meetingsRepo';
import { useSettingsStore } from '../../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../../src/theme/colors';

export default function EditMeetingScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const themeVariant = useSettingsStore(state => state.themeVariant);
  const theme = Themes[themeVariant];
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);

  console.log('EditMeeting - ID received:', id, 'Type:', typeof id);

  useEffect(() => {
    const loadMeeting = async () => {
      if (!id) {
        router.back();
        return;
      }
      try {
        const meeting = await meetingsRepo.getById(Number(id));
        if (meeting) {
          setTitle(meeting.title);
          setDescription(meeting.description || '');
          setLocation(meeting.location || '');
          setDate(dayjs(meeting.startAt).format('YYYY-MM-DD'));
          setStartTime(dayjs(meeting.startAt).format('HH:mm'));
          setEndTime(dayjs(meeting.endAt).format('HH:mm'));
        } else {
          Alert.alert('Erreur', 'Réunion introuvable');
          router.back();
        }
      } catch (e) {
        console.error('Error loading meeting:', e);
        Alert.alert('Erreur', 'Impossible de charger la réunion');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    loadMeeting();
  }, [id]);

  const handleSave = async () => {
    if (!title) return Alert.alert('Erreur', 'Titre obligatoire');
    
    try {
        const start = dayjs(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm').toDate();
        const end = dayjs(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm').toDate();

        await meetingsRepo.update(Number(id), {
            title,
            description,
            location,
            startAt: start,
            endAt: end
        });

        Alert.alert('Succès', 'Réunion mise à jour');
        router.back();
    } catch (e) {
        Alert.alert('Erreur', 'Format de date/heure invalide');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la réunion',
      'Voulez-vous vraiment supprimer cette réunion ? Toutes les notes associées seront également supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            await meetingsRepo.delete(Number(id));
            Alert.alert('Succès', 'Réunion supprimée');
            router.replace('/(tabs)/planning');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={[styles.title, { color: theme.primary }]}>CHARGEMENT...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <MaterialCommunityIcons 
                name="arrow-left" 
                size={24} 
                color={theme.primary} 
                onPress={() => router.back()} 
            />
            <Text style={[styles.title, { color: theme.primary }]}>EDIT_PROTOCOL</Text>
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

        <CyberButton title="METTRE À JOUR" onPress={handleSave} />
        <CyberButton title="ANNULER" variant="outline" onPress={() => router.back()} />
        
        <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>ZONE DE DANGER</Text>
            <CyberButton 
                title="SUPPRIMER" 
                variant="outline" 
                onPress={handleDelete} 
                style={{ borderColor: Colors.red }}
                textStyle={{ color: Colors.red }}
            />
        </View>
        
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
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
});
